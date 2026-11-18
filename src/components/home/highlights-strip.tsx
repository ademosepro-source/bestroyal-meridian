import { BookOpenCheck, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/container";

const HIGHLIGHTS = [
  { icon: GraduationCap, label: "Nursery & Primary Education" },
  { icon: BookOpenCheck, label: "Structured, Age-Appropriate Curriculum" },
  { icon: ShieldCheck, label: "Safe & Caring Environment" },
  { icon: Users, label: "Dedicated, Qualified Teachers" },
];

export function HighlightsStrip() {
  return (
    <section className="border-b border-navy-900/10 bg-white">
      <Container>
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <p className="text-sm font-medium text-navy-800">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
