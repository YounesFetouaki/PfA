import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/interview(.*)",
  "/call(.*)",
  "/api/register-call(.*)",
  "/api/get-call(.*)",
  "/api/generate-interview-questions(.*)",
  "/api/create-interviewer(.*)",
  "/api/analyze-communication(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.pathname;
  
  // Log for debugging
  console.log('[Middleware] Request to:', url);
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth().protect();
  }

  console.log('[Middleware] Allowing access to:', url);
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
