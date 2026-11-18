import {
  Award,
  HeartHandshake,
  Lightbulb,
  Library,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const REASONS = [
  {
    icon: Award,
    title: "Academic Excellence",
    description:
      "A structured curriculum with clear learning outcomes and regular assessment keeps every pupil progressing confidently.",
  },
  {
    icon: Users2,
    title: "Experienced, Caring Teachers",
    description:
      "Our teachers combine subject expertise with genuine warmth, so every child is known, supported and encouraged.",
  },
  {
    icon: ShieldCheck,
    title: "Safe, Nurturing Environment",
    description:
      "A secure campus and consistent routines give children — and parents — real peace of mind.",
  },
  {
    icon: Library,
    title: "Well-Equipped Learning Spaces",
    description:
      "Classrooms and learning materials are organised to support hands-on, age-appropriate learning at every stage.",
  },
  {
    icon: Lightbulb,
    title: "Holistic Development",
    description:
      "Academics, creativity, physical activity and character formation are woven together, not treated as separate tracks.",
  },
  {
    icon: HeartHandshake,
    title: "Strong Parent Partnership",
    description:
      "Through our parent portal and regular communication, families stay closely connected to their child's progress.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-white py-24">
      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Why Families Choose BestRoyal Meridian"
          description="Soaring for Excellence is more than our motto — it shapes how we teach, care for, and partner with every family."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-navy-900/5 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold text-navy-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
