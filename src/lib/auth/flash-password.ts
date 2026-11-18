import { cookies } from "next/headers";

const COOKIE_NAME = "flash_generated_password";

/** Stashes a just-generated password for one read, shown on the very next page load. */
export async function setFlashPassword(email: string, password: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify({ email, password }), {
    httpOnly: true,
    maxAge: 60,
    path: "/dashboard",
  });
}

export async function getAndClearFlashPassword(): Promise<{ email: string; password: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  cookieStore.delete(COOKIE_NAME);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
