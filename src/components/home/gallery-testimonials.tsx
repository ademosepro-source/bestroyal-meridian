import Image from "next/image";
import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";

const PREVIEW_PHOTOS = [
  { src: "/images/gallery/pupils-playtime.jpg", alt: "Pupils enjoying playtime" },
  { src: "/images/gallery/nursery-group.jpg", alt: "Nursery pupils with their teacher" },
  { src: "/images/gallery/fruits-colour-day.jpg", alt: "Fruits & Colour Day" },
];

export function GalleryTestimonials() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Life at BestRoyal Meridian"
              title="Photo Gallery"
              align="left"
            />
            <div className="mt-8 grid grid-cols-3 gap-3">
              {PREVIEW_PHOTOS.map((photo) => (
                <div key={photo.src} className="relative h-28 overflow-hidden rounded-xl sm:h-36">
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
            <Link
              href="/gallery"
              className="mt-5 inline-flex text-sm font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900"
            >
              See the full gallery →
            </Link>
          </div>

          <div>
            <SectionHeading
              eyebrow="Parent Voices"
              title="What Parents Say"
              align="left"
            />
            <div className="mt-8">
              <EmptyState
                icon={MessageSquareQuote}
                title="No testimonials yet"
                description="Parent testimonials will be featured here as they are submitted and approved."
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
