/**
 * The materials shown in the Products nav dropdown's animated rail — one
 * source of truth, used in two places:
 *   - components/site/header.tsx — builds the rail itself (desktop dropdown
 *     and mobile menu share this).
 *   - app/(site)/materials/page.tsx — the "View All Products" page, so its
 *     featured row and photos always match the rail exactly rather than
 *     drifting out of sync or falling back to unrelated stock photography.
 *
 * `slug` is the fallback used if no published Material row matches `name`
 * yet; once one exists, its own `slug` takes over (see header.tsx).
 */
export const MATERIAL_NAV_ITEMS = [
  { name: "GRC", slug: "grc", image: "/images/nav-products/GRC.webp" },
  { name: "FRP", slug: "frp", image: "/images/nav-products/FRP.webp" },
  { name: "Terracotta", slug: "terracotta", image: "/images/nav-products/Terracotta.webp" },
  { name: "WPC", slug: "wpc", image: "/images/nav-products/WPC.webp" },
  { name: "UHPC", slug: "uhpc", image: "/images/nav-products/UHPC.webp" },
  { name: "Marble", slug: "marble", image: "/images/nav-products/Marble.webp" },
  { name: "GRG POP", slug: "grg-pop", image: "/images/nav-products/GRG-POP.webp" },
  { name: "Planters", slug: "planters", image: "/images/nav-products/Planters.webp" },
  { name: "Wall Art", slug: "wall-art", image: "/images/nav-products/Wall-Art.webp" },
  { name: "Brass", slug: "brass", image: "/images/nav-products/Brass.webp" },
  { name: "Handmade Ceramics", slug: "handmade-ceramics", image: "/images/nav-products/Handmade-Ceramics.webp" },
  { name: "Terrazzo", slug: "terrazzo", image: "/images/nav-products/Terrazzo.webp" },
  { name: "Designer Tiles", slug: "designer-tiles", image: "/images/nav-products/Designer-Tiles.webp" },
  { name: "Basins", slug: "basins", image: "/images/nav-products/Basins.webp" },
] as const;

/** `MATERIAL_NAV_ITEMS`, keyed by slug, for quick "does this material have a
 * known branded photo" lookups (e.g. the materials listing page). */
export const MATERIAL_NAV_IMAGES: Record<string, string> = Object.fromEntries(
  MATERIAL_NAV_ITEMS.map((item) => [item.slug, item.image])
);
