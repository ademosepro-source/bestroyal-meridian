import Image from "next/image";
import Link from "next/link";
import { Link2, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { Database } from "@/types/database";

type SchoolSettings = Database["public"]["Tables"]["school_settings"]["Row"];

const FOOTER_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "News & Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter / X",
};

export function Footer({ settings }: { settings: SchoolSettings | null }) {
  const year = new Date().getFullYear();
  const socialLinks = settings?.social_links ?? {};

  return (
    <footer className="bg-navy-950 text-navy-100">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/brand/school-logo.png"
              alt="BestRoyal Meridian Nursery & Primary School crest"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <span className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
              BestRoyal Meridian
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-300">
            {settings?.motto ?? "Soaring for Excellence"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              <span>{settings?.address || "Address available soon"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold-400" />
              <span>{settings?.phone || "Phone number available soon"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold-400" />
              <span>{settings?.email || "Email available soon"}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">
            Portal Access
          </h3>
          <p className="mt-4 text-sm text-navy-300">
            Staff and parents can sign in to the school management portal.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Portal Login
          </Link>
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-6 flex gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => {
                if (!url) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
                    aria-label={SOCIAL_LABELS[platform] ?? platform}
                  >
                    <Link2 className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-navy-400 sm:flex-row">
          <p>
            &copy; {year} {settings?.school_name ?? "BestRoyal Meridian Nursery & Primary School"}.
            All rights reserved.
          </p>
          <p>Soaring for Excellence</p>
        </Container>
      </div>
    </footer>
  );
}
