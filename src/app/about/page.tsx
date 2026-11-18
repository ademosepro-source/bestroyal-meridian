import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { getSchoolSettings } from "@/lib/data/school-settings";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const settings = await getSchoolSettings();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="About Us"
          title="About BestRoyal Meridian Nursery & Primary School"
          description="Our history, vision, mission, core values and leadership will be published here by school management."
        />
        <Container className="py-20">
          <div className="prose prose-slate max-w-3xl">
            <p>
              BestRoyal Meridian Nursery &amp; Primary School is guided by its
              motto, <strong>Soaring for Excellence</strong>, and is committed
              to academic excellence within a safe, nurturing environment.
            </p>
            <p className="text-slate-500">
              Full details on our school history, vision and mission, core
              values, educational philosophy, and leadership profiles will be
              added here once provided by school management — this content is
              editable from the admin dashboard in a later phase.
            </p>
          </div>
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}
