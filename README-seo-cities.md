# Module 7 — SEO Engine, Module 8 — City Pages

Shipped together because Module 8's city pages are the main stress-test of
Module 7's infrastructure — if `buildMetadata()` and `<Breadcrumbs>` didn't
scale cleanly to a thousand auto-generated pages, they weren't done yet.

## Module 7 — SEO Engine

```
lib/seo.ts                          # buildMetadata() + all JSON-LD builders
components/site/json-ld.tsx         # <JsonLd data={...} /> — renders one <script type="application/ld+json">
components/site/breadcrumbs.tsx     # <Breadcrumbs items={...} /> — visible trail + matching JSON-LD, one call
app/sitemap.ts                      # chunked sitemap index
app/robots.ts                       # allow site, disallow /admin /api /login
```

### Dynamic metadata

Every public page — all 11, including the new city pages — calls
`buildMetadata({ title, description, path, image?, type?, index? })` instead
of hand-writing a `Metadata` object. One function means one place to change
if, say, the Twitter card format or default OG image ever needs to update.

Static pages (`about`, `contact`, `manufacturing`, `materials` listing) use
`export const metadata = buildMetadata({...})`. Pages whose content depends
on the URL (`materials/[slug]`, `products/[slug]`, `projects/[slug]`,
`categories/[slug]`, and the Module 8 city pages) use
`export async function generateMetadata({ params })`, fetch the record, and
`return {}` if it's not found — paired with `notFound()` in the page body so
a bad slug 404s cleanly instead of serving an empty-but-200 page.

### Canonical & Open Graph

Both come out of `buildMetadata()` automatically — `alternates.canonical`
and `openGraph.url` are always `absoluteUrl(path)`, so there's no path where
one gets set and the other forgotten. `openGraph.type` accepts `"product"`
in the function signature but maps to OG's `"website"` under the hood, since
the Open Graph protocol itself doesn't define a `product` type — Product
pages get their real typing from `productJsonLd()` instead, which is what
actually matters for rich results.

One deliberate exception: `/projects?type=RESIDENTIAL` (and the other type
filters) pass `index: false` — same content as the canonical `/projects`,
just pre-filtered, so indexing every filter combination would be duplicate
content for no ranking benefit.

### JSON-LD

Six builders in `lib/seo.ts`, each a plain object (not a component) so
they're trivial to unit test or log:

| Builder | Used on |
|---|---|
| `organizationJsonLd()` | Homepage |
| `breadcrumbJsonLd(items)` | Every page, via `<Breadcrumbs>` |
| `productJsonLd(product)` | Product detail — includes `Offer`s per variant (SKU, price, `InStock`/`PreOrder`) |
| `articleJsonLd(post)` | Ready for Blog/Journal detail pages once those are built (Module 6's known gap) |
| `localBusinessJsonLd(...)` | City landing pages |
| `faqJsonLd(items)` | City landing pages |

### Sitemap

`app/sitemap.ts` uses Next's `generateSitemaps()` + chunked `sitemap({id})`
pattern rather than one flat file:

- **id 0** — every static page, material, category, product, and project.
- **id 1..N** — city landing pages, chunked at 2,000 URLs per file (Google's
  actual limit is 50,000; chunking well under that keeps each file fast to
  generate and fetch, and isolates the fastest-growing URL set from
  everything else).

`generateSitemaps()` computes the chunk count from the live
Material×Application×City total, so it self-adjusts as you add cities or
applications — nothing to manually update.

### Breadcrumb

`<Breadcrumbs items={[{name, path}, ...]} />` renders the visible trail
*and* calls `breadcrumbJsonLd()` internally — pass the trail once, get both.
Every page prepends "Home" automatically. This replaced a hand-rolled
breadcrumb `<div>` that was already sitting in the product detail page from
Module 6; that one had no JSON-LD at all, which is exactly the drift this
component exists to prevent.

---

## Module 8 — City Pages

```
prisma/schema.prisma    # + City model, + MaterialApplication.slug
prisma/seed.ts           # + 20 cities, + slugified applications, + "Pillars" on GRC
lib/repositories/
  city.repository.ts      # new
  material.repository.ts  # + listMaterialApplicationSlugs(), + findForLocationPage()
app/(site)/materials/[slug]/[application]/[city]/page.tsx
```

### The route

`/materials/[slug]/[application]/[city]` — e.g. `/materials/grc/pillars/bhopal`.
Coexists with `/materials/[slug]` (Module 6's material detail page) because
they're different route depths; Next.js matches on segment count, not just
the dynamic parameter name.

### Automatic generation

```ts
export async function generateStaticParams() {
  const combos = await MaterialRepository.listMaterialApplicationSlugs(); // ~45 pairs across 11 materials
  const cities = await CityRepository.findAll();                          // 20 cities
  return combos.flatMap((c) => cities.map((city) => ({ slug: c.materialSlug, application: c.applicationSlug, city: city.slug })));
}
```

At current seed data that's roughly 900 pages, all prebuilt at deploy time —
no page was hand-authored; add a city or an application to a material and
the next build generates every new combination for you.

`dynamicParams = true` plus `revalidate = 86400` (24h) means the pattern
keeps working past "prebuild everything": if you later add enough
cities/applications that build time becomes a problem, `generateStaticParams`
can return only the highest-value subset (cities with a branch, materials
with real traffic) and every other combination still renders correctly —
just on first request instead of at build time, then cached like any other
ISR page. The route code doesn't change either way; only what you feed
`generateStaticParams` does.

### Why `MaterialApplication` needed a `slug` field

Applications already existed (Module 1) as display chips — "Facades",
"Pillars", etc. — with no URL-safe identifier. `MaterialRepository.create`/
`update` now compute `slug: slugify(label)` server-side whenever an
application is saved, so the admin Material form (Module 3/4) didn't need
any new field — an admin typing "Pillars" into the applications list
transparently gets a `pillars` city-page segment for free.

### Page content

Specs are reused straight from the parent `Material` (no separate
per-city/per-application content to maintain). What's genuinely per-page:
the H1 (`{Material} {Application} in {City}`), the intro paragraph, three
FAQ entries (also emitted as `FAQPage` JSON-LD), and cross-links to (a) the
same material's other applications in the same city and (b) a handful of
other cities for the same application — internal links exist specifically
so crawlers can discover the set through normal link-following, not just
the sitemap.

### What's deliberately not built

- **No admin UI for `City`.** `CityRepository` exists but there's no
  `/admin/cities` — same call as `About` page content in Module 6: this is
  a short, infrequently-changed list. Add a `CITY_MANAGE` permission and copy
  the Categories admin pattern if that assumption stops holding.
- **No admin UI for editing FAQ copy per page** — the three FAQ entries are
  generated from a template (material name, application, lead time) in the
  page component itself, not stored per-combination. Storing ~900 rows of
  FAQ copy that's 95% identical didn't seem worth the schema weight; templating
  scales for free as new combinations appear.
- **City pages don't appear in the header nav** (by design — there are
  hundreds of them). Discovery is: sitemap, internal links from material
  pages, and search engines. If you want a city picker UI, `CityRepository.findAll()`
  is already there to build one from.
