import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const authPaths = ["/auth/signin", "/auth/signup", "/auth/register"];

  if (token && authPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && !authPaths.some(path => pathname.startsWith(path))) {
    const isPublicAsset = pathname.startsWith("/_next") ||
      pathname.startsWith("/api/auth") ||
      pathname.includes("/favicon.ico") ||
      pathname.startsWith("/public");

    if (!isPublicAsset) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
