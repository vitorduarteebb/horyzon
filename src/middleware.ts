import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { getAuthSecret } from "@/lib/auth-secret";

const LOGIN = "/login";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  const isLoggedIn = !!token;

  if (pathname === LOGIN) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    return res;
  }

  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN;
    url.searchParams.set("callbackUrl", pathname);
    const redirectRes = NextResponse.redirect(url);
    redirectRes.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    return redirectRes;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
