import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware - auth checks happen in pages/server actions
// This avoids edge runtime issues with mongoose/crypto
export function middleware(request: NextRequest) {
  // Just pass through - auth is handled by pages themselves
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match API routes if needed
    "/api/:path*",
  ],
};
