import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

export function AboutTeaser() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="About Us"
              title="About BestRoyal Meridian"
              align="left"
            />
            <p className="mt-6 text-base leading-relaxed text-slate-600">
              BestRoyal Meridian Nursery &amp; Primary School is committed to
              providing a nurturing, safe and academically rigorous foundation
              for every child in our care — from Pre-School through Year Five.
              Guided by our motto, <em>Soaring for Excellence</em>, we combine
              structured learning with character development to prepare
              pupils for lifelong success.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex text-sm font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900"
            >
              Read our full story →
            </Link>
          </div>

          <div className="rounded-2xl bg-navy-950 p-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
              A Message From School Management
            </p>
            <blockquote className="mt-5 font-[family-name:var(--font-display)] text-xl italic leading-relaxed text-navy-50">
              &ldquo;We believe every child deserves an environment where
              curiosity is encouraged, character is built, and excellence is
              the standard. Welcome to the BestRoyal Meridian family.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm font-medium text-navy-200">
              — School Management, BestRoyal Meridian Nursery &amp; Primary School
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
