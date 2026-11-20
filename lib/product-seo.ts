import { PRODUCT_TYPES } from "@/lib/product-types";

export type ProductSeoContent = {
  titleKeyword: string;
  description: string;
  keywords: string[];
  intro: string;
  applications: string[];
};

const CUSTOM_CONTENT: Record<string, Partial<ProductSeoContent>> = {
  "grc-pillars": {
    titleKeyword: "Decorative GRC Pillars & Columns",
    description: "Explore custom GRC pillars and decorative GRC columns by By Devyora. Made to drawing for entrances, facades and architectural elevations, with custom profiles, finishes and PAN-India delivery.",
    keywords: ["GRC pillars", "GRC columns", "decorative GRC pillars", "GRC pillar manufacturer", "custom GRC columns"],
    intro: "By Devyora offers custom GRC pillars and decorative columns for architectural entrances, porticos, balconies and facade elevations. Share your drawing, dimensions or reference to discuss a made-to-order design, finish and project requirement.",
    applications: ["Main entrances and porticos", "Residential and commercial facades", "Balconies, verandahs and colonnades"],
  },
  "grc-capitals": {
    titleKeyword: "Decorative GRC Column Capitals",
    description: "Custom GRC capitals for columns and architectural elevations by By Devyora. Explore classical and contemporary profiles made to drawing, with custom detailing and delivery across India.",
    keywords: ["GRC capitals", "GRC column capitals", "decorative column capitals", "custom GRC capitals"],
    intro: "GRC capitals add a defined architectural transition at the top of columns and pillars. By Devyora can discuss custom capital profiles, proportions and surface details based on your elevation or reference drawing.",
    applications: ["Classical columns and porticos", "Facade and entrance detailing", "Restoration and bespoke architecture"],
  },
  "grc-jali": {
    titleKeyword: "Decorative GRC Jali & Screens",
    description: "Custom GRC jali and decorative concrete screens by By Devyora for facades, balconies and partitions. Discuss pattern, dimensions and finish with PAN-India delivery.",
    keywords: ["GRC jali", "GRC jaali", "decorative concrete jali", "GRC screens", "concrete jali manufacturer"],
    intro: "GRC jali screens combine patterned architectural detail with filtered light and ventilation. By Devyora works with custom patterns, panel sizes and project references for residential and commercial spaces.",
    applications: ["Balcony and facade screens", "Courtyards and ventilated partitions", "Decorative boundary and feature walls"],
  },
  "frp-pillars": {
    titleKeyword: "Lightweight FRP Pillars & Columns",
    description: "Custom FRP pillars and FRP columns by By Devyora for entrances, facades and interior features. Made to drawing with project-specific sizes, profiles and finishes across India.",
    keywords: ["FRP pillars", "FRP columns", "FRP column manufacturer", "decorative FRP columns", "custom FRP pillars"],
    intro: "FRP pillars and columns are useful for lightweight decorative architectural elements and shaped profiles. By Devyora can review your drawings, dimensions and finish references before preparing a project-specific solution.",
    applications: ["Building entrances and facade features", "Interior columns and decorative wraps", "Hospitality and commercial spaces"],
  },
  "frp-jali": {
    titleKeyword: "FRP Jali & Decorative Screens",
    description: "Custom FRP jali and lightweight decorative screens by By Devyora for partitions, balconies and facades. Made to drawing with custom patterns and PAN-India delivery.",
    keywords: ["FRP jali", "FRP jaali", "FRP decorative screens", "FRP partition screens", "custom FRP screens"],
    intro: "FRP jali and decorative screens can be specified for custom patterns, panel dimensions and selected finishes. Share the intended application and reference design to discuss suitability for your project.",
    applications: ["Balconies and facade features", "Interior partitions", "Decorative screening"],
  },
  "frp-decorative-screens": {
    titleKeyword: "FRP Decorative Screens & Partitions",
    description: "Explore custom FRP decorative screens and partition panels by By Devyora. Made to drawing for architectural and interior applications, with custom patterns and delivery across India.",
    keywords: ["FRP decorative screens", "FRP partition panels", "FRP screens manufacturer", "custom FRP screens"],
    intro: "By Devyora helps specify FRP decorative screen panels for interior and exterior design concepts. Panel size, pattern, finish and fixing requirements can be discussed against your drawings.",
    applications: ["Interior partitions", "Facade and balcony screens", "Feature panels"],
  },
  "frp-planters": {
    titleKeyword: "Custom FRP Planters & Large Outdoor Pots",
    description: "Custom FRP planters by By Devyora for gardens, terraces, landscapes and commercial spaces. Explore made-to-order sizes, shapes and finishes with delivery across India.",
    keywords: ["FRP planters", "large FRP planters", "FRP outdoor planters", "FRP planter manufacturer", "fiberglass planters"],
    intro: "FRP planters offer design flexibility for large-format indoor and outdoor planting schemes. By Devyora can discuss custom dimensions, shapes, finish options and drainage requirements for your space.",
    applications: ["Landscape and garden projects", "Terraces, balconies and courtyards", "Hotels, offices and commercial entrances"],
  },
  "terracotta-planters": {
    titleKeyword: "Terracotta Planters & Clay Garden Pots",
    description: "Terracotta planters and clay garden pots by By Devyora for homes, gardens and landscape projects. Discuss shapes, sizes and finishes with PAN-India delivery.",
    keywords: ["terracotta planters", "clay planters", "terracotta garden pots", "outdoor terracotta planters", "terracotta planter supplier"],
    intro: "Terracotta planters bring a natural fired-clay character to gardens, courtyards and outdoor spaces. Share your preferred dimensions and quantity to discuss suitable planter options.",
    applications: ["Gardens and landscape schemes", "Balconies and terraces", "Courtyards and hospitality spaces"],
  },
  "terracotta-jali": {
    titleKeyword: "Terracotta Jali & Clay Screens",
    description: "Terracotta jali and clay screen elements by By Devyora for facades, balconies and ventilation screens. Explore custom patterns and project-based supply across India.",
    keywords: ["terracotta jali", "terracotta jaali", "clay jali", "terracotta screens", "terracotta jali manufacturer"],
    intro: "Terracotta jali creates patterned shade, filtered light and ventilation with the natural appearance of fired clay. By Devyora can discuss pattern, module size, quantity and project application.",
    applications: ["Facade and balcony screens", "Courtyards and partitions", "Ventilated feature walls"],
  },
  "handmade-ceramic-tiles": {
    titleKeyword: "Handmade Ceramic Tiles & Artisan Wall Tiles",
    description: "Handmade ceramic tiles by By Devyora for kitchens, bathrooms and feature walls. Explore artisan surfaces, colour and pattern options for residential and commercial projects.",
    keywords: ["handmade ceramic tiles", "artisan ceramic tiles", "handmade wall tiles", "decorative ceramic tiles", "ceramic tile supplier"],
    intro: "Handmade ceramic tiles add individual character through surface, glaze and pattern variation. Discuss the intended application, tile format, palette and quantity with By Devyora.",
    applications: ["Kitchen and bathroom walls", "Feature walls and niches", "Hospitality and retail interiors"],
  },
  "handmade-ceramic-basins": {
    titleKeyword: "Handmade Ceramic Basins & Washbowls",
    description: "Handmade ceramic basins by By Devyora for bathrooms and powder rooms. Explore artisan washbasin designs, finishes and project-specific requirements with delivery across India.",
    keywords: ["handmade ceramic basins", "ceramic wash basins", "artisan washbowls", "designer ceramic basins"],
    intro: "Handmade ceramic basins bring crafted surface character to bathrooms and powder rooms. Share your counter dimensions, preferred shape and finish to discuss a suitable design.",
    applications: ["Residential bathrooms", "Powder rooms", "Boutique hospitality projects"],
  },
  "marble-planters": {
    titleKeyword: "Marble Planters & Stone Planter Pots",
    description: "Marble planters by By Devyora for refined indoor, outdoor and landscape settings. Discuss custom sizes, stone selection and project quantities with PAN-India delivery.",
    keywords: ["marble planters", "stone planters", "marble planter pots", "custom marble planters", "marble garden planters"],
    intro: "Marble planters introduce natural stone character to entrances, courtyards and landscape compositions. By Devyora can discuss dimensions, stone appearance and placement requirements for your project.",
    applications: ["Building entrances and lobbies", "Courtyards and terraces", "Landscape and hospitality projects"],
  },
  "marble-cornices": {
    titleKeyword: "Marble Cornices & Architectural Mouldings",
    description: "Marble cornices and architectural stone mouldings by By Devyora for facades and interiors. Discuss profiles, dimensions and custom detailing for your project across India.",
    keywords: ["marble cornices", "marble mouldings", "stone cornice", "architectural marble mouldings", "custom marble cornices"],
    intro: "Marble cornices create a defined architectural edge at rooflines, openings and interior transitions. Share profile drawings and dimensions to discuss custom stone detailing.",
    applications: ["Facade cornice bands", "Interior ceiling transitions", "Classical and heritage-style architecture"],
  },
};

