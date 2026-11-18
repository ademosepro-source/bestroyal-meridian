import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { AnnouncementsEvents } from "@/components/home/announcements-events";
import { getSchoolSettings } from "@/lib/data/school-settings";
import { getPublicAnnouncements, getUpcomingEvents } from "@/lib/data/public-content";

export const metadata: Metadata = { title: "News & Events" };

export default async function NewsPage() {
  const [settings, announcements, events] = await Promise.all([
    getSchoolSettings(),
    getPublicAnnouncements(20),
    getUpcomingEvents(20),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="News & Events"
          title="School Announcements & Events"
          description="Published by school management and visible here the moment they go live."
        />
        <AnnouncementsEvents announcements={announcements} events={events} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
