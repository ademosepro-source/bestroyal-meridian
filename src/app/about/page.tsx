import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { getSchoolSettings } from "@/lib/data/school-settings";

export const metadata: Metadata = { title: "About Us" };

const CORE_VALUES = [
  "Excellence in Teaching and Learning",
  "Discipline and Responsibility",
  "Creativity and Innovation",
  "Respect for Diversity",
  "Community and Collaboration",
];

export default async function AboutPage() {
  const settings = await getSchoolSettings();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="About Us"
          title="About BestRoyal Meridian Nursery & Primary School"
          description="Our vision, mission, core values and leadership."
        />
        <Container className="py-20">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <div className="prose prose-slate max-w-none">
              <p>
                BestRoyal Meridian Nursery &amp; Primary School, Alagbado, Lagos
                State, is a premier institution committed to the{" "}
                <strong>holistic development of every child</strong>. Our
                approach blends the Nigerian curriculum with modern
                pedagogical methods to ensure pupils receive a strong academic
                foundation while developing critical thinking, social skills
                and emotional intelligence.
              </p>
              <p>
                We believe education should be engaging, inclusive and
                transformative. Our dedicated staff create a caring
                environment where children feel safe, valued and inspired to
                achieve their full potential.
              </p>
            </div>
            <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96">
              <Image
                src="/images/about/holistic-learning.jpg"
                alt="BestRoyal Meridian pupils building together in class"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-20 grid gap-10 sm:grid-cols-2">
            <div className="rounded-2xl bg-navy-50/60 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Vision
              </p>
              <p className="mt-4 text-lg leading-relaxed text-navy-900">
                To be the leading institution nurturing young minds to become
                responsible, knowledgeable, and confident future leaders.
              </p>
            </div>
            <div className="rounded-2xl bg-navy-50/60 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Mission
              </p>
              <ul className="mt-4 space-y-2 text-base leading-relaxed text-navy-900">
                <li>To provide quality education in a safe and inclusive environment.</li>
                <li>To inspire a lifelong love of learning.</li>
                <li>To instill values of integrity, respect, and excellence in every pupil.</li>
              </ul>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
              Core Values
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {CORE_VALUES.map((value) => (
                <span
                  key={value}
                  className="rounded-full border border-navy-900/10 bg-white px-4 py-2 text-sm font-medium text-navy-800"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-20 grid gap-10 rounded-2xl border border-navy-900/10 p-8 sm:grid-cols-[auto_1fr] sm:items-start sm:p-10">
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full sm:h-48 sm:w-48">
              <Image
                src="/images/about/head-teacher.jpg"
                alt="Mrs Abosede Adepoju Adebowale, School Head Teacher"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                School Head&apos;s Address
              </p>
              <blockquote className="mt-4 text-base italic leading-relaxed text-slate-700">
                &ldquo;Thank you all for making BestRoyal Meridian a true home
                of learning. We remain committed to growth, improvement, and
                service — nurturing a new generation of leaders who are
                knowledgeable, disciplined, respectful, and ready to make
                their mark on the world.&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-navy-900">
                Mrs Abosede Adepoju Adebowale
              </p>
              <p className="text-sm text-slate-500">School Head Teacher</p>
            </div>
          </div>
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}
