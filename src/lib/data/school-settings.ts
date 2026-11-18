import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SchoolSettings = Database["public"]["Tables"]["school_settings"]["Row"];

/**
 * Reads the public school_settings row. Returns null (never throws) when
 * Supabase hasn't been configured yet or the row doesn't exist — pages fall
 * back to sensible static defaults so the site still renders before setup.
 */
export async function getSchoolSettings(): Promise<SchoolSettings | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("school_settings").select("*").maybeSingle();
    return data;
  } catch {
    return null;
  }
}
