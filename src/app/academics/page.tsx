import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { getSchoolSettings } from "@/lib/data/school-settings";

export const metadata: Metadata = { title: "Academics" };

const STAGES = [
  { name: "Nursery Education", classes: "Creche, Nursery 1, Nursery 2" },
  { name: "Primary Education", classes: "Primary 1 through Primary 6" },
];

export default async function AcademicsPage() {
  const settings = await getSchoolSettings();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Academics"
          title="Our Academic Programme"
          description="Class structure, subjects, teaching approach, academic calendar and assessment methodology."
        />
        <Container className="py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {STAGES.map((stage) => (
              <div key={stage.name} className="rounded-2xl border border-navy-900/10 p-7">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-navy-900">
                  {stage.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{stage.classes}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-sm text-slate-500">
            Detailed subject lists, the academic calendar and assessment
            methodology will be published here by school management, and will
            become fully configurable once the academic management module is
            built.
          </p>
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}
