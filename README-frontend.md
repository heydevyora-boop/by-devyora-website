# Module 6 — Website Frontend

The public site, wired to real data through the repositories built in
Modules 1–4. Every page is a Server Component doing its own data fetching —
no client-side loading states except where a page is genuinely interactive
(the product variant picker, the contact form tabs).

## Structure

```
app/
  layout.tsx                     # root: fonts (Instrument Serif + Archivo), global reset
  (site)/
    layout.tsx                    # header + <main> + footer, wraps every public page
    page.tsx                      # Homepage
    materials/page.tsx            # Material (system) listing — the 11 systems
    materials/[slug]/page.tsx     # Material detail — specs, applications, products, related
    categories/[slug]/page.tsx    # Category page — cross-cuts materials
    products/[slug]/page.tsx      # Product detail — variants, gallery, specs, downloads, related
    projects/page.tsx             # Project listing — type filter via ?type=
    projects/[slug]/page.tsx      # Project detail
    manufacturing/page.tsx        # Process, quality standards, infrastructure, certifications
    contact/page.tsx              # Tabbed enquiry form (wired to Module 1's submitEnquiry) + branches
    about/page.tsx                # Timeline, leadership, values, service regions

components/
  site/
    header.tsx, footer.tsx         # shared chrome
    ui.tsx                          # Eyebrow, PrimaryButton, SecondaryButton, SectionLabel, ImagePlaceholder
    contact-form.tsx                # client: tab state + useActionState(submitEnquiry)
    product-detail-client.tsx       # client: variant selection + gallery image switching
  shared/cloudinary-image.tsx       # from Module 5 — optimized <Image> for any public page

lib/theme.ts                        # color/font tokens shared by every page + component
```

## Design system carried over from your mockups

`lib/theme.ts` centralizes the palette and type scale your `.dc.html` files
already established (`#121110` ink, `#8C6A45` accent, `#E4E1DC` borders,
`#F6F4F1` muted backgrounds, Instrument Serif headings over Archivo body
text) so every page pulls from one place instead of repeating hex codes.
`components/site/ui.tsx` has the handful of repeated patterns (eyebrow
labels, the two button variants, section dividers, image placeholders) as
small components rather than copy-pasted style objects.

**What's not reproduced 1:1**: the mockups' scroll-triggered animations
(`dvRise`/`dvFade` keyframes, `style-hover` pseudo-states) aren't ported —
those need either a CSS file (for `:hover`) or a client-side intersection
observer (for scroll-in), and adding them didn't seem worth the file count
for this pass. The layout, spacing, and typographic rhythm match; the motion
polish is a follow-up if you want it.

## Real vs. placeholder images

None of the seeded content has real Cloudinary assets yet (Module 1's seed
uses Unsplash URLs for `Material.heroImage`/`Material.images`, and the
sample `Product` has one Unsplash image). Rather than mix "sometimes real
photo, sometimes gray box" inconsistently, every page uses
`<ImagePlaceholder>` uniformly for hero/gallery imagery and only renders a
real `<img>` where the schema already guarantees a URL (product images on
the product detail page, since `ProductImage.url` is a required field).
Once you're uploading real photography through Module 5's media library,
swap `<ImagePlaceholder>` for `<CloudinaryImage publicId={...} />` — the
call sites are already isolated to one component each.

## Data flow per page

| Page | Repository calls |
|---|---|
| Homepage | `MaterialRepository.findAll`, `ProjectRepository.findFeatured`, `DownloadRepository.findAll`, `BlogRepository.findAll` |
| Materials listing | `MaterialRepository.findAll` |
| Material detail | `MaterialRepository.findBySlug` (now includes published `products`), `MaterialRepository.findRelated` |
| Category page | `CategoryRepository.findBySlugWithProducts` (new — products + material info + subcategories) |
| Product detail | `ProductRepository.findBySlug`, `ProductRepository.findRelated` (new — same category, falls back to same material) |
| Projects listing | `ProjectRepository.findAll({ type, publishedOnly })` |
| Project detail | `ProjectRepository.findBySlug`, `ProjectRepository.findRelated` |
| Manufacturing | `ManufacturingRepository.findSteps/findStats/findCertifications` |
| Contact | `BranchRepository.findAll` + `ContactForm` → `submitEnquiry` server action |
| About | static (see below) |

Three repository methods are new in this pass, all additive:
`MaterialRepository` now includes a `products` relation (published only,
capped at 12) in its detail query; `CategoryRepository.findBySlugWithProducts`
and `ProductRepository.findRelated` didn't exist before because nothing
public-facing needed them yet.

## About page content

Company timeline, leadership bios, values, and service regions are
hardcoded in `app/(site)/about/page.tsx` rather than pulled from the
database. This was a deliberate call: that copy changes maybe once a year,
and modeling `TeamMember`/`TimelineEvent`/`CompanyValue`/`ServiceRegion` as
full CRUD entities (admin forms, repositories, permissions — the same
weight as Products or Projects) would be a lot of scaffolding for content
an admin edits by asking a developer to change a few lines. If that
assumption is wrong for how your team actually works, it's a straightforward
follow-up using the exact same repository/action/form pattern as
Categories.

## SEO

Every dynamic page (`materials/[slug]`, `categories/[slug]`,
`products/[slug]`, `projects/[slug]`) exports `generateMetadata()`, pulling
title/description from the record itself and calling `notFound()` before
rendering anything if the slug doesn't resolve — so a bad URL 404s instead
of rendering an empty shell. Static pages (`about`, `manufacturing`,
`contact`, `materials` listing, `projects` listing) export a plain
`metadata` object. None of this uses `next-seo` (already in your
`package.json`) — Next's built-in Metadata API supersedes it for App Router
projects; `next-seo` is really for the Pages Router. Worth removing from
`package.json` unless something else in your stack still needs it.

## What's deliberately not built

- **Blog/Journal detail pages** — the homepage journal preview links
  nowhere yet (`BlogRepository`/`BlogPost` exist from Module 1, just no
  `/journal` or `/journal/[slug]` routes). Wasn't in this module's list;
  same pattern as Materials would apply if you want it next.
- **A public Downloads page** — same story; downloads are surfaced inline
  (homepage resources section, product detail page) but there's no
  standalone `/downloads` listing route.
- **Cart/checkout** — `ProductVariant.price` exists and renders, but nothing
  here assumes By Devyora sells online; enquiries are still the conversion
  path, matching the original Contact form design.
