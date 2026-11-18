import { createClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Public announcements for the homepage/news page. Never throws. */
export async function getPublicAnnouncements(limit = 5) {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("announcements")
      .select("id, title, body, published_at")
      .eq("audience", "public")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

/** Upcoming published school events for the homepage/news page. Never throws. */
export async function getUpcomingEvents(limit = 5) {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("events")
      .select("id, title, start_date, end_date, location")
      .eq("is_published", true)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}
