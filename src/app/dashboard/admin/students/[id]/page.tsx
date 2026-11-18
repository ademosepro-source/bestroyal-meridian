import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentForm } from "@/components/dashboard/student-form";
import { updateStudent, setStudentStatus } from "@/app/dashboard/admin/students/actions";
import { getAndClearFlashPassword } from "@/lib/auth/flash-password";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const flashPassword = await getAndClearFlashPassword();

  const [{ data: student }, { data: classes }, { data: classArms }, { data: sessions }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle(),
    supabase.from("classes").select("*").order("order_index"),
    supabase.from("class_arms").select("*"),
    supabase.from("academic_sessions").select("*"),
  ]);

  if (!student) notFound();

  const boundUpdate = updateStudent.bind(null, id);

  return (
    <div className="max-w-3xl space-y-6">
      {flashPassword && (
        <div className="rounded-2xl bg-gold-500/10 p-6 ring-1 ring-gold-500/30">
          <p className="text-sm font-semibold text-navy-900">
            A parent account was created for {flashPassword.email}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            No email was sent (no email provider is configured yet) — share this temporary
            password with the parent yourself. They&apos;ll be required to set their own password
            the first time they sign in.
          </p>
          <code className="mt-3 inline-block rounded-lg bg-white px-3.5 py-2 text-sm font-semibold tracking-wide text-navy-900">
            {flashPassword.password}
          </code>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            {student.first_name} {student.surname}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Admission No. {student.admission_number}</p>
        </div>

        <div className="flex gap-2">
          {(["active", "withdrawn", "graduated"] as const).map((s) => (
            <form key={s} action={setStudentStatus.bind(null, id, s)}>
              <button
                type="submit"
                disabled={student.status === s}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                  student.status === s
                    ? "bg-navy-900 text-white"
                    : "border border-navy-900/15 text-navy-700 hover:bg-navy-50"
                }`}
              >
                {s}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
        <StudentForm
          action={boundUpdate}
          classes={classes ?? []}
          classArms={classArms ?? []}
          sessions={sessions ?? []}
          student={student}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
