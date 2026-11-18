import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { getSchoolSettings } from "@/lib/data/school-settings";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getSchoolSettings();

  const items = [
    { icon: MapPin, label: "Address", value: settings?.address },
    { icon: Phone, label: "Phone", value: settings?.phone },
    { icon: Mail, label: "Email", value: settings?.email },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Contact Us"
          title="Get in Touch"
          description="Our contact form will be added here once the communications module is built. For now, reach us directly using the details below."
        />
        <Container className="py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {items.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-navy-900/10 p-7 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-gold-400">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-600">
                  {label}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {value || "To be published by school management"}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}
