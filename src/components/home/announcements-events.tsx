import { Bell, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import type { Database } from "@/types/database";

type Announcement = Pick<Database["public"]["Tables"]["announcements"]["Row"], "id" | "title" | "body" | "published_at">;
type SchoolEvent = Pick<Database["public"]["Tables"]["events"]["Row"], "id" | "title" | "start_date" | "end_date" | "location">;

export function AnnouncementsEvents({
  announcements,
  events,
}: {
  announcements: Announcement[];
  events: SchoolEvent[];
}) {
  return (
    <section className="bg-navy-50/60 py-24">
      <Container>
        <SectionHeading
          eyebrow="Stay Informed"
          title="Announcements & Upcoming Events"
          description="Published by school management and visible to parents the moment they go live."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
            <div className="mb-6 flex items-center gap-2 text-navy-800">
              <Bell className="h-5 w-5 text-gold-600" />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                Latest Announcements
              </h3>
            </div>
            {announcements.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No announcements yet"
                description="School management will publish announcements here from the admin dashboard."
              />
            ) : (
              <ul className="space-y-4">
                {announcements.map((a) => (
                  <li key={a.id} className="border-b border-navy-900/5 pb-4 last:border-0 last:pb-0">
                    <p className="font-medium text-navy-900">{a.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{a.body}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(a.published_at).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5">
            <div className="mb-6 flex items-center gap-2 text-navy-800">
              <CalendarDays className="h-5 w-5 text-gold-600" />
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                Upcoming Events
              </h3>
            </div>
            {events.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming events yet"
                description="School events and important dates will appear here once published."
              />
            ) : (
              <ul className="space-y-4">
                {events.map((e) => (
                  <li key={e.id} className="border-b border-navy-900/5 pb-4 last:border-0 last:pb-0">
                    <p className="font-medium text-navy-900">{e.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {e.start_date}{e.end_date && ` – ${e.end_date}`}{e.location && ` · ${e.location}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
