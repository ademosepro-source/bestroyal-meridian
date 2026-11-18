import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { ROLE_ACCESS, isRole } from "@/lib/auth/roles";

/**
 * Refreshes the Supabase auth session on every request and enforces
 * role-based access to /dashboard/* routes before any page code runs.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Supabase hasn't been configured yet (see docs/SETUP.md) — let the public
  // site render, but there is no session to refresh or role to check.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.app_metadata?.must_change_password && pathname !== "/dashboard/change-password") {
      return NextResponse.redirect(new URL("/dashboard/change-password", request.url));
    }

    const role = user.app_metadata?.role as string | undefined;
    const matchedSection = Object.keys(ROLE_ACCESS).find((section) =>
      pathname.startsWith(section),
    );

    if (matchedSection && (!isRole(role) || !ROLE_ACCESS[matchedSection].includes(role))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
