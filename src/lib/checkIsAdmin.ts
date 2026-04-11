import { supabase } from "@/integrations/supabase/client";

/**
 * Checks whether the currently authenticated user has the 'admin' role.
 * Returns false if not authenticated or role is missing.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !data) return false;
  return true;
}
