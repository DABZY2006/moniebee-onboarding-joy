import type { SupabaseClient } from "@supabase/supabase-js";

/** Throws unless the calling user holds the admin role (checked in the DB). */
export async function assertAdmin(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
  return true;
}

export async function writeAudit(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  targetTable: string,
  targetId: string,
  previous: unknown,
  next: unknown,
) {
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_table: targetTable,
    target_id: targetId,
    previous_value: previous as never,
    new_value: next as never,
  });
}
