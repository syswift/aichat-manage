import { supabase } from "src/lib/supabase";

export async function useSupabaseUser() {
  try {
    // Get the current user session
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    if (!currentUserId) return { user: null };
    
    // Query the profiles table with the correct order
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUserId)
      .single();
      
    if (error) throw error;
    
    return { user: data };
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return { user: null, error };
  }
}