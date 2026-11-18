import { Images, MessageSquareQuote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";

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
            <div className="mt-8">
              <EmptyState
                icon={Images}
                title="Gallery coming soon"
                description="Authentic photos of our pupils, classrooms and campus life will be added here by school management."
              />
            </div>
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
