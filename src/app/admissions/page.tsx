import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { ApplicationForm } from "@/components/admissions/application-form";
import { getSchoolSettings } from "@/lib/data/school-settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admissions" };

export default async function AdmissionsPage() {
  const settings = await getSchoolSettings();

  let classes: Awaited<ReturnType<typeof getClasses>> = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    classes = await getClasses();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          eyebrow="Admissions"
          title="Join the BestRoyal Meridian Family"
          description="Complete the form below and our admissions team will be in touch about next steps."
        />
        <Container className="max-w-3xl py-20">
          <ApplicationForm classes={classes} />
        </Container>
      </main>
      <Footer settings={settings} />
    </>
  );
}

async function getClasses() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("classes").select("*").order("order_index");
    return data ?? [];
  } catch {
    return [];
  }
}
