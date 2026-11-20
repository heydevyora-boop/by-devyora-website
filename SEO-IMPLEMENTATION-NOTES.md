# By Devyora SEO implementation

This update focuses on technical SEO, product-page on-page SEO and product/material city landing pages. It does not change the storefront design, enquiry flow, admin workflow, authentication, database schema or business logic.

## What changed

- Added `lib/product-seo.ts` as the product SEO source of truth. It provides a product-focused title keyword, meta description, keyword set, page introduction and relevant applications for every product type in `lib/product-types.ts`. Priority custom copy is included for GRC pillars/capitals/jali, FRP pillars/jali/screens/planters, terracotta planters/jali, handmade ceramic tiles/basins and marble planters/cornices; remaining types receive a product-specific fallback rather than installation-method boilerplate.
- Updated product page metadata and introductory copy to use product/buyer-intent language.
- Improved product + city page metadata, page copy, visible FAQs, city/state context, internal links and `Service` structured data. These pages describe service coverage and do not claim that By Devyora has a local branch in every city.
- Improved material metadata and material + application + city metadata/copy, with `Service` structured data.
- Expanded sitemap generation to include product + city URLs as well as existing material + application + city URLs. The sitemap uses the same `SERVICE_CITIES` list as the actual city routes and chunks city URLs below Google's per-file URL limit.
- Replaced placeholder contact details in Organization JSON-LD with no invented phone/email values; corrected the logo and default Open Graph image path to an existing asset.
- Updated product-type image ALT text to describe the product rather than installation techniques.

## Important production setting

The repository's existing canonical domain default is `https://www.bydevyora.com`. Confirm that this is the exact preferred production hostname. Set the Vercel environment variable for Production:

```env
NEXT_PUBLIC_SITE_URL=https://www.bydevyora.com
```

Use the same hostname consistently in Vercel, the domain redirect (www or non-www), canonical tags and Google Search Console. Do not use a Vercel preview URL here.

## Deploy and submit

1. Replace the code in your working repository with this updated project, preserving your real `.env` values and database credentials.
2. Install dependencies using the existing lockfile (`npm ci`).
3. Run the project's normal checks and production build (`npm run build`) in your configured environment. The archive was syntax-checked, but a full production build could not be run in this environment because npm registry access was unavailable and project dependencies could not be installed.
4. Deploy to Vercel.
5. Open `https://www.bydevyora.com/robots.txt` and confirm the sitemap directive points to the production domain.
6. Open `https://www.bydevyora.com/sitemap.xml` and confirm the sitemap index loads; open the child sitemap URLs it lists and check that canonical product and city URLs return HTTP 200.
7. In Google Search Console, inspect important URLs (homepage, GRC, FRP, GRC Pillars, FRP Planters and selected city pages), run URL Inspection, then submit `/sitemap.xml`.
8. Track impressions, clicks, queries, indexed pages and average position for at least 4–8 weeks before deciding which pages need more content.

## SEO quality guidance

- Metadata keywords are descriptive metadata only; Google does not use the old `meta keywords` tag as a ranking factor. Rankings depend on useful page content, relevance, authority, crawlability, user experience and competition.
- City pages are service-area pages, not proof of a physical office in that city. Do not add fake local addresses, phone numbers, reviews, project photos or Google Business Profile locations.
- The current city list is the list in `lib/data/service-cities.ts`. It contains the service cities already defined by the project; it is not an exhaustive list of every Indian city.
- Product × city pages are generated from existing product slugs and the configured service-city list. Before adding many more cities, strengthen the pages with real city-specific project examples, delivery details, customer questions and original imagery where available. Avoid publishing large sets of near-identical doorway pages.
- Add genuine product specifications, accurate price/quote guidance, material details, dimensions, finish options, real project photos and clear enquiry information to the admin catalogue. These facts are more valuable than repeating keyword phrases.
- Add and verify a Google Business Profile for the real business location, and build relevant industry citations/links. Do not create fake profiles for service cities.
