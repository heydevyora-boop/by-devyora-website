# By Devyora — Website

Full-stack Next.js (App Router) website and admin CMS for By Devyora,
architectural materials manufacturer. Built across six modules; each has its
own detailed README (see [Module index](#module-index) below).

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure — copy the example and fill in your values
cp .env.example .env

# 3. Set up the database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Run
npm run dev
```

Then:
- Public site → http://localhost:3000
- Admin → http://localhost:3000/admin (sign in at `/login`)
- Seed admin credentials: `studio@bydevyora.com` / whatever you set as
  `SEED_ADMIN_PASSWORD` in `.env`

### Required environment variables

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/bydevyora?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/bydevyora?schema=public"   # see README-deployment-performance.md for Neon's pooled/direct split

NEXT_PUBLIC_SITE_URL="https://www.bydevyora.com"   # canonical URLs, sitemap, JSON-LD (Module 7)

NEXTAUTH_SECRET="..."          # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

SEED_ADMIN_PASSWORD="..."      # used once, by the seed script

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_FOLDER="bydevyora"
```

---

## Architecture

**Stack:** Next.js 15 (App Router) · TypeScript · PostgreSQL · Prisma ·
Auth.js v5 · Zod · react-hook-form · Cloudinary

The codebase follows one consistent path for every piece of data:

```
Page (Server Component)
  └─ Repository  (lib/repositories/*)     ← all Prisma access lives here
       └─ Prisma → PostgreSQL

Form (Client Component)
  └─ Server Action  (app/actions/*)
       ├─ requirePermission()  (lib/permissions.ts)   ← auth gate
       ├─ Zod schema           (lib/validations/*)    ← input validation
       └─ Repository                                   ← the same layer pages use
```

Four rules hold everywhere, and are worth keeping if you extend this:

1. **No Prisma calls outside `lib/repositories/`.** Pages and actions call
   repository methods; the repository owns the query shape.
2. **Every server action validates with Zod before touching the database**
   and returns a typed `ActionState` (`{ ok: true, data }` or
   `{ ok: false, error, fieldErrors }`) so forms can render field-level errors.
3. **Every mutating action calls `requirePermission()` first.** Middleware is
   the outer gate, but actions are directly callable over the network — the
   inner check is the one that actually protects data.
4. **List pages keep state in the URL**, not React state. Search/filter/page
   are query params, read by the Server Component, so results are
   shareable, bookmarkable and back-button-safe with no client fetching.

### Data model

```
Material              the 11 systems: GRC, FRP, Terracotta, WPC…
  ├─ MaterialApplication      e.g. "Facades", "Pillars" — each has a slug
  │     used as the city-page URL segment (Module 8)
  └─ Product           SKU-level item, e.g. "GRC Facade Panel — Board Formed"
       ├─ ProductSpecification    key/value spec rows
       ├─ ProductVariant          size / finish / colour / price / SKU
       ├─ ProductImage            gallery, optionally scoped to a variant
       └─ DownloadFile            product-specific spec sheets

Category (self-nesting)  cross-cuts materials — "Facades" spans GRC + FRP + Terracotta

City                     powers /materials/[material]/[application]/[city] (Module 8)

Project → ProjectMaterial → Material     portfolio, with materials used
BlogPost → BlogCategory                  journal
  ├─ BlogPostTag → Tag                    many-to-many tagging (Module 10)
  └─ metaTitle / metaDescription          optional SEO overrides
Enquiry                                   CRM lead (Module 9)
  ├─ assignedTo → User                    salesperson assignment
  └─ EnquiryNote[]                        follow-up log
Branch · ManufacturingStep · FacilityStat · Certification    site content
Asset                                     Cloudinary media library
User · Account · Session                  auth
```

### Directory layout

```
app/
  (site)/          public website — homepage, materials (+ [application]/[city]
                   location pages), categories, products, projects, journal,
                   manufacturing, contact, about
  (auth)/login/    sign-in
  admin/           CMS — dashboard, materials, categories, products, blog,
                   media, downloads, enquiries (CRM)
  actions/         all server actions
  api/
    auth/            Auth.js route handler
    health/          uptime-monitor endpoint (Module 12)
  sitemap.ts       chunked sitemap index (static/catalogue + city pages)
  robots.ts        robots.txt
  error.tsx / global-error.tsx    error boundaries (Module 12)
components/
  site/            public site components (incl. json-ld.tsx, breadcrumbs.tsx)
  admin/           admin components (DataTable, forms, media library, rich editor…)
  shared/          used by both (CloudinaryImage)
lib/
  repositories/    data access layer
  validations/     Zod schemas
  auth.ts  permissions.ts  prisma.ts  cloudinary.ts  cloudinary-url.ts  theme.ts  seo.ts
prisma/
  schema.prisma    full data model
  seed.ts          seeds real content from the original design mockups
middleware.ts      protects /admin/* at the edge
auth.config.ts     edge-safe Auth.js config
vercel.json        deployment config (Module 11)
prisma.config.ts   Prisma CLI config — connection URL for migrate/seed/studio (Prisma 7)
```

---

## Module index

| Module | Covers | README |
|---|---|---|
| 1 — Database & Backend | Prisma schema, enums, relations, seed, repositories, server actions, Zod | `README-database.md` |
| 2 — Authentication | Auth.js, login, sessions, roles, permissions, middleware, protected routes | `README-auth.md` |
| 3 & 4 — Admin Dashboard + Material Management | Sidebar, dashboard, CRUD, data tables, pagination, search, filters; Materials/Categories/Products/Specs/Variants | `README-admin-catalog.md` |
| 5 — Media Library | Cloudinary, signed direct uploads, drag & drop, gallery, alt tags, optimization | `README-media.md` |
| 6 — Website Frontend | All public pages, design tokens, SEO metadata | `README-frontend.md` |
| 7 & 8 — SEO Engine + City Pages | Metadata, JSON-LD, sitemap, robots, canonical, OG, breadcrumbs; automatic location-page generation | `README-seo-cities.md` |
| 9 & 10 — Inquiry CRM + Blog | Lead pipeline, follow-ups, assignment, CSV export; rich editor, categories, tags, journal SEO | `README-crm-blog.md` |
| 11 & 12 — Deployment + Performance | Vercel, Neon, Cloudinary, env vars; caching, ISR, SSG, lazy loading, image optimization, monitoring | `README-deployment-performance.md` |

Each README documents its own decisions and, importantly, what was
**deliberately left out** — worth skimming before extending any module.

---

## Roles

Two roles, defined in `lib/permissions.ts`:

- **ADMIN** — everything.
- **EDITOR** — create/update products and variants, manage variants, author
  and publish-manage blog posts (including categories and tags), upload
  media, view *and export* enquiries. Cannot manage materials, categories
  (product), downloads, users, delete/publish products, or change an
  enquiry's status/assignment/follow-ups — those need `ENQUIRY_MANAGE`,
  which only `ADMIN` has (viewing and CSV-exporting the CRM only needs
  `ENQUIRY_VIEW`, which `EDITOR` does have).

To change the split, edit `ROLE_PERMISSIONS` — every action and page reads
from it, so nothing else needs touching. Adding a third role (e.g. a
`SALES` role for Module 9's assignment picker) means extending the `Role`
enum in `schema.prisma`, migrating, and adding its permission set.

---

## Known gaps

Carried forward from the module READMEs, in rough priority order:

- **No public `/downloads` page.** Downloads surface on the homepage and
  product pages, but the standalone listing route from the original mockup
  isn't built.
- **No admin screens for Projects or Users**, though their repositories,
  actions, and permissions all exist. They're marked `built: false` in
  `app/admin/layout.tsx`'s `NAV` array so the links stay hidden — flip the
  flag once each page is written. The Products admin (`app/admin/products/`)
  is the pattern to copy. (Blog and Materials/Categories/Products/Media/
  Downloads/Enquiries admin are all built as of Module 10.)
- **Real imagery.** Public pages use `<ImagePlaceholder>` uniformly; swap for
  `<CloudinaryImage publicId={...} />` once photography is uploaded through
  the media library. The product detail page's gallery is the one exception —
  it already renders real uploaded images via `optimizeImageUrl()`.
- **Mockup animations not ported** (`dvRise`/`dvFade` scroll-ins, CSS
  `:hover` states). Layout and typography match the originals; motion doesn't.
- **No admin UI for `City`** (Module 8). `CityRepository` exists; adding or
  editing cities means a migration/seed edit or a direct DB write until an
  admin screen is built — same pattern as Categories once you need one.
- **No CRM notifications.** Assigning an enquiry or receiving a new lead
  doesn't email/SMS anyone (Module 9) — `submitEnquiry` and
  `assignEnquiryAction` are the natural hook points if you add a mail
  provider.
- **No blog comments or revision history** (Module 10) — see
  `README-crm-blog.md` for why comments specifically need more than just a
  schema addition (HTML sanitization, moderation) before they'd be safe to add.
- **No error-tracking service wired up** (Module 12) — `app/error.tsx` and
  `app/global-error.tsx` both `console.error()` at the exact spot a
  Sentry/Bugsnag `captureException()` call would go.
- **No tests.** Repositories are the natural unit-test seam; server actions
  the natural integration seam.

Note: `next-seo` and `uploadthing` were in your original `package.json` but
have been removed — Next's built-in Metadata API replaces the former, and
Cloudinary (Module 5) replaced the latter.
