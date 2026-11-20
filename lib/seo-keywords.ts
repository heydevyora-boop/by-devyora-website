<<<<<<< HEAD
import { PRODUCT_TYPES } from "@/lib/product-types";

=======
>>>>>>> 3d3d28aaaa6a7e05ce16ca166eda88d82609d24d
/**
 * SEO keyword targeting for material and product pages — titles, meta
 * descriptions and body copy, keyed by material slug (MATERIAL_SEO_KEYWORDS)
 * and by product-type slug (PRODUCT_TYPE_SEO, matching ProductType.slug in
 * lib/product-types.ts). Looked up by generateMetadata/page bodies in
 * app/(site)/materials/[slug]/page.tsx and app/(site)/products/[slug]/page.tsx
<<<<<<< HEAD
 * so every material and sub-product targets product discovery, buying and
 * customisation searches rather than relying on installation-method phrases.
=======
 * so every material and sub-product targets its own installation/technique
 * keyword phrase rather than one generic sentence repeated everywhere.
>>>>>>> 3d3d28aaaa6a7e05ce16ca166eda88d82609d24d
 *
 * Editing or adding content/design here only changes text — it doesn't
 * affect routing, data fetching or layout.
 */

export type MaterialSeoEntry = {
  /** Appended to the material name in the page <title>, e.g. "GRC — <titleKeyword>". */
  titleKeyword: string;
  /** Meta description — overrides the database tagline/description for this field only. */
  description: string;
<<<<<<< HEAD
  keywords?: string[];
=======
>>>>>>> 3d3d28aaaa6a7e05ce16ca166eda88d82609d24d
};

export const MATERIAL_SEO_KEYWORDS: Record<string, MaterialSeoEntry> = {
  grc: {
<<<<<<< HEAD
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
=======
    titleKeyword: "GRC Facade Installation & Panel Fixing",
    description:
      "GRC facade installation techniques, panel fixing methods and mould making process for lightweight, curved architectural cladding — made to drawing by By Devyora.",
  },
  frp: {
    titleKeyword: "FRP Canopy & Cladding Installation",
    description:
      "FRP canopy installation techniques, cladding panel fixing methods and gelcoat finishing process for lightweight architectural elements — made to drawing by By Devyora.",
  },
  terracotta: {
    titleKeyword: "Terracotta Rainscreen & Jali Installation",
    description:
      "Terracotta rainscreen cladding systems, baguette installation methods and jali screen installation for natural clay facades — made to drawing by By Devyora.",
  },
  wpc: {
    titleKeyword: "WPC Decking & Cladding Installation",
    description:
      "WPC decking installation techniques, cladding board fixing methods and pergola construction process for durable, waterproof composite outdoor systems by By Devyora.",
  },
  uhpc: {
    titleKeyword: "UHPC Panel Installation & Fixing",
    description:
      "UHPC wall panel installation techniques, panel fixing and anchoring methods for ultra high performance concrete cladding systems by By Devyora.",
  },
  marble: {
    titleKeyword: "Marble Inlay & Cladding Installation",
    description:
      "Marble inlay installation techniques, capital and cornice fixing methods and wall cladding systems for architectural marble by By Devyora.",
  },
  "grg-pop": {
    titleKeyword: "GRG POP Ceiling & Cornice Installation",
    description:
      "GRG POP ceiling installation techniques, cornice fixing methods and wall panel installation systems for lightweight decorative mouldings by By Devyora.",
  },
  planters: {
    titleKeyword: "Architectural Planter Installation",
    description:
      "Large outdoor planter installation methods with drainage detailing for architectural planters — commercial planter systems for landscape by By Devyora.",
  },
  "wall-art": {
    titleKeyword: "Wall Art Installation & Mounting",
    description:
      "Wall art installation techniques for interiors, concrete and UV printed wall art mounting and fixing systems by By Devyora.",
  },
  brass: {
    titleKeyword: "Brass Antique Installation & Fixing",
    description:
      "Brass antique installation and fixing methods, decorative brass element mounting techniques and surface finishing process by By Devyora.",
  },
  "handmade-ceramics": {
    titleKeyword: "Handmade Ceramic Tile & Basin Installation",
    description:
      "Handmade ceramic tile installation techniques, mural fixing methods and basin installation for artisan ceramic surfaces by By Devyora.",
  },
  terrazzo: {
    titleKeyword: "Terrazzo Flooring & Inlay Installation",
    description:
      "Terrazzo flooring installation techniques, on-site pouring and finishing process and inlay installation methods by By Devyora.",
  },
  "designer-tiles": {
    titleKeyword: "Designer Tile Installation Techniques",
    description:
      "Designer wall tile installation techniques, feature wall tile laying methods and designer floor tile installation by By Devyora.",
  },
  basins: {
    titleKeyword: "Designer Basin Installation & Fixing",
    description:
      "Designer wash basin installation methods, countertop basin fixing techniques and marble, terrazzo, UHPC or ceramic basin installation by By Devyora.",
>>>>>>> 3d3d28aaaa6a7e05ce16ca166eda88d82609d24d
  },
};

