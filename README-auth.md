# Module 2 — Authentication

Auth.js (NextAuth v5) wired on top of Module 1's `User`/`Role` model, with
Credentials login, JWT sessions, role-based permissions, edge middleware, and
protected `/admin` routes.

## What's included

```
auth.config.ts                       # edge-safe config (route protection rules) — used by middleware
lib/
  auth.ts                            # full config: Credentials + bcrypt + Prisma (Node runtime)
  permissions.ts                     # permission matrix + requirePermission/requireAdmin guards
  validations/auth.ts                # Zod login schema
middleware.ts                        # protects /admin/* at the edge
types/next-auth.d.ts                 # augments Session/User/JWT with id + role
app/
  api/auth/[...nextauth]/route.ts    # Auth.js route handler (GET/POST)
  (auth)/login/
    page.tsx                         # login screen (redirects away if already signed in)
    login-form.tsx                   # client form using useActionState
  actions/
    auth.actions.ts                  # loginAction / logoutAction
  admin/
    layout.tsx                       # session check + role-filtered nav + sign out
    unauthorized/page.tsx            # shown when an EDITOR hits an ADMIN-only route
    enquiries/page.tsx                # example protected page using requirePermission()
```

It also updates every Module 1 server action (`product`, `project`, `blog`,
`download`, `enquiry`) to call `requirePermission()` from `lib/permissions.ts`
instead of the ad-hoc `requireAdmin()` each file had before.

## How the pieces fit together

**Two-file Auth.js config split.** `auth.config.ts` has no Prisma or bcrypt
imports, so it can run on the Edge runtime inside `middleware.ts`. `lib/auth.ts`
imports that config and adds the `Credentials` provider (which needs bcrypt +
Prisma, both Node-only) — this is what your Server Components, Server Actions,
and the API route handler import.

**Sessions are JWT-based**, not database-backed — appropriate for a
Credentials-only setup. `role` is written into the token on first sign-in
(`jwt` callback) and copied onto `session.user` (`session` callback) on every
request, so `await auth()` anywhere in the app gives you `session.user.role`
without an extra DB query.

**Roles** come straight from Module 1's `Role` enum (`ADMIN`, `EDITOR`) — no
new enum introduced here.

**Permissions** (`lib/permissions.ts`) are a flat list (`PERMISSIONS.BLOG_CREATE`,
`PERMISSIONS.PRODUCT_DELETE`, …) mapped to roles in `ROLE_PERMISSIONS`. This is
the layer everything else checks against, rather than sprinkling
`role === "ADMIN"` throughout the codebase:

```ts
await requirePermission(PERMISSIONS.PRODUCT_DELETE); // throws if not allowed
hasPermission(session.user.role, PERMISSIONS.BLOG_PUBLISH); // boolean, for UI
```

If you add a new role later (e.g. `VIEWER`), you only touch
`ROLE_PERMISSIONS` — every action and page that calls `requirePermission()`
picks it up automatically.

**Middleware** (`middleware.ts` + `authConfig.callbacks.authorized`) runs
before any `/admin/*` route: unauthenticated → redirect to `/login`;
authenticated but hitting an ADMIN-only prefix (`ADMIN_ONLY_PREFIXES` in
`auth.config.ts`) while only an `EDITOR` → redirect to `/admin/unauthorized`.

**Defense in depth.** Middleware is the first gate, but `app/admin/layout.tsx`
re-checks the session, and any Server Action or Server Component that touches
sensitive data calls `requirePermission()`/`requireAdmin()` itself. Middleware
can be misconfigured or bypassed by a direct fetch to a Server Action — the
inner checks can't be.

## Setup

```bash
npm install next-auth@beta
```

Add to `.env`:
```
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

Log in with the seed admin from Module 1 (`studio@bydevyora.com` /
`SEED_ADMIN_PASSWORD` from your `.env`).

## Extending this

- **Add an OAuth provider** (Google, etc.): add it to the `providers` array in
  `lib/auth.ts` and wrap it with `PrismaAdapter(prisma)` — Module 1's schema
  already has the `Account`/`Session`/`VerificationToken` models Auth.js
  expects for that.
- **Add a role**: extend the `Role` enum in `prisma/schema.prisma`, run a
  migration, then add its permission set to `ROLE_PERMISSIONS` in
  `lib/permissions.ts`. Nothing else needs to change.
- **Rate-limit login attempts**: not included here — wrap `loginAction` with
  your rate limiter of choice (e.g. Upstash Ratelimit) keyed on IP or email
  before calling `signIn()`.
