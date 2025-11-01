import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOW = new Set([
  "", // /
  "workspace",
  "acess-not-found",
  "api",
  "_next",
  "favicon.ico",
  "tutorials",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bloqueia padrão antigo `/:token` para não expor token via URL
  if (pathname.split("/").length === 2) {
    const seg = pathname.slice(1);
    if (!ALLOW.has(seg)) {
      return NextResponse.redirect(new URL("/acess-not-found", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
