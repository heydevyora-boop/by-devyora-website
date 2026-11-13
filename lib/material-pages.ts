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
  name: string;
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
    intro: `Premium ${name} by By Devyora — custom architectural elements made precisely to your drawings. Designed for durability, refined detailing and seamless installation across residential, commercial and restoration projects.`,
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
    name,
    heroImage,
    heroAlt: `${name} by Devyora`,
  };
}

/**
 * Same shape as neutralContent, but with a keyword-targeted intro and a
 * populated `applications` array (titled with the material's own
 * sub-products, from lib/product-types.ts) instead of the generic
 * boilerplate — so the material's H2 intro and H3 application cards each
 * carry real installation/technique keywords instead of empty sections.
 */
function seoContent(
  name: string,
  heroImage: string,
  intro: string,
  applications: { title: string; description: string }[]
): MaterialPageEntry {
  return {
    ...neutralMaterialContent(name),
    name,
    heroImage,
    heroAlt: `${name} by Devyora`,
    intro,
    applications,
  };
}

export const MATERIAL_PAGE_CONTENT: Record<string, MaterialPageEntry> = {
  wpc: seoContent(
    "WPC",
    "/images/WPC.webp",
    "WPC by Devyora — engineered for WPC decking installation techniques, WPC cladding board fixing methods and WPC pergola construction, with waterproof WPC decking systems built for durability and seamless installation.",
    [
      { title: "WPC Deck Flooring", description: "WPC deck flooring installation using composite deck board fixing methods, with careful expansion gap and joint detailing." },
      { title: "WPC Pergolas", description: "WPC pergola installation techniques for freestanding WPC pergola construction, built to withstand outdoor conditions." },
      { title: "WPC Gazebos", description: "WPC gazebo assembly and fixing methods for garden and terrace structures, finished with WPC surface brushing." },
    ]
  ),
  uhpc: seoContent(
    "UHPC",
    "/images/UHPC.webp",
    "UHPC by Devyora — ultra high performance concrete cladding systems using precise UHPC panel fixing and anchoring methods, with thin UHPC facade fabrication for high-strength UHPC casting.",
    [
      { title: "UHPC Wall Panels", description: "UHPC wall panel installation methods for large format UHPC cladding fixing on facades and interior walls." },
      { title: "UHPC Pillars", description: "UHPC pillar installation techniques for columns that combine high-strength casting with refined detailing." },
      { title: "UHPC Capitals & Brackets", description: "UHPC capital and bracket fixing methods for classical and contemporary architectural detailing." },
    ]
  ),
  marble: seoContent(
    "Marble",
    "/images/Marble.webp",
    "Marble by Devyora — architectural marble carving, marble inlay installation techniques and marble wall cladding systems, finished with precise marble surface finishing and polishing for mandir and interior applications.",
    [
      { title: "Marble Inlay (On Site / Countertop)", description: "Marble inlay work techniques and pietra dura installation methods, including the full marble inlay on countertop process." },
      { title: "Marble Capitals & Cornices", description: "Marble capital fixing and marble cornice installation for classical architectural detailing." },
      { title: "Marble Basins", description: "Marble basin installation methods and stone wash basin fixing for bathrooms and powder rooms." },
      { title: "Marble Statues", description: "Marble statue installation and anchoring methods, including foundation detailing for outdoor and indoor placement." },
      { title: "Marble Wall Art", description: "Marble wall art mounting techniques for feature walls and architectural surfaces." },
    ]
  ),
  "grg-pop": seoContent(
    "GRG POP",
    "/images/GRG-POP.webp",
    "GRG POP by Devyora — GRG POP ceiling installation techniques, GRG POP cornice fixing methods and GRG wall panel installation systems, moulded for lightweight, decorative GRG false ceilings.",
    [
      { title: "GRG POP Cornices", description: "GRG POP cornice installation techniques with clean joint finishing for ceilings and walls." },
      { title: "GRG POP Wall Panels", description: "GRG wall panel fixing methods for decorative interior surfaces." },
      { title: "GRG POP Ceiling Elements", description: "GRG ceiling element installation for false ceilings and architectural mouldings." },
      { title: "GRG POP Capitals & Brackets", description: "GRG capital and bracket mounting methods for decorative interior detailing." },
    ]
  ),
  planters: seoContent(
    "Planters",
    "/images/Planters.webp",
    "Planters by Devyora — large outdoor planter installation methods with careful drainage detailing for architectural planters, designed as commercial planter systems for landscape, terraces and podiums.",
    [
      { title: "Ceramic Planters", description: "Ceramic planter placement techniques with reliable drainage detailing for architectural planters." },
      { title: "Concrete Planters", description: "Custom planter fabrication process using lightweight planter placement techniques for terraces and podiums." },
      { title: "FRP Planters", description: "Large FRP planter installation with outdoor FRP planter drainage detailing, built for weatherproof performance." },
      { title: "Terracotta Planters", description: "Terracotta planter placement and drainage designed for landscape and courtyard settings." },
      { title: "Marble Planters", description: "Marble planter placement techniques for refined indoor and outdoor spaces." },
    ]
  ),
  "wall-art": seoContent(
    "Wall Art",
    "/images/Wall-Art.webp",
    "Wall Art by Devyora — wall art installation techniques for interiors, including concrete wall art mounting methods, UV printed wall art fixing systems and large format wall art installation.",
    [
      { title: "Concrete Wall Art", description: "Concrete wall art mounting methods for durable, textured feature walls." },
      { title: "UV Printed Wall Art", description: "UV printed wall art fixing systems for crisp, long-lasting imagery on interior and exterior walls." },
      { title: "Hand-Painted Wall Art", description: "Hand-painted wall art installation for bespoke, artisan-finished surfaces." },
      { title: "Stone Wall Art", description: "3D wall art anchoring techniques with outdoor wall art weatherproofing methods for stone panels." },
    ]
  ),
  brass: seoContent(
    "Brass",
    "/images/Brass.webp",
    "Brass by Devyora — brass antique installation and fixing methods, with decorative brass element mounting techniques and brass surface finishing and patina process for heritage-inspired interiors.",
    [
      { title: "Brass Antiques", description: "Brass antique installation and fixing methods, including brass architectural hardware installation and brass artefact conservation methods." },
    ]
  ),
  "handmade-ceramics": seoContent(
    "Handmade Ceramics",
    "/images/Handmade-Ceramics.webp",
    "Handmade Ceramics by Devyora — handmade ceramic tile installation techniques, ceramic mural fixing methods and handmade ceramic basin installation, finished with artisan ceramic surface finishing.",
    [
      { title: "Handmade Ceramic Tiles", description: "Handmade ceramic tile installation techniques with careful ceramic tile joint and grouting methods." },
      { title: "Handmade Ceramic Basins", description: "Handmade ceramic basin installation for bathrooms and wash areas." },
      { title: "Handmade Ceramic Murals", description: "Ceramic mural fixing methods for feature walls and artisan surfaces." },
      { title: "Handmade Ceramic Planters", description: "Ceramic planter placement techniques for indoor and outdoor greenery." },
    ]
  ),
  terrazzo: seoContent(
    "Terrazzo",
    "/images/Terrazzo.webp",
    "Terrazzo by Devyora — terrazzo flooring installation techniques, on-site terrazzo pouring and finishing process and terrazzo inlay installation methods, completed with precise terrazzo grinding and polishing.",
    [
      { title: "Terrazzo — On-Site Work", description: "On-site terrazzo installation techniques for a seamless terrazzo flooring process poured and finished in place." },
      { title: "Terrazzo Casted Tiles", description: "Terrazzo tile installation methods for pre-cast terrazzo tile laying." },
      { title: "Terrazzo Inlay Tiles", description: "Terrazzo inlay installation techniques for decorative patterned flooring." },
      { title: "Customizable Terrazzo", description: "Custom terrazzo design and casting process, including custom terrazzo mix design." },
    ]
  ),
  "designer-tiles": seoContent(
    "Designer Tiles",
    "/images/Designer-Tiles.webp",
    "Designer Tiles by Devyora — designer wall tile installation techniques, designer floor tile installation and feature wall tile laying methods, finished with patterned tile joint detailing.",
    [
      { title: "Designer Tile Highlighters", description: "Highlight tile placement techniques for accent walls and feature strips." },
      { title: "Flooring Designer Tiles", description: "Designer floor tile installation using large format designer tile fixing methods." },
      { title: "Wall Designer Tiles", description: "Designer wall tile installation techniques and feature wall tile laying methods." },
    ]
  ),
  basins: seoContent(
    "Basins",
    "/images/Basins.webp",
    "Basins by Devyora — designer wash basin installation methods, countertop basin fixing techniques and stone basin plumbing and sealing, covering marble, terrazzo, UHPC and ceramic basin installation.",
    [
      { title: "Terrazzo Basins", description: "Terrazzo basin installation methods with countertop basin fixing techniques." },
      { title: "UHPC Basins", description: "UHPC basin installation methods built for durable, custom basin mounting systems." },
      { title: "Marble Basins", description: "Marble basin installation methods with stone basin plumbing and sealing." },
      { title: "Ceramic Basins", description: "Ceramic basin installation methods with basin overflow and drainage detailing." },
      { title: "Customizable Basins", description: "Custom basin mounting systems designed to your drawing and specification." },
    ]
  ),
};

