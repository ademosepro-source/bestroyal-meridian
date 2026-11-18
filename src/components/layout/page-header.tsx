import { Container } from "@/components/ui/container";

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="bg-navy-950 py-20">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{eyebrow}</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-navy-100">{description}</p>}
      </Container>
    </section>
  );
}
