import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function AdmissionCta() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(40% 60% at 90% 50%, rgba(201,154,59,0.2) 0%, transparent 70%)",
        }}
      />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
          Admissions Open
        </p>
        <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold text-white text-balance sm:text-4xl">
          Give Your Child the BestRoyal Meridian Advantage
        </h2>
        <p className="max-w-xl text-base text-navy-100">
          Submit an admission enquiry today and our admissions team will
          guide you through every step — from application to enrolment.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Button href="/admissions">Start Admission Enquiry</Button>
          <Button href="/contact" variant="outline">
            Talk to Admissions
          </Button>
        </div>
      </Container>
    </section>
  );
}
