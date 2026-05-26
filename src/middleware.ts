import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher([
  "/admin/dashboard(.*)",
  "/admin/products(.*)",
  "/admin/sets(.*)",
  "/admin/size-guides(.*)",
  "/admin/disclaimer(.*)",
  "/admin/home-design(.*)",
  "/admin/categories(.*)",
  "/admin/shipping-prices(.*)",
  "/admin/hero-settings(.*)",
  "/admin/about(.*)",
  "/admin/bulk-upload(.*)",
  "/admin/stripe-sync(.*)",
]);

const isLoginRoute = createRouteMatcher(["/admin/login"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const { pathname } = req.nextUrl;

  if (pathname === "/admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute(req) && userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff2?)$).*)",
    "/(api|trpc)(.*)",
  ],
};
