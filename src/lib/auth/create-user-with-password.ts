import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generatePassword } from "@/lib/auth/generate-password";

type CreateUserResult =
  | { ok: true; userId: string; password: string }
  | { ok: false; error: string };

/**
 * Creates an auth user with a system-generated password instead of relying
 * on Supabase's invite-email flow (which needs a configured SMTP provider
 * to actually deliver). The account is active immediately; the generated
 * password is returned so the caller can show it to the admin and/or email
 * it, and the new profile's `must_change_password` (set by the database
 * default) requires the owner to set their own password on first login.
 */
export async function createUserWithPassword(
  admin: SupabaseClient<Database>,
  email: string,
  userMetadata: Record<string, unknown>,
): Promise<CreateUserResult> {
  const password = generatePassword();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message.includes("already been registered")
        ? "A user with this email already exists."
        : "Could not create the account. Please try again.",
    };
  }

  return { ok: true, userId: data.user.id, password };
}
