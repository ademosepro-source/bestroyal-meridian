import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      {/* Decorative glow — stands in for a photographic banner until real
          school photography is supplied. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 10%, rgba(201,154,59,0.25) 0%, transparent 60%), radial-gradient(50% 40% at 10% 90%, rgba(47,87,144,0.45) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container className="relative py-28 sm:py-36">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Soaring for Excellence
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] text-white text-balance sm:text-5xl lg:text-6xl">
            Building Bright Minds. Inspiring Future Leaders.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100">
            BestRoyal Meridian Nursery &amp; Primary School nurtures every child
            through a caring, structured and academically rich environment —
            from their very first day in Creche to graduation in Primary 6.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/admissions">Apply for Admission</Button>
            <Button href="/about" variant="outline">
              Discover Our School
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
