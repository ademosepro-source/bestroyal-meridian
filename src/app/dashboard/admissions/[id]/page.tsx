import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { convertApplicationToStudent, setApplicationStatus } from "@/app/dashboard/admissions/actions";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: application }, { data: classes }] = await Promise.all([
    supabase.from("admission_applications").select("*").eq("id", id).maybeSingle(),
    supabase.from("classes").select("id, name").order("order_index"),
  ]);

  if (!application) notFound();

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          {application.applicant_first_name} {application.applicant_surname}
        </h1>
        <p className="mt-1 text-sm capitalize text-slate-500">Status: {application.status.replace("_", " ")}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div><dt className="text-slate-400">Date of Birth</dt><dd className="text-navy-900">{application.date_of_birth}</dd></div>
          <div><dt className="text-slate-400">Gender</dt><dd className="text-navy-900 capitalize">{application.gender}</dd></div>
          <div><dt className="text-slate-400">Desired Class</dt><dd className="text-navy-900">{(application.desired_class_id && classNameById.get(application.desired_class_id)) || "Not specified"}</dd></div>
          <div><dt className="text-slate-400">Previous School</dt><dd className="text-navy-900">{application.previous_school || "—"}</dd></div>
          <div><dt className="text-slate-400">Parent/Guardian</dt><dd className="text-navy-900">{application.parent_full_name} ({application.parent_relationship})</dd></div>
          <div><dt className="text-slate-400">Phone</dt><dd className="text-navy-900">{application.parent_phone}</dd></div>
          <div><dt className="text-slate-400">Email</dt><dd className="text-navy-900">{application.parent_email}</dd></div>
          <div><dt className="text-slate-400">Address</dt><dd className="text-navy-900">{application.home_address || "—"}</dd></div>
        </dl>
      </div>

      {application.status !== "enrolled" && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
          <h2 className="font-semibold text-navy-900">Review</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={setApplicationStatus.bind(null, id, "under_review", undefined)}>
              <button className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50">
                Mark Under Review
              </button>
            </form>
            <form action={setApplicationStatus.bind(null, id, "accepted", undefined)}>
              <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Accept
              </button>
            </form>
            <form action={setApplicationStatus.bind(null, id, "rejected", undefined)}>
              <button className="rounded-full bg-crimson-600 px-4 py-2 text-sm font-semibold text-white hover:bg-crimson-700">
                Reject
              </button>
            </form>
          </div>

          {application.status === "accepted" && (
            <form
              action={convertApplicationToStudent.bind(null, id, application.desired_class_id)}
              className="mt-5 border-t border-navy-900/5 pt-5"
            >
              <p className="text-sm text-slate-600">
                This creates the student record and, if needed, a parent login account.
              </p>
              <button className="mt-3 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400">
                Enrol as Student
              </button>
            </form>
          )}
        </div>
      )}

      {application.enrolled_student_id && (
        <p className="text-sm text-emerald-700">
          Enrolled — see the{" "}
          <a href={`/dashboard/admin/students/${application.enrolled_student_id}`} className="underline">
            student record
          </a>
          .
        </p>
      )}
    </div>
  );
}