// GRC, FRP and Terracotta's hero photo is hardcoded inline in
// app/(site)/materials/[slug]/page.tsx (ahead of everything else, including
// this file) rather than configured here — mirrored here only so
// resolveMaterialHeroImage can reuse the exact same photo, not a new one.
const SPECIAL_HERO_IMAGES: Record<string, { url: string; alt: string }> = {
  grc: { url: "/images/GRC.webp", alt: "GRC facade installation and panel fixing by Devyora" },
  frp: { url: "/images/FRP.webp", alt: "FRP canopy and cladding installation by Devyora" },
  terracotta: { url: "/images/Tera.webp", alt: "Terracotta rainscreen cladding and jali installation by Devyora" },
  teracotta: { url: "/images/Tera.webp", alt: "Terracotta rainscreen cladding and jali installation by Devyora" },
};

/**
 * The same hero photo a material's own /materials/[slug] page shows,
 * resolved in the identical order that page uses (GRC/FRP/Terracotta's
 * hardcoded photo, then this file's MATERIAL_PAGE_CONTENT, then the
 * database's heroImage field) — so a by-city page like "GRC in Bhopal"
 * shows the exact same photo as "GRC" itself, never a different or newly
 * invented one. Returns null when none of those has a photo yet.
 */
export function resolveMaterialHeroImage(
  slug: string,
  materialName: string,
  dbHeroImage?: string | null
): { url: string; alt: string } | null {
  const special = SPECIAL_HERO_IMAGES[slug];
  if (special) return special;

  const extra = MATERIAL_PAGE_CONTENT[slug];
  if (extra) return { url: extra.heroImage, alt: extra.heroAlt };

  if (dbHeroImage) return { url: dbHeroImage, alt: `${materialName} — Architectural Material` };

  return null;
}
