import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { getSchoolSettings } from "@/lib/data/school-settings";

export const metadata: Metadata = { title: "Gallery" };

const PHOTOS = [
  { src: "/images/gallery/pupils-cheering.jpg", caption: "Pupils celebrating together in the school compound" },
  { src: "/images/gallery/pupils-playtime.jpg", caption: "Pupils enjoying playtime" },
  { src: "/images/gallery/nursery-group.jpg", caption: "Our nursery pupils with their teacher" },
  { src: "/images/gallery/primary-group.jpg", caption: "Our primary pupils with their teacher" },
  { src: "/images/gallery/preschool-group.jpg", caption: "Pre-School pupils" },
  { src: "/images/gallery/fruits-colour-day.jpg", caption: "Fruits & Colour Day" },
];

export default async function GalleryPage() {
  const settings = await getSchoolSettings();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Gallery"
          title="Life at BestRoyal Meridian"
          description="Authentic photos of our pupils, classrooms and campus life."
        />
        <Container className="py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTOS.map((photo) => (
              <figure
                key={photo.src}
                className="overflow-hidden rounded-2xl border border-navy-900/10"
              >
                <div className="relative h-60 w-full">
                  <Image
                    src={photo.src}
                    alt={photo.caption}
                    fill
                    className="object-cover"
                  />
                </div>
                <figcaption className="bg-white p-4 text-sm text-slate-600">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-sm text-slate-500">
            More photos will be added here by school management as new events
            and activities happen.
          </p>
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}
