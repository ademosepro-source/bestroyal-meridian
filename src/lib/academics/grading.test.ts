import { describe, expect, it } from "vitest";
import { average, gradeForScore, ordinal, rankByAverage, sumComponentScores } from "./grading";

const bands = [
  { id: "1", grade: "A", min_score: 70, max_score: 100, remark: "Excellent", created_at: "" },
  { id: "2", grade: "B", min_score: 60, max_score: 69, remark: "Very Good", created_at: "" },
  { id: "3", grade: "C", min_score: 50, max_score: 59, remark: "Good", created_at: "" },
  { id: "4", grade: "D", min_score: 40, max_score: 49, remark: "Fair", created_at: "" },
  { id: "5", grade: "F", min_score: 0, max_score: 39, remark: "Fail", created_at: "" },
];

describe("gradeForScore", () => {
  it("picks the matching band at the boundaries", () => {
    expect(gradeForScore(70, bands).grade).toBe("A");
    expect(gradeForScore(69, bands).grade).toBe("B");
    expect(gradeForScore(0, bands).grade).toBe("F");
    expect(gradeForScore(100, bands).grade).toBe("A");
  });

  it("falls back to ungraded when no band configured matches", () => {
    expect(gradeForScore(150, bands).grade).toBe("—");
  });
});

describe("sumComponentScores", () => {
  it("adds up every component", () => {
    expect(sumComponentScores([{ score: 18 }, { score: 19 }, { score: 55 }])).toBe(92);
  });

  it("returns 0 for no scores", () => {
    expect(sumComponentScores([])).toBe(0);
  });
});

describe("average", () => {
  it("averages a list of numbers", () => {
    expect(average([80, 60, 70])).toBeCloseTo(70);
  });

  it("returns 0 for an empty list instead of NaN", () => {
    expect(average([])).toBe(0);
  });
});

describe("rankByAverage", () => {
  it("ranks highest average first", () => {
    const positions = rankByAverage([
      { studentId: "a", average: 90 },
      { studentId: "b", average: 70 },
      { studentId: "c", average: 80 },
    ]);
    expect(positions.get("a")).toBe(1);
    expect(positions.get("c")).toBe(2);
    expect(positions.get("b")).toBe(3);
  });

  it("gives tied scores the same position and skips the next one", () => {
    const positions = rankByAverage([
      { studentId: "a", average: 90 },
      { studentId: "b", average: 90 },
      { studentId: "c", average: 70 },
    ]);
    expect(positions.get("a")).toBe(1);
    expect(positions.get("b")).toBe(1);
    expect(positions.get("c")).toBe(3);
  });
});

describe("ordinal", () => {
  it("formats common cases correctly", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(4)).toBe("4th");
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(21)).toBe("21st");
  });
});
