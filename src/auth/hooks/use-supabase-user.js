import { supabase } from "src/lib/supabase";

export async function useSupabaseUser() {
  const currentuserId = supabase.auth.user()?.id;
  const user = await supabase.from("profiles").select().single().eq("id", currentuserId);

  return { user };
}