import { supabase } from "@/integrations/supabase/client";

interface AuditEntry {
  section: string;
  entity_key?: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  action_type?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs an admin action to the audit log table.
 * Silently fails if the table doesn't exist yet or user lacks permission.
 */
export async function logAuditEntry(entry: AuditEntry) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from("admin_audit_log" as any).insert({
      admin_user_id: session.user.id,
      admin_email: session.user.email || "unknown",
      section: entry.section,
      entity_key: entry.entity_key || null,
      field_name: entry.field_name || null,
      old_value: entry.old_value || null,
      new_value: entry.new_value || null,
      action_type: entry.action_type || "update",
      metadata: entry.metadata || null,
    } as any);
  } catch {
    // Silent fail — audit should never block admin operations
  }
}

/**
 * Logs multiple field changes from a settings save operation.
 */
export async function logSettingsChanges(
  section: string,
  changes: Array<{ key: string; oldValue: string; newValue: string }>
) {
  for (const change of changes) {
    if (change.oldValue !== change.newValue) {
      await logAuditEntry({
        section,
        entity_key: change.key,
        field_name: change.key,
        old_value: change.oldValue,
        new_value: change.newValue,
        action_type: "update",
      });
    }
  }
}
