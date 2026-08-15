import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Upserts a registered app user into the backend. Called after signup. */
export const registerAppUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        external_uid: z.string().trim().min(1).max(128),
        full_name: z.string().trim().max(120).optional(),
        email: z.string().trim().email().max(255).optional(),
        phone: z.string().trim().max(32).optional(),
        referral_code: z.string().trim().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("app_users")
      .upsert(
        {
          external_uid: data.external_uid,
          full_name: data.full_name ?? null,
          email: data.email ?? null,
          phone: data.phone ?? null,
          referral_code: data.referral_code ?? null,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "external_uid" },
      )
      .select("id, status")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, status: row.status };
  });

/** Returns the account status for a user so banned users can be locked out. */
export const getAccountStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ external_uid: z.string().trim().min(1).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("app_users")
      .select("status, ban_reason")
      .eq("external_uid", data.external_uid)
      .maybeSingle();
    return { status: row?.status ?? "active", ban_reason: row?.ban_reason ?? null };
  });

/** Public app settings (bank details, payment amount, support + community links). */
export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("app_settings").select("key, value");
  const out: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) out[row.key] = (row.value ?? {}) as Record<string, unknown>;
  return out;
});

/** Stores a payment submission plus its proof screenshot in private storage. */
export const submitPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        external_uid: z.string().trim().min(1).max(128),
        user_name: z.string().trim().max(120).optional(),
        user_email: z.string().trim().email().max(255).optional(),
        amount: z.number().positive().max(100000000),
        currency: z.string().trim().max(8).default("NGN"),
        file_name: z.string().trim().max(200).optional(),
        content_type: z
          .enum(["image/png", "image/jpeg", "image/jpg", "image/webp"])
          .optional(),
        file_base64: z.string().max(9_000_000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let proofPath: string | null = null;

    if (data.file_base64 && data.content_type) {
      const bytes = Uint8Array.from(atob(data.file_base64), (c) => c.charCodeAt(0));
      if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("File too large (max 5MB)");
      const ext = data.content_type.split("/")[1]!.replace("jpeg", "jpg");
      proofPath = `${data.external_uid}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("payment-proofs")
        .upload(proofPath, bytes, { contentType: data.content_type, upsert: false });
      if (upErr) throw new Error(upErr.message);
    }

    const { data: row, error } = await supabaseAdmin
      .from("payments")
      .insert({
        external_uid: data.external_uid,
        user_name: data.user_name ?? null,
        user_email: data.user_email ?? null,
        amount: data.amount,
        currency: data.currency,
        proof_path: proofPath,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/** Stores a withdrawal request for admin review. */
export const submitWithdrawal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        external_uid: z.string().trim().min(1).max(128),
        user_name: z.string().trim().max(120).optional(),
        user_email: z.string().trim().email().max(255).optional(),
        amount: z.number().positive().max(100000000),
        method: z.string().trim().min(1).max(60),
        destination: z.string().trim().max(200).optional(),
        account_name: z.string().trim().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        external_uid: data.external_uid,
        user_name: data.user_name ?? null,
        user_email: data.user_email ?? null,
        amount: data.amount,
        method: data.method,
        destination: data.destination ?? null,
        account_name: data.account_name ?? null,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
