import type { BasicSupabaseClient } from "../types/supabase.js";

export async function getUser(sb: BasicSupabaseClient): Promise<AuthUser> {
  const { data, error } = await sb.auth.getUser();
  if (!error && data.user) {
    return {
        id: data.user.id,
        email: data.user.email as string,
    };
  }
  throw error;
}