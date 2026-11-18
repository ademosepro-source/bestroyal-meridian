/**
 * Finds students whose birthday is today, by month/day only (never the
 * year — no age is ever exposed by this check). Staff-only by convention:
 * callers should never surface this on a public or parent-facing page.
 */
export function studentsWithBirthdayToday<T extends { date_of_birth: string }>(students: T[], today = new Date()) {
  const month = today.getMonth();
  const day = today.getDate();

  return students.filter((s) => {
    const dob = new Date(s.date_of_birth);
    return dob.getMonth() === month && dob.getDate() === day;
  });
}
