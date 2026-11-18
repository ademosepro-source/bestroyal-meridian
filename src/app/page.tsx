import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { HighlightsStrip } from "@/components/home/highlights-strip";
import { AboutTeaser } from "@/components/home/about-teaser";
import { Programs } from "@/components/home/programs";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { AnnouncementsEvents } from "@/components/home/announcements-events";
import { GalleryTestimonials } from "@/components/home/gallery-testimonials";
import { AdmissionCta } from "@/components/home/admission-cta";
import { ContactTeaser } from "@/components/home/contact-teaser";
import { getSchoolSettings } from "@/lib/data/school-settings";
import { getPublicAnnouncements, getUpcomingEvents } from "@/lib/data/public-content";

export default async function Home() {
  const [settings, announcements, events] = await Promise.all([
    getSchoolSettings(),
    getPublicAnnouncements(),
    getUpcomingEvents(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HighlightsStrip />
        <AboutTeaser />
        <Programs />
        <WhyChooseUs />
        <AnnouncementsEvents announcements={announcements} events={events} />
        <GalleryTestimonials />
        <AdmissionCta />
        <ContactTeaser settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
