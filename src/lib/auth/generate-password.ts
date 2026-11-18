const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

/** A random password strong enough for a system-generated staff/parent account. */
export function generatePassword(length = 12): string {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return password;
}
