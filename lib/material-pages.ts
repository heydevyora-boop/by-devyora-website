/**
 * Per-material page content for /materials/[slug].
 *
 * Add or edit an entry here to change what a material's detail page shows.
 * GRC, FRP and Terracotta keep their original content inside
 * app/(site)/materials/[slug]/page.tsx and are intentionally not listed here.
 *
 * Sections hide themselves while their content is empty:
 *   - applications / whyChoose      -> hidden when the array is []
 *   - productsText + description    -> hidden when both are ""
 * so nothing is shown on the live site until real copy is added.
 *
 * Hero images live in /public/images/ (same convention as GRC.webp, FRP.webp).
 */

export type MaterialPageContent = {
  eyebrow: string;
  intro: string;
  applicationsLabel: string;
  applications: { title: string; description: string }[];
  productsLabel: string;
  productsText: string;
  productsDescription: string;
  whyChoose: { title: string; description: string }[];
  ctaEyebrow: string;
  ctaDescription: string;
};

/** Content plus the hero image used by materials configured in this file. */
export type MaterialPageEntry = MaterialPageContent & {
  heroImage: string;
  heroAlt: string;
};

/**
 * Neutral copy only. Replace per product once final descriptions exist.
 *
 * Also used directly by /materials/[slug] as the fallback for any material
 * that has no entry below, so every material page renders the same intro and
 * the same enquiry form rather than dropping that whole section.
 */
export function neutralMaterialContent(name: string): MaterialPageContent {
  return {
    eyebrow: `${name} — By Devyora`,
    intro: `${name} by Devyora. Share your drawing, reference image or project requirement to discuss ${name} for your project.`,
    applicationsLabel: `${name} Applications`,
    applications: [],
    productsLabel: `${name} Products`,
    productsText: "",
    productsDescription: "",
    whyChoose: [],
    ctaEyebrow: `${name} By Devyora`,
    ctaDescription: `Share your drawing, reference image, dimensions or project requirement with By Devyora to discuss ${name}.`,
  };
}

function neutralContent(name: string, heroImage: string): MaterialPageEntry {
  return {
    ...neutralMaterialContent(name),
    heroImage,
    heroAlt: `${name} by Devyora`,
  };
}

export const MATERIAL_PAGE_CONTENT: Record<string, MaterialPageEntry> = {
  wpc: neutralContent("WPC", "/images/WPC.webp"),
  uhpc: neutralContent("UHPC", "/images/UHPC.webp"),
  marble: neutralContent("Marble", "/images/Marble.webp"),
  "grg-pop": neutralContent("GRG POP", "/images/GRG-POP.webp"),
  planters: neutralContent("Planters", "/images/Planters.webp"),
  "wall-art": neutralContent("Wall Art", "/images/Wall-Art.webp"),
  brass: neutralContent("Brass", "/images/Brass.webp"),
  "handmade-ceramics": neutralContent("Handmade Ceramics", "/images/Handmade-Ceramics.webp"),
  terrazzo: neutralContent("Terrazzo", "/images/Terrazzo.webp"),
  "designer-tiles": neutralContent("Designer Tiles", "/images/Designer-Tiles.webp"),
};
