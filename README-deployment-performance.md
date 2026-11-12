# Module 11 — Deployment, Module 12 — Performance

## Module 11 — Deployment

```
vercel.json           # build command, region, security + cache headers
next.config.ts         # production flags (see Module 12)
.env.example            # + DIRECT_URL (Neon), NEXT_PUBLIC_SITE_URL
prisma/schema.prisma     # datasource now has directUrl for Neon's pooled/direct split
package.json              # + postinstall (prisma generate), db:migrate:deploy
```

### Vercel

Connect the repo, set the environment variables below in Project Settings,
and deploy. `vercel.json`:

- **`buildCommand`**: `prisma generate && prisma migrate deploy && next build`.
  Running migrations inline in the build is the simplest setup for a small
  team, but it has a real tradeoff worth knowing: a migration failure fails
  the build (safe — you don't ship code expecting a schema that doesn't
  exist), but two concurrent deployments both running `migrate deploy` can
  race. If you outgrow "small team, sequential deploys," move the migration
  step to a separate CI job (GitHub Action, Vercel's own deploy hooks) that
  runs before the build starts, and drop it from `buildCommand`.
- **`regions: ["bom1"]`** — Mumbai. Change this if your traffic isn't
  India-concentrated; colocating the function region with your database
  region (see Neon below) matters more than colocating with users for a
  database-heavy app like this one.
- **Headers** — standard hardening (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, a conservative `Permissions-Policy`) on every route, plus
  a 1-year immutable cache header on `/_next/static/*` (safe because Next
  fingerprints those filenames — a new build gets new filenames, so
  "immutable" doesn't mean "never updates," it means "this exact file never
  changes, so cache it forever and let the *filename* change instead").

**`postinstall: prisma generate`** in `package.json` — belt-and-suspenders
alongside the `prisma generate` in `buildCommand`. Some platforms/CI setups
run `npm install` and a build step as genuinely separate stages with a fresh
`node_modules` in between; `postinstall` covers that case, `buildCommand`
covers Vercel's actual sequencing. Harmless to have both.

### Neon (Postgres)

Neon's free/scale tiers give you a **pooled** connection string (via
PgBouncer, for your running app — serverless functions open/close
connections constantly, and Postgres itself doesn't handle thousands of
short-lived direct connections well) and a **direct** one (for anything that
needs a real session, which `prisma migrate` does — PgBouncer's transaction
pooling mode doesn't support the session-level features migrations use).

```
DATABASE_URL="postgresql://...@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://...@ep-xxx.region.aws.neon.tech/db?sslmode=require"
```

Note `-pooler` in the pooled hostname and `pgbouncer=true` in its query
string — both matter. `DATABASE_URL` feeds the `PrismaPg` adapter in
`lib/prisma.ts` (the running app); `DIRECT_URL` feeds `prisma.config.ts`
(the CLI, for migrations) — see `README-database.md` for why Prisma 7 splits
these across two files instead of one `datasource` block. Nothing else
needs to change once both env vars are set correctly.

### Cloudinary

Already fully wired in Module 5 — for production, just make sure the three
env vars point at your real Cloudinary account rather than a dev/sandbox
one, and that `CLOUDINARY_FOLDER` is something you're comfortable seeing in
every asset's path (it's not cosmetic — assets actually live in that folder
in your Cloudinary media library).

### Environment variables — full checklist

| Variable | Where it's used | Notes |
|---|---|---|
| `DATABASE_URL` | `lib/prisma.ts` | Pooled, for the running app |
| `DIRECT_URL` | `prisma migrate` only | Unpooled |
| `NEXT_PUBLIC_SITE_URL` | `lib/seo.ts` | No trailing slash; used in every canonical/OG/JSON-LD URL |
| `NEXTAUTH_SECRET` | Auth.js | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Auth.js | Your production URL in prod |
| `SEED_ADMIN_PASSWORD` | `prisma/seed.ts` | Only read once, at seed time — rotate the account's password after first login |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `lib/cloudinary.ts`, `lib/cloudinary-url.ts` | Not secret — appears in every delivery URL anyway |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | `lib/cloudinary.ts` (server only) | Never sent to the browser — only the signed, time-boxed upload signature is |
| `CLOUDINARY_FOLDER` | `lib/cloudinary.ts` | Cosmetic-but-permanent, see above |

### Production optimization checklist

- [ ] `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` both set to the real production domain (not localhost, not a preview URL)
- [ ] `SEED_ADMIN_PASSWORD` account's password changed after first login
- [ ] Neon connection strings are the pooled/direct pair, not the same string twice
- [ ] Cloudinary env vars point at the production Cloudinary account
- [ ] `npm run db:migrate:deploy` succeeds against production before the first real deploy (run it once manually to confirm before trusting it inside `buildCommand`)
- [ ] Vercel Analytics + Speed Insights show data after a few real visits (see Module 12)

---

## Module 12 — Performance

### Caching & ISR

Every mutation in this codebase already calls `revalidatePath()` (this was
true from Module 1 onward — it's not new here). What Module 12 adds is the
static-generation side that makes those calls actually mean something:
`revalidatePath()` only has a static page to invalidate if the page *is*
static. Detail pages now export `generateStaticParams()` so they're
prebuilt, plus `export const revalidate = 3600` as a time-based safety net
(catches direct DB edits that bypass the action layer — a manual fix in
Prisma Studio, for instance, has nothing to call `revalidatePath()` for it).

| Page | Static generation | On-demand revalidate |
|---|---|---|
| Homepage | — (no dynamic segment) | `revalidate = 1800` only |
| `/materials`, `/materials/[slug]` | ✅ all published | 3600s + `revalidatePath` in `material.actions.ts` |
| `/products/[slug]` | ✅ all published | 3600s + `revalidatePath` in `product.actions.ts` |
| `/projects/[slug]` | ✅ all published | 3600s + `revalidatePath` in `project.actions.ts` |
| `/categories/[slug]` | ✅ all | 3600s |
| `/journal/[slug]` | ✅ all published | 3600s + `revalidatePath` in `blog.actions.ts` |
| `/materials/[m]/[app]/[city]` | ✅ full matrix (Module 8) | 86400s (see `README-seo-cities.md`) |

**`/projects` and `/journal` (the listing pages) are deliberately left
dynamic** — both read `searchParams` for filtering (`?type=`, `?categorySlug=`),
and Next.js opts a page into dynamic rendering the moment it reads
`searchParams`, regardless of any `revalidate` export. That's correct
behavior here, not a gap: a filtered list needs to reflect the current
catalogue on every request, and the underlying queries are cheap indexed
lookups, not expensive aggregations — dynamic rendering costs nothing
noticeable at this scale.

### Lazy loading

- **`RichEditor` (Tiptap)** — `next/dynamic(..., { ssr: false })` in
  `blog-post-form.tsx`. This is the one meaningfully large client-only
  dependency in the codebase; everything else is small enough that
  route-based code splitting (which Next.js App Router does automatically,
  per-route, with zero configuration) already handles it.
- **Images** — every below-the-fold `<img>` (product gallery thumbnails,
  admin media library grid) has `loading="lazy" decoding="async"`. The one
  deliberately-eager image is the product page's main hero, which is above
  the fold on load and should start fetching immediately rather than wait
  for a lazy-load trigger.

### Image optimization

Two complementary helpers in `lib/cloudinary-url.ts`, both client-safe (no
`cloudinary` SDK import, so no risk of breaking a Client Component bundle):

- **`buildOptimizedUrl(publicId, opts)`** — when you have a Cloudinary
  `public_id` directly (the admin media library always does), builds a
  fresh transformed URL.
- **`optimizeImageUrl(url, opts)`** — when you only have a stored `url`
  string (every `ProductImage`/`ProjectImage`/`MaterialImage` row, since
  those predate the media library and just store a plain URL), detects
  whether it's a Cloudinary URL and injects the `f_auto,q_auto` transform
  segment; silently passes through unchanged for anything else (the seed
  data's Unsplash placeholders, or any future non-Cloudinary source). This
  is what the product detail page's gallery uses.

Both ultimately produce `f_auto` (AVIF/WebP/JPEG, whichever the requesting
browser supports) + `q_auto` (perceptual quality compression — typically
30-50% smaller than a fixed quality with no visible difference) —
consistent with `<CloudinaryImage>` (Module 5) and `next.config.ts`'s
`images.formats: ["image/avif", "image/webp"]` for the few images that go
through Next's own optimizer instead of Cloudinary's.

### Monitoring

- **`@vercel/analytics` + `@vercel/speed-insights`** — wired into the root
  layout (`<Analytics />`, `<SpeedInsights />`). No-ops in local dev; start
  reporting real pageviews and Core Web Vitals once deployed to Vercel. No
  configuration needed beyond having the packages installed and deployed.
- **`GET /api/health`** — runs `SELECT 1` against the database and returns
  `{ status: "ok" }` or a 503. Point an uptime monitor (UptimeRobot, Better
  Uptime, Vercel's own Checks, whatever you use) at this instead of the
  homepage — the homepage succeeding tells you Next.js is up; this endpoint
  tells you the *database* is actually reachable, which is the failure mode
  that matters most for a data-driven site.
- **`app/error.tsx` / `app/global-error.tsx`** — route-segment and
  root-layout error boundaries. Both currently just `console.error()` (which
  Vercel's own log stream captures) and show a friendly fallback with a
  "Try again" button. The `console.error` call in each is intentionally the
  single place you'd wire in Sentry/Bugsnag/whatever error-tracking service
  you pick — search for that comment when you're ready to add one.

### What's deliberately not built

- **No Redis/external cache layer.** Next's built-in Data Cache + Full Route
  Cache (via ISR) covers this app's needs — traffic and query patterns don't
  yet justify the operational cost of a separate cache to manage.
- **No CDN cache headers on dynamic routes** — only `/_next/static/*` gets
  the aggressive `Cache-Control` in `vercel.json`; HTML responses go through
  Next's own ISR caching instead, which already handles the invalidation
  story correctly (a raw `Cache-Control` header on an ISR page would fight
  with Next's revalidation logic rather than complement it).
- **No bundle-size budget/CI check.** `next build` prints route sizes on
  every build; nothing currently fails CI if they grow. Worth adding
  (`next-bundle-analyzer` + a size-limit check) once the app has enough
  history to know what "too big" looks like for this codebase specifically.
