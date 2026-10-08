/**
 * The product types offered under each material.
 *
 * One source of truth, used in two places:
 *   - components/site/header.tsx — fills the Products dropdown's per-material
 *     types panel.
 *   - prisma/seed.ts — creates one Product (and therefore one
 *     /products/<slug> page) per type.
 *
 * To add, rename or remove a type, edit it here and re-run the seed:
 *   SEED_MATERIALS_ONLY=true npx prisma db seed
 * Renaming a `slug` changes that product's URL; renaming only `name` is safe.
 *
 * Keys are material slugs. A material with no entry here simply shows no
 * types panel, and keeps the single placeholder product seeded for it.
 */

export type ProductType = {
  name: string;
  slug: string;
};

export const PRODUCT_TYPES: Record<string, ProductType[]> = {
  grc: [
    { name: "GRC Pillars", slug: "grc-pillars" },
    { name: "GRC Capitals", slug: "grc-capitals" },
    { name: "GRC Brackets", slug: "grc-brackets" },
    { name: "GRC Jali", slug: "grc-jali" },
  ],
  frp: [
    { name: "FRP Pillars", slug: "frp-pillars" },
    { name: "FRP Capitals", slug: "frp-capitals" },
    { name: "FRP Brackets", slug: "frp-brackets" },
    { name: "FRP Jali", slug: "frp-jali" },
    { name: "FRP Decorative Screens", slug: "frp-decorative-screens" },
    { name: "FRP Props", slug: "frp-props" },
    { name: "FRP Planters", slug: "frp-planters" },
  ],
  wpc: [
    { name: "WPC Pergolas", slug: "wpc-pergolas" },
    { name: "WPC Gazebos", slug: "wpc-gazebos" },
    { name: "WPC Deck Flooring", slug: "wpc-deck-flooring" },
  ],
  uhpc: [
    { name: "UHPC Wall Panels", slug: "uhpc-wall-panels" },
    { name: "UHPC Pillars", slug: "uhpc-pillars" },
    { name: "UHPC Capitals", slug: "uhpc-capitals" },
    { name: "UHPC Brackets", slug: "uhpc-brackets" },
  ],
  brass: [{ name: "Brass Antiques", slug: "brass-antiques" }],
  "handmade-ceramics": [
    { name: "Handmade Ceramic Tiles", slug: "handmade-ceramic-tiles" },
    { name: "Handmade Ceramic Basins", slug: "handmade-ceramic-basins" },
    { name: "Handmade Ceramic Murals", slug: "handmade-ceramic-murals" },
    { name: "Handmade Ceramic Planters", slug: "handmade-ceramic-planters" },
  ],
  "wall-art": [
    { name: "Wall Art", slug: "wall-art" },
    { name: "Concrete Wall Art", slug: "concrete-wall-art" },
    { name: "Hand-Painted Wall Art", slug: "hand-painted-wall-art" },
    { name: "Digitally Printed Wall Art", slug: "digitally-printed-wall-art" },
    { name: "UV Printed Wall Art", slug: "uv-printed-wall-art" },
    { name: "FRP Wall Art", slug: "frp-wall-art" },
    { name: "Stone Wall Art", slug: "stone-wall-art" },
  ],
  marble: [
    { name: "Marble Capitals", slug: "marble-capitals" },
    { name: "Marble Cornices", slug: "marble-cornices" },
    { name: "Marble Mandir Interior Marbles", slug: "marble-mandir-interior-marbles" },
    { name: "Marble Planters", slug: "marble-planters" },
    { name: "Marble Statues", slug: "marble-statues" },
    { name: "Marble Wall Art", slug: "marble-wall-art" },
    { name: "Marble Basins", slug: "marble-basins" },
    { name: "Marble Inlay — On Site", slug: "marble-inlay-on-site" },
    { name: "Marble Inlay — On Countertop", slug: "marble-inlay-on-countertop" },
  ],
  // Named GRG POP throughout the site; the source list said "GRC POP".
  "grg-pop": [
    { name: "GRG POP Plus", slug: "grg-pop-plus" },
    { name: "GRG POP Capitals", slug: "grg-pop-capitals" },
    { name: "GRG POP Brackets", slug: "grg-pop-brackets" },
    { name: "GRG POP Cornices", slug: "grg-pop-cornices" },
    { name: "GRG POP Wall Panels", slug: "grg-pop-wall-panels" },
    { name: "GRG POP Ceiling Elements", slug: "grg-pop-ceiling-elements" },
  ],
  terracotta: [
    { name: "Terracotta Planters", slug: "terracotta-planters" },
    { name: "Handmade Terracotta Murals", slug: "handmade-terracotta-murals" },
    { name: "Terracotta Cladding Bricks", slug: "terracotta-cladding-bricks" },
    { name: "Terracotta Jali", slug: "terracotta-jali" },
    { name: "Terracotta Flooring", slug: "terracotta-flooring" },
    { name: "Terracotta Bricks", slug: "terracotta-bricks" },
  ],
};

