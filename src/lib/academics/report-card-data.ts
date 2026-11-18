import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { average, rankByAverage, sumComponentScores } from "@/lib/academics/grading";

type Client = SupabaseClient<Database>;

export type SubjectResult = {
  subjectId: string;
  subjectName: string;
  componentScores: { componentId: string; componentName: string; maxScore: number; score: number }[];
  total: number;
};

export type StudentTermSummary = {
  studentId: string;
  subjects: SubjectResult[];
  overallAverage: number;
  position: number | null;
  classSize: number;
};

/**
 * Computes every student's subject totals and overall average for a
 * class + term directly from exam_scores, and ranks them against their
 * classmates. Nothing here is stored — it is always derived fresh.
 */
export async function getClassTermSummaries(
  supabase: Client,
  classId: string,
  termId: string,
): Promise<Map<string, StudentTermSummary>> {
  const [{ data: students }, { data: scores }, { data: subjects }, { data: components }] = await Promise.all([
    supabase.from("students").select("id").eq("class_id", classId).eq("status", "active"),
    supabase.from("exam_scores").select("student_id, subject_id, component_id, score").eq("class_id", classId).eq("term_id", termId),
    supabase.from("subjects").select("id, name"),
    supabase.from("assessment_components").select("id, name, max_score"),
  ]);

  const subjectNameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));
  const componentById = new Map((components ?? []).map((c) => [c.id, c]));
  const studentIds = (students ?? []).map((s) => s.id);

  const summaries = new Map<string, StudentTermSummary>();

  for (const studentId of studentIds) {
    const studentScores = (scores ?? []).filter((s) => s.student_id === studentId);
    const subjectIds = [...new Set(studentScores.map((s) => s.subject_id))];

    const subjectResults: SubjectResult[] = subjectIds.map((subjectId) => {
      const componentScores = studentScores
        .filter((s) => s.subject_id === subjectId)
        .map((s) => ({
          componentId: s.component_id,
          componentName: componentById.get(s.component_id)?.name ?? "",
          maxScore: componentById.get(s.component_id)?.max_score ?? 0,
          score: Number(s.score),
        }));

      return {
        subjectId,
        subjectName: subjectNameById.get(subjectId) ?? "",
        componentScores,
        total: sumComponentScores(componentScores),
      };
    });

    summaries.set(studentId, {
      studentId,
      subjects: subjectResults,
      overallAverage: average(subjectResults.map((s) => s.total)),
      position: null,
      classSize: studentIds.length,
    });
  }

  const positions = rankByAverage(
    [...summaries.values()]
      .filter((s) => s.subjects.length > 0)
      .map((s) => ({ studentId: s.studentId, average: s.overallAverage })),
  );

  for (const [studentId, position] of positions) {
    const summary = summaries.get(studentId);
    if (summary) summary.position = position;
  }

  return summaries;
}
