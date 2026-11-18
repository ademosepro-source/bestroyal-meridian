import type { Metadata } from "next";
import { Images } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchoolSettings } from "@/lib/data/school-settings";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const settings = await getSchoolSettings();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Gallery"
          title="Life at BestRoyal Meridian"
          description="Authentic photos of our pupils, classrooms and campus life, organised by category."
        />
        <Container className="py-20">
          <EmptyState
            icon={Images}
            title="Gallery coming soon"
            description="Photos will be added here by school management once the gallery module is built."
          />
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}
