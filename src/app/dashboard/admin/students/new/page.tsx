import { createClient } from "@/lib/supabase/server";
import { StudentForm } from "@/components/dashboard/student-form";
import { createStudent } from "@/app/dashboard/admin/students/actions";

export default async function NewStudentPage() {
  const supabase = await createClient();

  const [{ data: classes }, { data: classArms }, { data: sessions }] = await Promise.all([
    supabase.from("classes").select("*").order("order_index"),
    supabase.from("class_arms").select("*"),
    supabase.from("academic_sessions").select("*").order("start_date", { ascending: false }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Register New Student
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          An admission number is generated automatically once you save.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
        <StudentForm
          action={createStudent}
          classes={classes ?? []}
          classArms={classArms ?? []}
          sessions={sessions ?? []}
        />
      </div>
    </div>
  );
}
