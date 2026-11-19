export type SkillRatings = Record<string, number>;

export const CHARACTER_TRAITS = [
  { key: "punctuality", label: "Punctuality" },
  { key: "diction", label: "Diction" },
  { key: "neatness", label: "Neatness" },
  { key: "honesty", label: "Honesty" },
  { key: "leadership", label: "Leadership" },
  { key: "team_spirit", label: "Team Spirit" },
  { key: "listening", label: "Listening Skills" },
  { key: "perseverance", label: "Perseverance" },
  { key: "politeness", label: "Politeness" },
] as const;

export const PSYCHOMOTOR_SKILLS = [
  { key: "handwriting", label: "Handwriting" },
  { key: "fluency", label: "Verbal Fluency" },
  { key: "sports", label: "Sports & Games" },
  { key: "music", label: "Music & Rhythm" },
] as const;

export const RATING_SCALE = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Very Good" },
  { value: 3, label: "Good" },
  { value: 2, label: "Poor" },
  { value: 1, label: "Very Poor" },
] as const;

export function ratingLabel(value: number | undefined) {
  return RATING_SCALE.find((r) => r.value === value)?.label ?? "—";
}
