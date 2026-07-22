import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // 1. Clerk Route Protection for Students
  if (pathname.startsWith("/dashboard")) {
    await auth.protect();
  }

  // 2. Custom Admin Route Protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = req.cookies.get("admin_session")?.value;
    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const isValid = await verifyAdminToken(adminSession);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|png|webp|jpg|jpeg|webp|ico|csv|docx|xlsx|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
