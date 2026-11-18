import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type SchoolSettings = Database["public"]["Tables"]["school_settings"]["Row"];

export function ContactTeaser({ settings }: { settings: SchoolSettings | null }) {
  const items = [
    { icon: MapPin, label: "Visit Us", value: settings?.address || "Address to be published by school management" },
    { icon: Phone, label: "Call Us", value: settings?.phone || "Phone number to be published by school management" },
    { icon: Mail, label: "Email Us", value: settings?.email || "Email address to be published by school management" },
  ];

  return (
    <section className="bg-navy-50/60 py-24">
      <Container>
        <SectionHeading
          eyebrow="Get In Touch"
          title="We'd Love to Hear From You"
          description="Whether you have a question about admissions or school life, our team is ready to help."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-white p-7 text-center shadow-sm ring-1 ring-navy-900/5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-gold-400">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-600">
                {label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button href="/contact">Send Us a Message</Button>
        </div>
      </Container>
    </section>
  );
}
