import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config: no Prisma, no bcrypt, no Node-only APIs.
 * This is imported by middleware.ts (which runs on the Edge runtime) and by
 * auth.ts (which extends it with the Credentials provider for the Node runtime).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [], // populated in auth.ts (Credentials needs bcrypt / Prisma)
  callbacks: {
    // Runs on every request that matches the middleware matcher, before any
    // page/route code executes. Returning false redirects to `pages.signIn`.
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isAdminArea = pathname.startsWith("/admin");
      const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

      if (isAdminArea) {
        if (!isLoggedIn) return false; // -> redirect to /login
        if (isAdminOnly && auth?.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/admin/unauthorized", request.nextUrl));
        }
      }

      return true;
    },

    // Carry role/id from the token onto the session/JWT — populated fully in auth.ts,
    // but declared here too so TypeScript sees consistent shapes across both files.
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "ADMIN" | "EDITOR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

/** Route prefixes under /admin that require the ADMIN role specifically (EDITOR is not enough). */
export const ADMIN_ONLY_PREFIXES = [
  "/admin/materials",
  "/admin/categories",
  "/admin/projects",
  "/admin/downloads",
  "/admin/enquiries",
  "/admin/users",
];
