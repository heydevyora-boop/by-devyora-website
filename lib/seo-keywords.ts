import { PRODUCT_TYPES } from "@/lib/product-types";

/**
 * SEO keyword targeting for material and product pages — titles, meta
 * descriptions and body copy, keyed by material slug (MATERIAL_SEO_KEYWORDS)
 * and by product-type slug (PRODUCT_TYPE_SEO, matching ProductType.slug in
 * lib/product-types.ts). Looked up by generateMetadata/page bodies in
 * app/(site)/materials/[slug]/page.tsx and app/(site)/products/[slug]/page.tsx
 * so every material and sub-product targets product discovery, buying and
 * customisation searches rather than relying on installation-method phrases.
 *
 * Editing or adding content/design here only changes text — it doesn't
 * affect routing, data fetching or layout.
 */

export type MaterialSeoEntry = {
  /** Appended to the material name in the page <title>, e.g. "GRC — <titleKeyword>". */
  titleKeyword: string;
  /** Meta description — overrides the database tagline/description for this field only. */
  description: string;
  keywords?: string[];
};

export const MATERIAL_SEO_KEYWORDS: Record<string, MaterialSeoEntry> = {
  grc: {
    titleKeyword: "GRC Products, Pillars & Architectural Elements",
    description:
      "Explore GRC architectural products by By Devyora, including decorative pillars, capitals, brackets and jali. Custom designs made to drawing for facades, entrances and architectural projects across India.",
    keywords: ["GRC products", "GRC pillars", "GRC columns", "GRC jali", "GRC capitals", "GRC manufacturer India"],
  },
  frp: {
    titleKeyword: "FRP Products, Pillars & Decorative Elements",
    description:
      "Explore custom FRP architectural products by By Devyora, including pillars, columns, capitals, brackets, jali, decorative screens and planters. Made to drawing for projects across India.",
    keywords: ["FRP products", "FRP pillars", "FRP columns", "FRP jali", "FRP planters", "FRP manufacturer India"],
  },
  terracotta: {
    titleKeyword: "Terracotta Products, Jali & Planters",
    description:
      "Explore terracotta architectural products by By Devyora, including terracotta jali, planters, cladding bricks, murals and flooring for residential and commercial projects.",
    keywords: ["terracotta products", "terracotta jali", "terracotta planters", "terracotta bricks", "terracotta cladding", "terracotta supplier India"],
  },
  wpc: {
    titleKeyword: "WPC Pergolas, Gazebos & Deck Flooring",
    description:
      "Explore WPC outdoor products by By Devyora, including pergolas, gazebos and deck flooring. Discuss design, dimensions and project requirements for residential and commercial spaces.",
    keywords: ["WPC pergolas", "WPC gazebos", "WPC deck flooring", "WPC outdoor products"],
  },
  uhpc: {
    titleKeyword: "UHPC Wall Panels, Pillars & Architectural Products",
    description:
      "Explore UHPC architectural products by By Devyora, including wall panels, pillars, capitals and brackets. Custom detailing for contemporary facades and architectural projects.",
    keywords: ["UHPC wall panels", "UHPC pillars", "UHPC capitals", "UHPC architectural products"],
  },
  marble: {
    titleKeyword: "Marble Capitals, Cornices & Custom Stone Products",
    description:
      "Explore marble architectural products by By Devyora, including capitals, cornices, planters, basins, statues, wall art and custom inlay work.",
    keywords: ["marble capitals", "marble cornices", "marble planters", "marble basins", "marble inlay"],
  },
  "grg-pop": {
    titleKeyword: "GRG POP Cornices, Capitals & Ceiling Elements",
    description:
      "Explore GRG POP decorative products by By Devyora, including cornices, capitals, brackets, wall panels and ceiling elements for interior architecture.",
    keywords: ["GRG POP cornices", "GRG POP capitals", "GRG wall panels", "GRG ceiling elements"],
  },
  planters: {
    titleKeyword: "Custom Architectural Planters in Multiple Materials",
    description:
      "Explore architectural planters by By Devyora in FRP, terracotta, ceramic, concrete and marble. Custom sizes and finishes for gardens, terraces, entrances and landscapes.",
    keywords: ["architectural planters", "FRP planters", "terracotta planters", "marble planters", "ceramic planters"],
  },
  "wall-art": {
    titleKeyword: "Decorative Wall Art & 3D Feature Panels",
    description:
      "Explore decorative wall art by By Devyora, including concrete, hand-painted, printed, FRP and stone wall art for residential and commercial interiors.",
    keywords: ["decorative wall art", "concrete wall art", "FRP wall art", "3D wall art", "stone wall art"],
  },
  brass: {
    titleKeyword: "Brass Antiques & Decorative Brass Elements",
    description:
      "Explore brass antiques and decorative brass elements by By Devyora for architectural, interior and styling projects. Discuss design references and project requirements.",
    keywords: ["brass antiques", "decorative brass elements", "brass architectural decor"],
  },
  "handmade-ceramics": {
    titleKeyword: "Handmade Ceramic Tiles, Basins & Artisan Surfaces",
    description:
      "Explore handmade ceramic tiles, basins, murals and planters by By Devyora. Artisan surfaces and design-led ceramic products for bathrooms, kitchens and feature spaces.",
    keywords: ["handmade ceramic tiles", "handmade ceramic basins", "ceramic murals", "ceramic planters"],
  },
  terrazzo: {
    titleKeyword: "Terrazzo Flooring, Cast Tiles & Inlay Products",
    description:
      "Explore terrazzo products and services by By Devyora, including cast tiles, inlay tiles, custom terrazzo and on-site terrazzo flooring for architectural spaces.",
    keywords: ["terrazzo flooring", "terrazzo tiles", "terrazzo inlay", "custom terrazzo"],
  },
  "designer-tiles": {
    titleKeyword: "Designer Wall Tiles, Floor Tiles & Highlighters",
    description:
      "Explore designer wall tiles, floor tiles and tile highlighters by By Devyora for distinctive residential, hospitality and commercial interiors.",
    keywords: ["designer wall tiles", "designer floor tiles", "tile highlighters", "decorative tiles"],
  },
  basins: {
    titleKeyword: "Designer Basins in Marble, Terrazzo, UHPC & Ceramic",
    description:
      "Explore designer wash basins by By Devyora in terrazzo, UHPC, marble and ceramic, with customisable designs for bathrooms and powder rooms.",
    keywords: ["designer basins", "terrazzo basins", "UHPC basins", "marble basins", "ceramic basins"],
  },
};

/**
 * One keyword-rich sentence per product type (sub-product), keyed the same
 * way as ProductType.slug in lib/product-types.ts. Used only for type-sample
 * products (see findProductTypeBySlug) — takes priority over their seeded
 * `shortDescription`, which is itself only generic boilerplate ("<Name>,
 * made to drawing."), never hand-authored copy.
 */
export const PRODUCT_TYPE_SEO: Record<string, string> = Object.fromEntries(
  Object.values(PRODUCT_TYPES).flat().map((productType) => [
    productType.slug,
    `Explore ${productType.name.toLowerCase()} by By Devyora for residential, commercial and architectural projects. Discuss custom designs, dimensions, finishes and project quantities, with delivery across India.`,
  ] as const),
);
