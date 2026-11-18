import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely —
 * use ONLY in server actions, after the caller's own role has already been
 * checked, and ONLY for operations regular users cannot perform themselves
 * (e.g. creating a staff or parent login account).
 *
 * Never import this file from a Client Component or expose its key to the browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. See docs/SETUP.md — Phase 2 features that create staff/parent accounts need it.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
