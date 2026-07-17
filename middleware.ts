import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // TODO: Protect admin and authenticated routes.
  void _request;
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/profile/:path*", "/orders/:path*"] };
