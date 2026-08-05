import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Runs on the Edge runtime before any matched route. `authConfig.callbacks.authorized`
 * decides whether to allow the request, redirect to /login, or redirect to
 * /admin/unauthorized (see auth.config.ts).
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Protect everything under /admin, but skip static assets, images and the
  // Auth.js API routes themselves.
  matcher: ["/admin/:path*"],
};
