import { createClient } from "@/lib/supabase/server";
import {
  assignClassTeacher,
  assignSubjectTeacher,
  createClassArm,
  createClassRecord,
  createSubject,
} from "@/app/dashboard/admin/classes/actions";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-500";
const labelClass = "block text-xs font-medium text-navy-700";
const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5";
const submitClass = "mt-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800";

export default async function ClassesPage() {
  const supabase = await createClient();

  const [{ data: classes }, { data: arms }, { data: subjects }, { data: teachers }, { data: subjectTeachers }, { data: classTeachers }] =
    await Promise.all([
      supabase.from("classes").select("*").order("order_index"),
      supabase.from("class_arms").select("*"),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("profiles").select("id, full_name").eq("role", "teacher").order("full_name"),
      supabase.from("subject_teachers").select("*"),
      supabase.from("teacher_class_assignments").select("*"),
    ]);

  const classNameById = new Map((classes ?? []).map((c) => [c.id, c.name]));
  const subjectNameById = new Map((subjects ?? []).map((s) => [s.id, s.name]));
  const teacherNameById = new Map((teachers ?? []).map((t) => [t.id, t.full_name]));
  const armNameById = new Map((arms ?? []).map((a) => [a.id, a.name]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
          Classes & Subjects
        </h1>
        <p className="mt-1 text-sm text-slate-500">Manage the class structure, subjects and teaching assignments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Classes</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(classes ?? []).map((c) => (
              <li key={c.id} className="flex justify-between py-2">
                <span>{c.name}</span>
                <span className="text-slate-400 capitalize">{c.level}</span>
              </li>
            ))}
          </ul>
          <form action={createClassRecord} className="mt-4 grid grid-cols-3 gap-3 border-t border-navy-900/5 pt-4">
            <div className="col-span-1">
              <label className={labelClass}>Name</label>
              <input name="name" required className={inputClass} placeholder="Primary 7" />
            </div>
            <div>
              <label className={labelClass}>Level</label>
              <select name="level" required className={inputClass}>
                <option value="nursery">Nursery</option>
                <option value="primary">Primary</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Order</label>
              <input name="order_index" type="number" min={1} required className={inputClass} defaultValue={(classes?.length ?? 0) + 1} />
            </div>
            <button type="submit" className={`${submitClass} col-span-3`}>Add Class</button>
          </form>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Class Arms</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(arms ?? []).map((a) => (
              <li key={a.id} className="flex justify-between py-2">
                <span>{classNameById.get(a.class_id)}</span>
                <span className="text-slate-400">Arm {a.name}</span>
              </li>
            ))}
          </ul>
          <form action={createClassArm} className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-900/5 pt-4">
            <select name="class_id" required className={inputClass}>
              <option value="">Select class</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="name" required placeholder="B" className={inputClass} />
            <button type="submit" className={`${submitClass} col-span-2`}>Add Arm</button>
          </form>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Subjects</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(subjects ?? []).map((s) => (
              <li key={s.id} className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
                {s.name}
              </li>
            ))}
          </ul>
          <form action={createSubject} className="mt-4 grid grid-cols-3 gap-3 border-t border-navy-900/5 pt-4">
            <input name="name" required placeholder="Subject name" className="col-span-2 rounded-lg border border-navy-900/15 px-3 py-2 text-sm" />
            <input name="code" placeholder="Code" className={inputClass} />
            <button type="submit" className={`${submitClass} col-span-3`}>Add Subject</button>
          </form>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-navy-900">Class Teacher Assignments</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(classTeachers ?? []).map((t) => (
              <li key={t.id} className="flex justify-between py-2">
                <span>
                  {classNameById.get(t.class_id)}
                  {t.class_arm_id ? ` – Arm ${armNameById.get(t.class_arm_id)}` : ""}
                </span>
                <span className="text-slate-500">
                  {teacherNameById.get(t.teacher_id)} {t.is_class_teacher && "(Class Teacher)"}
                </span>
              </li>
            ))}
          </ul>
          <form action={assignClassTeacher} className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-900/5 pt-4">
            <select name="teacher_id" required className={inputClass}>
              <option value="">Select teacher</option>
              {(teachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
            <select name="class_id" required className={inputClass}>
              <option value="">Select class</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select name="class_arm_id" className={inputClass}>
              <option value="">Any arm</option>
              {(arms ?? []).map((a) => (
                <option key={a.id} value={a.id}>{classNameById.get(a.class_id)} – {a.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" name="is_class_teacher" /> Class teacher
            </label>
            <button type="submit" className={`${submitClass} col-span-2`}>Assign</button>
          </form>
        </div>

        <div className={`${cardClass} lg:col-span-2`}>
          <h2 className="font-semibold text-navy-900">Subject Teacher Assignments</h2>
          <ul className="mt-3 divide-y divide-navy-900/5 text-sm">
            {(subjectTeachers ?? []).map((st) => (
              <li key={st.id} className="flex justify-between py-2">
                <span>{classNameById.get(st.class_id)} – {subjectNameById.get(st.subject_id)}</span>
                <span className="text-slate-500">{teacherNameById.get(st.teacher_id)}</span>
              </li>
            ))}
          </ul>
          <form action={assignSubjectTeacher} className="mt-4 grid grid-cols-3 gap-3 border-t border-navy-900/5 pt-4">
            <select name="teacher_id" required className={inputClass}>
              <option value="">Select teacher</option>
              {(teachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
            <select name="class_id" required className={inputClass}>
              <option value="">Select class</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select name="subject_id" required className={inputClass}>
              <option value="">Select subject</option>
              {(subjects ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button type="submit" className={`${submitClass} col-span-3`}>Assign</button>
          </form>
        </div>
      </div>
    </div>
  );
}
