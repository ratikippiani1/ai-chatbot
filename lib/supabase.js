import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is missing");
  }

  if (!supabaseKey) {
    throw new Error("SUPABASE_ANON_KEY is missing");
  }

  return createClient(supabaseUrl, supabaseKey);
}