const materialForType = new Map<string, string>();
for (const [material, types] of Object.entries(PRODUCT_TYPES)) {
  for (const type of types) materialForType.set(type.slug, material);
}

function titleFromSlug(slug: string): string {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function getProductSeo(typeSlug: string, fallbackName?: string): ProductSeoContent {
  const name = Object.values(PRODUCT_TYPES).flat().find((type) => type.slug === typeSlug)?.name ?? fallbackName ?? titleFromSlug(typeSlug);
  const custom = CUSTOM_CONTENT[typeSlug] ?? {};
  const material = materialForType.get(typeSlug);
  const materialLabel = material === "grg-pop" ? "GRG POP" : material ? titleFromSlug(material) : "architectural products";
  const baseDescription = `${name} by By Devyora for residential, commercial and architectural projects. Discuss custom designs, dimensions, finishes and project quantities, with delivery across India.`;
  return {
    titleKeyword: custom.titleKeyword ?? `${name} | Custom ${materialLabel} Products`,
    description: custom.description ?? baseDescription,
    keywords: custom.keywords ?? [name.toLowerCase(), `custom ${name.toLowerCase()}`, `${name.toLowerCase()} manufacturer`, `${name.toLowerCase()} supplier`, `${name.toLowerCase()} India`],
    intro: custom.intro ?? `By Devyora offers ${name.toLowerCase()} for residential, commercial and architectural projects. Share your drawing, reference, dimensions and required quantity to discuss design, finish and project suitability.`,
    applications: custom.applications ?? ["Residential architecture and interiors", "Commercial and hospitality projects", "Custom architectural features"],
  };
}

export function getProductCityDescription(productName: string, cityName: string, stateName?: string): string {
  const region = stateName ? `${cityName}, ${stateName}` : cityName;
  return `Custom ${productName.toLowerCase()} by By Devyora for homes and commercial projects in ${region}. Share drawings, dimensions and quantity for a project quote. PAN-India delivery.`;
}
