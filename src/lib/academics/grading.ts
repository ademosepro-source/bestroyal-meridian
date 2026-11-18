import type { Database } from "@/types/database";

type GradeBand = Database["public"]["Tables"]["grade_bands"]["Row"];

/** Finds the configured grade band a total score falls into. Never hardcoded. */
export function gradeForScore(total: number, bands: GradeBand[]) {
  const band = bands.find((b) => total >= b.min_score && total <= b.max_score);
  return band ? { grade: band.grade, remark: band.remark } : { grade: "—", remark: "Ungraded" };
}

/** Sums a student's component scores for one subject into a total out of 100. */
export function sumComponentScores(scores: { score: number }[]) {
  return scores.reduce((sum, s) => sum + Number(s.score), 0);
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Ranks students by average score, highest first, with standard competition
 * ranking (ties share a position; the next position skips accordingly).
 */
export function rankByAverage(entries: { studentId: string; average: number }[]) {
  const sorted = [...entries].sort((a, b) => b.average - a.average);
  const positions = new Map<string, number>();
  let lastAverage: number | null = null;
  let lastPosition = 0;

  sorted.forEach((entry, index) => {
    if (lastAverage === null || entry.average !== lastAverage) {
      lastPosition = index + 1;
      lastAverage = entry.average;
    }
    positions.set(entry.studentId, lastPosition);
  });

  return positions;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
