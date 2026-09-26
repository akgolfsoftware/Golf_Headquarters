import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const forwardedHost = request.headers.get("x-forwarded-host") || "";

  if (host.includes("ngf-spillerranking") || forwardedHost.includes("ngf-spillerranking")) {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/team-norway/rangliste", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
