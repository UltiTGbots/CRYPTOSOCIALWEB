import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { paywall } from "x402-next";
import { env } from "@/lib/env";

const paywallMiddleware = paywall({
  facilitatorUrl: env.X402_FACILITATOR_URL || undefined,
});

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/p/")) {
    const res = await paywallMiddleware(req);
    if (res) return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https: data:; media-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; frame-ancestors 'none';"
  );
  return res;
}

export const config = { matcher: ["/((?!api/auth).*)"] };
