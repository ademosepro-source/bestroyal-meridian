import Link from "next/link";
import { Baby, BookOpen, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const PROGRAMS = [
  {
    icon: Baby,
    tag: "Creche · Nursery 1–2",
    title: "Nursery Education",
    description:
      "A warm, play-based introduction to learning that builds early literacy, numeracy, social skills and independence in a safe, caring setting.",
    gradient: "from-gold-500 to-gold-700",
  },
  {
    icon: BookOpen,
    tag: "Primary 1–6",
    title: "Primary Education",
    description:
      "A structured, standards-based curriculum covering core subjects, creative arts and life skills — building strong academic foundations year on year.",
    gradient: "from-navy-600 to-navy-900",
  },
];

export function Programs() {
  return (
    <section className="bg-navy-50/60 py-24">
      <Container>
        <SectionHeading
          eyebrow="Academics"
          title="Our Educational Stages"
          description="Every stage is designed to meet pupils exactly where they are, and carry them confidently to the next."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {PROGRAMS.map(({ icon: Icon, tag, title, description, gradient }) => (
            <div
              key={title}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-lg"
            >
              <div className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon className="h-16 w-16 text-white/90" aria-hidden />
              </div>
              <div className="p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                  {tag}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-navy-900">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
                <Link
                  href="/academics"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:text-navy-900"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
