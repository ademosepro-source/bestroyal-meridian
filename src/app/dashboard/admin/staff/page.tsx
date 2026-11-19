import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { deleteStaffAccount } from "@/app/dashboard/admin/staff/actions";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";

export default async function StaffPage() {
  const supabase = await createClient();
  const currentProfile = await getCurrentProfile();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, staff_number, position, department, created_at")
    .order("created_at", { ascending: false });

  const staffIds = (staff ?? []).map((s) => s.id);
  const { data: profiles } =
    staffIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, email, role").in("id", staffIds)
      : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-navy-900">
            Staff
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage accounts for teachers and other staff.
          </p>
        </div>
        <Link
          href="/dashboard/admin/staff/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" /> Add Staff Member
        </Link>
      </div>

      {!staff || staff.length === 0 ? (
        <EmptyState icon={Users} title="No staff accounts yet" description="Add your first staff member to get started." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5">
          <table className="w-full text-sm">
            <thead className="bg-navy-50/60 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Staff No.</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {staff.map((member) => {
                const profile = profileById.get(member.id);
                const isSelf = currentProfile?.id === member.id;
                return (
                  <tr key={member.id} className="hover:bg-navy-50/40">
                    <td className="px-5 py-3 font-medium text-navy-900">{profile?.full_name}</td>
                    <td className="px-5 py-3 text-slate-600">{member.staff_number}</td>
                    <td className="px-5 py-3 text-slate-600">{profile ? ROLE_LABELS[profile.role] : "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{member.position}</td>
                    <td className="px-5 py-3 text-slate-600">{profile?.email}</td>
                    <td className="px-5 py-3 text-right">
                      {!isSelf && (
                        <form action={deleteStaffAccount.bind(null, member.id)}>
                          <ConfirmDeleteButton
                            confirmMessage={`Delete ${profile?.full_name ?? "this staff member"}'s account? This cannot be undone.`}
                          />
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