/** Every `/products/<slug>` this file implies should exist (one per type,
 * `<type.slug>-sample`). Fed into generateStaticParams so each type's page
 * is always prerendered — not only once the database has a matching row —
 * and into the fallback lookup below. */
export const ALL_PRODUCT_TYPE_SLUGS: string[] = Object.values(PRODUCT_TYPES)
  .flat()
  .map((t) => `${t.slug}-sample`);

/**
 * Reverse lookup: given a product slug (e.g. "frp-capitals-sample"), finds
 * which material/type it belongs to.
 *
 * Why this exists: a type's real Product row only exists in the database
 * after `npx prisma db seed` has been run there. Production isn't reseeded
 * automatically on every deploy, so for a while after a new type is added
 * here, /products/<type-slug>-sample would 404 on the live site even though
 * the dropdown already links to it. The product detail page uses this as a
 * fallback — render a minimal page (name + enquiry form, no photo yet) from
 * this file alone — so that page is never a dead link, seeded or not. Once
 * the real row exists, the database version takes over automatically (same
 * slug), with no change needed here.
 */
export function findProductTypeBySlug(
  productSlug: string
): { materialSlug: string; type: ProductType } | null {
  const SUFFIX = "-sample";
  if (!productSlug.endsWith(SUFFIX)) return null;
  const typeSlug = productSlug.slice(0, -SUFFIX.length);

  for (const [materialSlug, types] of Object.entries(PRODUCT_TYPES)) {
    const type = types.find((t) => t.slug === typeSlug);
    if (type) return { materialSlug, type };
  }
  return null;
}

/**
 * Placeholder sample products — both the per-material ones and the per-type
 * ones this file's data generates — are named "<Name> — Sample" in the
 * database on purpose, so an admin can tell a real product from a
 * placeholder at a glance. That suffix belongs in the admin panel, not in
 * public-facing text that combines the name with something else (a
 * page-transition title, a "<Name> in <City>" heading) — this strips it for
 * display there only; the stored name and the admin view are unaffected.
 */
export function withoutSampleSuffix(name: string): string {
  return name.replace(/\s*—\s*Sample$/, "");
}

/**
 * A real photo for a type's own sample page — keyed by type slug (e.g.
 * "frp-capitals", matching ProductType.slug above, not the product's own
 * "<type-slug>-sample" slug). The type-sample products in prisma/seed.ts
 * are deliberately seeded with no image (see the comment there), so this is
 * the only place a type's photo lives; the product page renders it directly
 * above the shared enquiry form when an entry exists here, and shows
 * nothing in that spot otherwise — not every type has one yet.
 */
export const PRODUCT_TYPE_IMAGES: Record<string, { url: string; alt: string }> = {
  "frp-pillars": { url: "/images/types/frp-pillars.webp", alt: "FRP Pillars — By Devyora" },
  "frp-capitals": { url: "/images/types/frp-capitals.webp", alt: "FRP Capitals — By Devyora" },
  "frp-brackets": { url: "/images/types/frp-brackets.webp", alt: "FRP Brackets — By Devyora" },
  "frp-props": { url: "/images/types/frp-props.webp", alt: "FRP Props — By Devyora" },
  "frp-decorative-screens": {
    url: "/images/types/frp-decorative-screens.webp",
    alt: "FRP Decorative Screens — By Devyora",
  },
  "frp-planters": { url: "/images/types/frp-planters.webp", alt: "FRP Planters — By Devyora" },
  "frp-jali": { url: "/images/types/frp-jali.webp", alt: "FRP Jali — By Devyora" },
};
