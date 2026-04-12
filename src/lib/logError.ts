import { supabase } from "@/integrations/supabase/client";

/**
 * Logs a system error to the system_errors table.
 * Silently fails — never breaks the application.
 */
export async function logError(
  source: string,
  message: string,
  payload?: any
): Promise<void> {
  try {
    await (supabase.from("system_errors") as any).insert({
      source,
      message,
      payload: payload ? JSON.stringify(payload) : null,
    });
  } catch {
    // Silent fail — logging should never break the app
  }
}
