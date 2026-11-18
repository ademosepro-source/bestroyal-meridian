import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-user";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { logout } from "@/app/login/actions";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/login");
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, link, is_read, created_at")
    .eq("recipient_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen flex-1 bg-navy-50/40 print:bg-white">
      <header className="print:hidden flex items-center justify-between border-b border-navy-900/10 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/brand/school-logo.png"
            alt="BestRoyal Meridian Nursery & Primary School crest"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <div>
            <p className="text-sm font-semibold text-navy-900">BestRoyal Meridian Portal</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[profile.role]}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell notifications={notifications ?? []} />
          <span className="text-sm text-navy-800">{profile.full_name}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-navy-900/15 px-4 py-2 text-xs font-semibold text-navy-800 hover:bg-navy-50"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10 print:p-0">
        <aside className="hidden w-56 shrink-0 lg:block print:hidden">
          <DashboardNav role={profile.role} />
        </aside>
        <main className="min-w-0 flex-1 print:w-full">{children}</main>
      </div>
    </div>
  );
}
