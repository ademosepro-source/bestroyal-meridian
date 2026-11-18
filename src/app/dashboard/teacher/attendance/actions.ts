"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { getParentIdsForStudent, notify } from "@/lib/notifications/create";
import type { AttendanceStatus } from "@/types/database";

const VALID_STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

export type FormState = { error: string | null; success: boolean };

export async function submitAttendance(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return { success: false, error: "You are not authorized to perform this action." };
  }

  const classId = String(formData.get("class_id") ?? "");
  const classArmId = String(formData.get("class_arm_id") ?? "") || null;
  const date = String(formData.get("date") ?? "");
  const studentIds = formData.getAll("student_id") as string[];

  if (!classId || !date || studentIds.length === 0) {
    return { success: false, error: "Select a class and date, then mark attendance for at least one student." };
  }

  const supabase = await createClient();
  const { data: currentTerm } = await supabase.from("terms").select("id").eq("is_current", true).maybeSingle();

  const records = studentIds.map((studentId) => {
    const rawStatus = String(formData.get(`status_${studentId}`) ?? "present");
    const status: AttendanceStatus = VALID_STATUSES.includes(rawStatus as AttendanceStatus)
      ? (rawStatus as AttendanceStatus)
      : "present";

    return {
      student_id: studentId,
      class_id: classId,
      class_arm_id: classArmId,
      term_id: currentTerm?.id ?? null,
      date,
      status,
      remarks: String(formData.get(`remarks_${studentId}`) ?? "") || null,
      recorded_by: profile.id,
    };
  });

  const { error } = await supabase
    .from("attendance_records")
    .upsert(records, { onConflict: "student_id,date" });

  if (error) {
    return { success: false, error: "Could not save attendance. Please try again." };
  }

  for (const record of records) {
    if (record.status !== "absent") continue;
    const parentIds = await getParentIdsForStudent(supabase, record.student_id);
    await notify(supabase, parentIds, {
      type: "attendance",
      title: "Your child was marked absent today",
      body: date,
      link: "/dashboard/parent",
    });
  }

  revalidatePath("/dashboard/teacher/attendance");
  return { success: true, error: null };
}
