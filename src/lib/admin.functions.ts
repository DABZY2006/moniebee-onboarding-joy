import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * One-time bootstrap of the admin account. Credentials live in server secrets
 * (ADMIN_EMAIL / ADMIN_BOOTSTRAP_PASSWORD) and are never exposed to the client.
 */
export const ensureAdminAccount = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_BOOTSTRAP_PASSWORD"];
  if (!email || !password) return { ready: false };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return { ready: false };
    user = created.user;
  }
  if (!user) return { ready: false };

  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
  return { ready: true };
});

export const getAdminStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const sb = context.supabase;

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const count = async (
      table: "app_users" | "payments" | "withdrawals",
      build: (q: never) => never = (q) => q,
    ) => 0;
    void count;

    const [users, active, banned, upgraded, pay, wd] = await Promise.all([
      sb.from("app_users").select("id", { count: "exact", head: true }),
      sb
        .from("app_users")
        .select("id", { count: "exact", head: true })
        .gte("last_active_at", dayAgo),
      sb.from("app_users").select("id", { count: "exact", head: true }).eq("status", "banned"),
      sb.from("app_users").select("id", { count: "exact", head: true }).eq("upgraded", true),
      sb.from("payments").select("status, amount"),
      sb.from("withdrawals").select("status, amount"),
    ]);

    const payments = pay.data ?? [];
    const withdrawals = wd.data ?? [];
    const sum = (rows: { status: string; amount: number }[], status: string) =>
      rows.filter((r) => r.status === status).reduce((t, r) => t + Number(r.amount), 0);

    return {
      totalUsers: users.count ?? 0,
      activeUsers: active.count ?? 0,
      bannedUsers: banned.count ?? 0,
      upgradedUsers: upgraded.count ?? 0,
      paymentsPending: payments.filter((p) => p.status === "pending").length,
      paymentsApproved: payments.filter((p) => p.status === "approved").length,
      paymentsRejected: payments.filter((p) => p.status === "rejected").length,
      revenueApproved: sum(payments as never, "approved"),
      withdrawalsPending: withdrawals.filter((w) => w.status === "pending").length,
      withdrawalsApproved: withdrawals.filter((w) => w.status === "approved").length,
      withdrawalsCompleted: withdrawals.filter((w) => w.status === "completed").length,
      withdrawalsRejected: withdrawals.filter((w) => w.status === "rejected").length,
      withdrawalsPendingAmount: sum(withdrawals as never, "pending"),
      withdrawalsPaidAmount: sum(withdrawals as never, "completed"),
    };
  });

export const listAppUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
        status: z.enum(["all", "active", "banned"]).default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("app_users")
      .select("id, external_uid, full_name, email, phone, referral_code, status, ban_reason, upgraded, last_active_at, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.search) q = q.or(`full_name.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { users: rows ?? [] };
  });

export const setUserBan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        banned: z.boolean(),
        reason: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("app_users")
      .update({
        status: data.banned ? "banned" : "active",
        ban_reason: data.banned ? (data.reason ?? "Violation of terms") : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase,
      context.userId,
      data.banned ? "ban_user" : "unban_user",
      "app_users",
      data.id,
      null,
      { banned: data.banned, reason: data.reason ?? null },
    );
    return { ok: true };
  });

export const listPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("payments")
      .select("id, external_uid, user_name, user_email, amount, currency, kind, proof_path, status, review_note, reviewed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { payments: rows ?? [] };
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected"]),
        note: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("payments")
      .update({
        status: data.status,
        review_note: data.note ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("external_uid")
      .single();
    if (error) throw new Error(error.message);
    if (data.status === "approved" && row?.external_uid) {
      await context.supabase
        .from("app_users")
        .update({ upgraded: true })
        .eq("external_uid", row.external_uid);
    }
    await writeAudit(
      context.supabase,
      context.userId,
      `payment_${data.status}`,
      "payments",
      data.id,
      null,
      { note: data.note ?? null },
    );
    return { ok: true };
  });

export const getProofUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ path: z.string().trim().min(1).max(300) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("payment-proofs")
      .createSignedUrl(data.path, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

export const listWithdrawals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z
          .enum(["all", "pending", "approved", "rejected", "completed"])
          .default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("withdrawals")
      .select("id, external_uid, user_name, user_email, amount, method, destination, account_name, status, review_note, reviewed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { withdrawals: rows ?? [] };
  });

export const reviewWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected", "completed"]),
        note: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("withdrawals")
      .update({
        status: data.status,
        review_note: data.note ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase,
      context.userId,
      `withdrawal_${data.status}`,
      "withdrawals",
      data.id,
      null,
      { note: data.note ?? null },
    );
    return { ok: true };
  });

export const getAdminSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase.from("app_settings").select("key, value");
    return {
      settings: (data ?? []).map((r) => ({ key: r.key, value: JSON.stringify(r.value ?? {}) })),
    };
  });

export const saveAdminSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.enum(["bank", "payment", "support", "community"]),
        value: z.string().max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, writeAudit } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const parsed = JSON.parse(data.value) as Record<string, unknown>;
    const { error } = await context.supabase
      .from("app_settings")
      .upsert({ key: data.key, value: parsed as never, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    await writeAudit(
      context.supabase,
      context.userId,
      "update_settings",
      "app_settings",
      data.key,
      null,
      parsed as never,
    );
    return { ok: true };
  });

export const listAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { data } = await context.supabase
      .from("admin_audit_log")
      .select("id, action, target_table, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    return { entries: data ?? [] };
  });

export const amIAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: data === true };
  });
