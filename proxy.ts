import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/home") ||
    path.startsWith("/chat") ||
    path.startsWith("/intro") ||
    path.startsWith("/create");

  // незалогиненных на защищённые страницы → логин
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // залогиненных проверяем approved
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("id", user.id)
      .single();

    if (!profile?.approved) {
      return NextResponse.redirect(new URL("/waitlist", request.url));
    }
  }

  // залогиненных на / → /home
  if (user && path === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("id", user.id)
      .single();

    if (!profile?.approved) {
      return NextResponse.redirect(new URL("/waitlist", request.url));
    }

    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg)).*)",
  ],
};
