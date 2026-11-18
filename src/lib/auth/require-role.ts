import { getCurrentProfile } from "@/lib/auth/get-current-user";
import type { Role } from "@/lib/auth/roles";

/**
 * Throws unless the signed-in user has one of the allowed roles. Call this at
 * the top of every server action that uses the admin (service-role) client,
 * since that client bypasses Row Level Security — this check is what stands
 * in its place.
 */
export async function requireRole(...allowed: Role[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error("You are not authorized to perform this action.");
  }
  return profile;
}