/**
 * One keyword-rich sentence per product type (sub-product), keyed the same
 * way as ProductType.slug in lib/product-types.ts. Used only for type-sample
 * products (see findProductTypeBySlug) — takes priority over their seeded
 * `shortDescription`, which is itself only generic boilerplate ("<Name>,
 * made to drawing."), never hand-authored copy.
 */
<<<<<<< HEAD
export const PRODUCT_TYPE_SEO: Record<string, string> = Object.fromEntries(
  Object.values(PRODUCT_TYPES).flat().map((productType) => [
    productType.slug,
    `Explore ${productType.name.toLowerCase()} by By Devyora for residential, commercial and architectural projects. Discuss custom designs, dimensions, finishes and project quantities, with delivery across India.`,
  ] as const),
);
=======
export const PRODUCT_TYPE_SEO: Record<string, string> = {
  "grc-pillars": "GRC pillar installation methods, load-bearing GRC pillars and decorative GRC pillar fixing, made to drawing by By Devyora.",
  "grc-capitals": "GRC capital attachment techniques for classical GRC capital detailing, made to drawing by By Devyora.",
  "grc-brackets": "GRC bracket support systems and structural GRC bracket installation, made to drawing by By Devyora.",
  "grc-jali": "GRC jali screen fixing methods, perforated GRC jali installation and GRC jali for ventilation, made to drawing by By Devyora.",

  "frp-pillars": "FRP pillar installation techniques for lightweight FRP column fixing, made to drawing by By Devyora.",
  "frp-capitals": "FRP capital mounting methods for refined architectural detailing, made to drawing by By Devyora.",
  "frp-brackets": "FRP bracket support systems for structural and decorative applications, made to drawing by By Devyora.",
  "frp-jali": "FRP decorative screen installation and FRP jali fixing methods, made to drawing by By Devyora.",
  "frp-decorative-screens": "FRP decorative screen installation and FRP jali fixing methods for facades and partitions, made to drawing by By Devyora.",
  "frp-props": "FRP architectural prop fabrication techniques for lightweight structural elements, made to drawing by By Devyora.",
  "frp-planters": "Large FRP planter installation with outdoor FRP planter drainage detailing, made to drawing by By Devyora.",

  "wpc-pergolas": "WPC pergola installation techniques for freestanding WPC pergola construction, made to drawing by By Devyora.",
  "wpc-gazebos": "WPC gazebo assembly and fixing methods for garden and terrace structures, made to drawing by By Devyora.",
  "wpc-deck-flooring": "WPC deck flooring installation using composite deck board fixing methods, made to drawing by By Devyora.",

  "uhpc-wall-panels": "UHPC wall panel installation methods for large format UHPC cladding fixing, made to drawing by By Devyora.",
  "uhpc-pillars": "UHPC pillar installation techniques for high-strength architectural columns, made to drawing by By Devyora.",
  "uhpc-capitals": "UHPC capital and bracket fixing methods for classical architectural detailing, made to drawing by By Devyora.",
  "uhpc-brackets": "UHPC capital and bracket fixing methods for structural and decorative support, made to drawing by By Devyora.",

  "brass-antiques":
    "Brass antique installation and fixing methods, decorative brass element mounting techniques, brass surface finishing and patina process, brass architectural hardware installation and brass artefact conservation methods, made to drawing by By Devyora.",

  "handmade-ceramic-tiles": "Handmade ceramic tile installation techniques with careful ceramic tile joint and grouting methods, made to drawing by By Devyora.",
  "handmade-ceramic-basins": "Handmade ceramic basin installation for bathrooms and wash areas, made to drawing by By Devyora.",
  "handmade-ceramic-murals": "Ceramic mural fixing methods for feature walls and artisan surfaces, made to drawing by By Devyora.",
  "handmade-ceramic-planters": "Ceramic planter placement techniques for indoor and outdoor greenery, made to drawing by By Devyora.",

  "wall-art": "Wall art installation techniques for interiors, made to drawing by By Devyora.",
  "concrete-wall-art": "Concrete wall art mounting methods for durable, textured feature walls, made to drawing by By Devyora.",
  "hand-painted-wall-art": "Hand-painted wall art installation for bespoke, artisan-finished surfaces, made to drawing by By Devyora.",
  "digitally-printed-wall-art": "Large format wall art installation with digitally printed detailing, made to drawing by By Devyora.",
  "uv-printed-wall-art": "UV printed wall art fixing systems for crisp, long-lasting imagery, made to drawing by By Devyora.",
  "frp-wall-art": "FRP wall art installation techniques for lightweight, large format wall art installation, made to drawing by By Devyora.",
  "stone-wall-art": "3D wall art anchoring techniques with outdoor wall art weatherproofing methods, made to drawing by By Devyora.",

  "marble-capitals": "Marble capital fixing for classical architectural detailing, made to drawing by By Devyora.",
  "marble-cornices": "Marble cornice installation for refined architectural transitions, made to drawing by By Devyora.",
  "marble-mandir-interior-marbles": "Marble mandir interior installation for temple and devotional spaces, made to drawing by By Devyora.",
  "marble-planters": "Marble planter placement techniques for refined indoor and outdoor spaces, made to drawing by By Devyora.",
  "marble-statues": "Marble statue installation and foundation methods for outdoor and indoor placement, made to drawing by By Devyora.",
  "marble-wall-art": "Marble wall art mounting techniques for feature walls and architectural surfaces, made to drawing by By Devyora.",
  "marble-basins": "Marble basin installation methods and stone wash basin fixing, made to drawing by By Devyora.",
  "marble-inlay-on-site": "Marble inlay work techniques and pietra dura installation methods, made to drawing by By Devyora.",
  "marble-inlay-on-countertop": "Marble inlay on countertop process with pietra dura installation methods, made to drawing by By Devyora.",

  "grg-pop-plus": "Lightweight GRG moulding process for decorative ceiling and wall elements, made to drawing by By Devyora.",
  "grg-pop-capitals": "GRG capital and bracket mounting methods for decorative interior detailing, made to drawing by By Devyora.",
  "grg-pop-brackets": "GRG capital and bracket mounting methods for structural and decorative support, made to drawing by By Devyora.",
  "grg-pop-cornices": "GRG POP cornice installation techniques with clean joint finishing, made to drawing by By Devyora.",
  "grg-pop-wall-panels": "GRG wall panel fixing methods for decorative interior surfaces, made to drawing by By Devyora.",
  "grg-pop-ceiling-elements": "GRG ceiling element installation for false ceilings and architectural mouldings, made to drawing by By Devyora.",

  "terracotta-planters": "Terracotta planter placement and drainage designed for landscape settings, made to drawing by By Devyora.",
  "handmade-terracotta-murals": "Terracotta mural installation techniques for artisan feature walls, made to drawing by By Devyora.",
  "terracotta-cladding-bricks": "Terracotta cladding installation techniques with rainscreen terracotta fixing, made to drawing by By Devyora.",
  "terracotta-jali": "Terracotta jali installation methods for perforated terracotta screen fixing, made to drawing by By Devyora.",
  "terracotta-flooring": "Terracotta floor tile laying techniques for durable, natural-finish floors, made to drawing by By Devyora.",
  "terracotta-bricks": "Exposed terracotta brick construction methods for facades and walls, made to drawing by By Devyora.",

  "terrazzo-on-site-work": "On-site terrazzo installation techniques for a seamless terrazzo flooring process, made to drawing by By Devyora.",
  "terrazzo-casted-tiles": "Terrazzo tile installation methods for pre-cast terrazzo tile laying, made to drawing by By Devyora.",
  "terrazzo-inlay-tiles": "Terrazzo inlay installation techniques for decorative patterned flooring, made to drawing by By Devyora.",
  "customizable-terrazzo": "Custom terrazzo design and casting process with custom terrazzo mix design, made to drawing by By Devyora.",

  "designer-tile-highlighters": "Highlight tile placement techniques for accent walls and feature strips, made to drawing by By Devyora.",
  "flooring-designer-tiles": "Designer floor tile installation using large format designer tile fixing methods, made to drawing by By Devyora.",
  "wall-designer-tiles": "Designer wall tile installation techniques and feature wall tile laying methods, made to drawing by By Devyora.",

  "basin-terrazzo": "Terrazzo basin installation methods with countertop basin fixing techniques, made to drawing by By Devyora.",
  "basin-uhpc": "UHPC basin installation methods built for durable, custom basin mounting systems, made to drawing by By Devyora.",
  "basin-marble": "Marble basin installation methods with stone basin plumbing and sealing, made to drawing by By Devyora.",
  "basin-ceramic": "Ceramic basin installation methods with basin overflow and drainage detailing, made to drawing by By Devyora.",
  "basin-customizable": "Custom basin mounting systems designed to your drawing and specification, made to drawing by By Devyora.",

  "planter-ceramic": "Ceramic planter placement techniques with drainage detailing for architectural planters, made to drawing by By Devyora.",
  "planter-concrete": "Custom planter fabrication process using lightweight planter placement techniques, made to drawing by By Devyora.",
  "planter-frp": "Large FRP planter installation with outdoor FRP planter drainage detailing, made to drawing by By Devyora.",
  "planter-terracotta": "Terracotta planter placement and drainage designed for landscape settings, made to drawing by By Devyora.",
  "planter-marble": "Marble planter placement techniques for refined indoor and outdoor spaces, made to drawing by By Devyora.",
};
>>>>>>> 3d3d28aaaa6a7e05ce16ca166eda88d82609d24d
