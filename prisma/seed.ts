import "dotenv/config";
import { ProjectType, DownloadCategory, FacilityStatType, Role, ProductStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import slugify from "slugify";
import { prisma } from "../lib/prisma";

// ---- Source data (mirrors what's already in the Products / Projects / Manufacturing pages) ----

const IMAGES = [
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80",
  "https://images.unsplash.com/photo-1470723710355-95304d8aece4?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
  "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1200&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=1200&q=80",
];

const PRODUCTS = [
  ["GRC", "Glass fibre reinforced concrete for facades of any curvature.", ["Facades", "Cornices", "Domes", "Screens", "Pillars"], "Alkali-resistant glass fibre & cement", "Sandblasted, acid-etched, board-formed"],
  ["FRP", "Fibre reinforced polymer elements — structural strength at a fraction of the weight.", ["Canopies", "Cladding", "Domes", "Retrofit"], "Isophthalic polyester & glass fibre", "Gelcoat, matte, stone-effect"],
  ["Terracotta", "Kiln-fired clay baguettes and tiles that weather into warmth.", ["Rainscreen", "Baguettes", "Roofing", "Sunshades"], "Extruded natural clay", "Natural, engobe, glazed"],
  ["WPC", "Wood polymer composite for decking and cladding that ignores the monsoon.", ["Decking", "Cladding", "Pergolas", "Fencing"], "Wood flour & HDPE composite", "Brushed, embossed, co-extruded"],
  ["Planters", "Sculpted vessels sized from balcony to boulevard.", ["Landscape", "Terraces", "Lobbies", "Streetscape"], "GRC or FRP, drainage-ready", "Sandblasted, pigmented, polished"],
  ["Railings", "Balustrades drawn as line work, cast to last.", ["Balconies", "Stairs", "Terraces", "Bridges"], "Cast metal & composite infill", "Powder-coat, patina, anodised"],
  ["Columns", "Classical and contemporary orders, made to measure.", ["Porticos", "Colonnades", "Interiors", "Restoration"], "GRC core, moulded profile", "Plain, fluted, textured"],
  ["Jali", "Perforated screens that trade heat for light.", ["Facades", "Partitions", "Courtyards", "Parapets"], "GRC, terracotta or FRP", "Natural, pigmented, sealed"],
  ["Cladding", "Rainscreen systems in stone, clay and composite.", ["Facades", "Soffits", "Podiums", "Interiors"], "Panel & concealed-fix substructure", "Honed, split, ribbed"],
  ["Screens", "Free-standing partitions that divide without closing.", ["Interiors", "Gardens", "Hospitality", "Lobbies"], "Composite frame & infill", "Matte, wood-effect, metallic"],
  ["Architectural Elements", "Cornices, brackets, mouldings and one-off commissions.", ["Restoration", "Facades", "Interiors", "Bespoke"], "Moulded GRC / FRP", "To sample"],
] as const;

// Additional materials shown in the Products menu. WPC and Planters already exist
// in PRODUCTS above and are reused, not duplicated. Neutral taglines only — no
// specs, applications or hero image are invented here. Replace the copy later
// from the admin panel or in lib/material-pages.ts.
// Catalogue numbers are assigned automatically (next free number) in the loop below.
const NEW_MATERIALS = [
  { name: "UHPC", slug: "uhpc" },
  { name: "Marble", slug: "marble" },
  { name: "GRG POP", slug: "grg-pop" },
  { name: "Wall Art", slug: "wall-art" },
  { name: "Brass", slug: "brass" },
  { name: "Handmade Ceramics", slug: "handmade-ceramics" },
] as const;

const CITIES = [
  { name: "Bhopal", state: "Madhya Pradesh", region: "Central India" },
  { name: "Indore", state: "Madhya Pradesh", region: "Central India" },
  { name: "Jabalpur", state: "Madhya Pradesh", region: "Central India" },
  { name: "New Delhi", state: "Delhi", region: "North India" },
  { name: "Gurugram", state: "Haryana", region: "North India" },
  { name: "Noida", state: "Uttar Pradesh", region: "North India" },
  { name: "Jaipur", state: "Rajasthan", region: "North India" },
  { name: "Chandigarh", state: "Chandigarh", region: "North India" },
  { name: "Lucknow", state: "Uttar Pradesh", region: "North India" },
  { name: "Mumbai", state: "Maharashtra", region: "West India" },
  { name: "Pune", state: "Maharashtra", region: "West India" },
  { name: "Ahmedabad", state: "Gujarat", region: "West India" },
  { name: "Surat", state: "Gujarat", region: "West India" },
  { name: "Bengaluru", state: "Karnataka", region: "South India" },
  { name: "Hyderabad", state: "Telangana", region: "South India" },
  { name: "Chennai", state: "Tamil Nadu", region: "South India" },
  { name: "Kochi", state: "Kerala", region: "South India" },
  { name: "Kolkata", state: "West Bengal", region: "East India" },
  { name: "Nagpur", state: "Maharashtra", region: "Central India" },
  { name: "Dubai", state: "Dubai", region: "Middle East" },
];

const PROJECTS = [
  { name: "The Residences at Marina Bay", location: "Mumbai", type: ProjectType.RESIDENTIAL, arch: "Studio Lotus", year: 2025, products: ["GRC", "Jali"], desc: "A 42-storey residential tower with a bespoke GRC facade of 2,400 panels, each acid-etched to reveal aggregate beneath." },
  { name: "Oasis Convention Centre", location: "Dubai", type: ProjectType.COMMERCIAL, arch: "RSP Architects", year: 2024, products: ["FRP", "Cladding"], desc: "A sweeping convention hall clad in double-curved FRP panels, each formed from a single mould to eliminate visible joints." },
  { name: "Terracotta House", location: "New Delhi", type: ProjectType.RESIDENTIAL, arch: "Morphogenesis", year: 2024, products: ["Terracotta", "Screens"], desc: "A private residence wrapped in a continuous terracotta baguette screen that modulates daylight and cross-ventilation." },
  { name: "Heritage Walk Hotel", location: "Ahmedabad", type: ProjectType.HOSPITALITY, arch: "Sanjay Puri Architects", year: 2023, products: ["Jali", "Columns"], desc: "A boutique hotel in the old city with GRC jali screens inspired by Mughal geometry and hand-carved GRC columns." },
  { name: "Lakeside Promenade", location: "Udaipur", type: ProjectType.LANDSCAPE, arch: "LAUD Architects", year: 2023, products: ["WPC", "Planters", "Railings"], desc: "A 1.2 km lakefront promenade surfaced in WPC decking with integrated GRC planters and powder-coated railings." },
  { name: "Surat Diamond Bourse Annex", location: "Surat", type: ProjectType.COMMERCIAL, arch: "CnT Architects", year: 2022, products: ["GRC", "Cladding"], desc: "A 6-storey annex to India's largest diamond trading hub, with a unitised GRC cladding system spanning 14,000 sqm." },
];

const BRANCHES = [
  { city: "Gurugram", address: "Industrial Area, Sector 82, Gurugram, Haryana 122004", phone: "+91 000 000 0000", isHeadOffice: true },
  { city: "Mumbai", address: "Parel Design Centre, 3rd Floor, Mumbai, Maharashtra 400012", phone: "+91 000 000 0002", isHeadOffice: false },
  { city: "Dubai", address: "Business Bay, Tower B, Dubai, UAE", phone: "+971 00 000 0000", isHeadOffice: false },
];

const MANUFACTURING_STEPS = [
  { num: "01", title: "Drawing review", description: "Architect's drawings are studied for production feasibility, tolerances and finish requirements." },
  { num: "02", title: "Mould making", description: "CNC-cut master patterns translated into silicone or fibreglass moulds for repeated casting." },
  { num: "03", title: "Casting", description: "GRC spray-up, FRP hand-lay or terracotta extrusion — material-specific processes under controlled conditions." },
  { num: "04", title: "Curing", description: "Temperature and humidity-controlled curing to achieve design strength and dimensional stability." },
  { num: "05", title: "Finishing", description: "Acid-etching, sandblasting, polishing, coating or painting to the specified surface." },
  { num: "06", title: "QC & dispatch", description: "Dimensional check, surface inspection and strength testing before packing and site delivery." },
];

const QUALITY_STANDARDS = [
  { label: "Flexural strength", value: "≥ 18 MPa (GRC)" },
  { label: "Water absorption", value: "< 12%" },
  { label: "Fire rating", value: "Class A1 / A2" },
  { label: "Dimensional tolerance", value: "± 2mm" },
];

const INFRASTRUCTURE = [
  { label: "Sq ft integrated facility", value: "50K" },
  { label: "Production bays", value: "6" },
  { label: "Skilled craftsmen", value: "120+" },
  { label: "Projects delivered", value: "500+" },
  { label: "Panels per month capacity", value: "14K" },
  { label: "Years of operation", value: "18" },
];

const CERTIFICATIONS = [
  { name: "ISO 9001:2015", body: "Quality Management" },
  { name: "ISO 14001:2015", body: "Environmental Management" },
  { name: "GRIHA Compliant", body: "Green Building" },
  { name: "BIS Certified", body: "Bureau of Indian Standards" },
];

const DOWNLOADS = [
  { name: "By Devyora Product Catalogue 2026", category: DownloadCategory.CATALOGUE, fileSize: 18 * 1024 * 1024, year: 2026 },
  { name: "GRC Systems Catalogue", category: DownloadCategory.CATALOGUE, fileSize: 12 * 1024 * 1024, year: 2025 },
  { name: "Terracotta & Clay Collection", category: DownloadCategory.CATALOGUE, fileSize: Math.round(9.4 * 1024 * 1024), year: 2025 },
  { name: "GRC — Technical Data Sheet", category: DownloadCategory.TECHNICAL, fileSize: Math.round(2.4 * 1024 * 1024) },
  { name: "FRP — Technical Data Sheet", category: DownloadCategory.TECHNICAL, fileSize: Math.round(1.8 * 1024 * 1024) },
  { name: "Facade Solutions Brochure", category: DownloadCategory.BROCHURE, fileSize: Math.round(6.1 * 1024 * 1024) },
];

async function main() {
  console.log("Seeding…");

  // --- Admin user ---
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "change-me-now", 12);
  await prisma.user.upsert({
    where: { email: "studio@bydevyora.com" },
    update: {},
    create: {
      name: "Studio Admin",
      email: "studio@bydevyora.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // --- Materials (the 11 systems) ---
  const materialRecords: Record<string, string> = {};
  for (let i = 0; i < PRODUCTS.length; i++) {
    const [name, tagline, apps, material, finishes] = PRODUCTS[i];
    const slug = slugify(name, { lower: true, strict: true });
    const rec = await prisma.material.upsert({
      where: { slug },
      update: {},
      create: {
        num: i + 1,
        slug,
        name,
        tagline,
        material,
        finishes,
        heroImage: IMAGES[i],
        specs: {
          create: [
            { key: "Material", value: material, order: 0 },
            { key: "Finishes", value: finishes, order: 1 },
            { key: "Formats", value: "Standard & made to drawing", order: 2 },
            { key: "Lead time", value: "6–10 weeks", order: 3 },
          ],
        },
        applications: {
          create: apps.map((label, order) => ({ label, slug: slugify(label, { lower: true, strict: true }), order })),
        },
        images: { create: [{ url: IMAGES[i], order: 0 }] },
      },
    });
    materialRecords[name] = rec.id;
  }

  // --- Additional materials (UHPC, Marble, GRG POP, Wall Art, Brass, Handmade Ceramics) ---
  // Existing rows (matched by slug) are never modified. New rows take the next
  // free catalogue number, so this is safe on a database that already has data.
  for (const m of NEW_MATERIALS) {
    const existing = await prisma.material.findUnique({ where: { slug: m.slug } });
    if (existing) {
      materialRecords[m.name] = existing.id;
      continue;
    }
    const { _max } = await prisma.material.aggregate({ _max: { num: true } });
    const rec = await prisma.material.create({
      data: {
        num: (_max.num ?? 0) + 1,
        slug: m.slug,
        name: m.name,
        tagline: `${m.name} by Devyora.`,
      },
    });
    materialRecords[m.name] = rec.id;
  }

  // --- Placeholder sample product for every material ---
  // Every material needs at least one Product, or its "Products in this
  // system" section and any /products/<slug> link has nothing to resolve to.
  // These are deliberately generic, clearly-labelled placeholders (name ends
  // in "— Sample") carrying no material-specific claims like panel sizes or
  // fire ratings, since most of these materials aren't panels. `update: {}`
  // means an existing product at that slug is never touched, so a real
  // catalogue entry added from the admin panel is always left alone.
  //
  // This sits above the safe-mode return below so that
  // `SEED_MATERIALS_ONLY=true` covers materials *and* their products — that
  // combination is what you run against an already-populated database.
  const LOCAL_HERO_IMAGE: Record<string, string> = {
    GRC: "/images/GRC.webp",
    FRP: "/images/FRP.webp",
    Terracotta: "/images/Tera.webp",
    WPC: "/images/WPC.webp",
    Planters: "/images/Planters.webp",
    UHPC: "/images/UHPC.webp",
    Marble: "/images/Marble.webp",
    "GRG POP": "/images/GRG-POP.webp",
    "Wall Art": "/images/Wall-Art.webp",
    Brass: "/images/Brass.webp",
    "Handmade Ceramics": "/images/Handmade-Ceramics.webp",
  };

  const MATERIALS_NEEDING_SAMPLE_PRODUCT = [
    // GRC is skipped — it already has a real catalogue product
    // (grc-facade-panel-board-formed), created further down.
    ...PRODUCTS.filter(([name]) => name !== "GRC").map(([name]) => ({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      fallbackImage: IMAGES[PRODUCTS.findIndex(([n]) => n === name)] ?? IMAGES[0],
    })),
    ...NEW_MATERIALS.map((m) => ({ name: m.name, slug: m.slug, fallbackImage: IMAGES[0] })),
  ];

  for (const { name, slug: materialSlug, fallbackImage } of MATERIALS_NEEDING_SAMPLE_PRODUCT) {
    const materialId = materialRecords[name];
    if (!materialId) continue;
    const sampleSlug = `${materialSlug}-sample`;
    const sampleSku = `${materialSlug.toUpperCase()}-SAMPLE`;
    await prisma.product.upsert({
      where: { slug: sampleSlug },
      update: {},
      create: {
        sku: sampleSku,
        slug: sampleSlug,
        name: `${name} — Sample`,
        materialId,
        shortDescription: `${name} product, made to drawing.`,
        description: `A ${name} product made to drawing. Specifications, finishes and sizing shown here are indicative — share your drawing or project requirement to confirm the right configuration.`,
        status: ProductStatus.PUBLISHED,
        specifications: {
          create: [
            { key: "Formats", value: "Standard & made to drawing", order: 0 },
            { key: "Lead time", value: "6–10 weeks", order: 1 },
          ],
        },
        variants: {
          create: [
            { sku: `${sampleSku}-STD`, name: "Standard — Made to drawing", isDefault: true, order: 0 },
          ],
        },
        images: {
          create: [
            { url: LOCAL_HERO_IMAGE[name] ?? fallbackImage, alt: `${name} — By Devyora`, isPrimary: true, order: 0 },
          ],
        },
      },
    });
  }

  // Safe mode for databases that are already seeded: only the materials and
  // their sample products above are touched. Branches, steps, stats,
  // certifications and downloads use plain `create` further down and would be
  // duplicated by a full re-run.
  if (process.env.SEED_MATERIALS_ONLY === "true") {
    console.log("Materials and sample products seeded (SEED_MATERIALS_ONLY).");
    return;
  }

  // --- Categories ---
  const CATEGORY_DEFS = [
    { slug: "facades", name: "Facades" },
    { slug: "landscape", name: "Landscape Elements" },
    { slug: "interiors", name: "Interior Screens & Partitions" },
    { slug: "restoration", name: "Restoration & Bespoke" },
  ];
  const categoryRecords: Record<string, string> = {};
  for (const [order, cat] of CATEGORY_DEFS.entries()) {
    const rec = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, order },
    });
    categoryRecords[cat.slug] = rec.id;
  }

  // --- A sample SKU-level Product with variants, to demonstrate the catalogue layer ---
  const sampleProduct = await prisma.product.upsert({
    where: { slug: "grc-facade-panel-board-formed" },
    update: {},
    create: {
      sku: "GRC-FP-BF",
      slug: "grc-facade-panel-board-formed",
      name: "GRC Facade Panel — Board Formed",
      materialId: materialRecords["GRC"],
      categoryId: categoryRecords["facades"],
      shortDescription: "Board-formed GRC rainscreen panel, made to drawing.",
      description:
        "A concealed-fix GRC rainscreen panel with a board-formed texture. Cast to tolerance and finished on site-specific tooling for large-format facade runs.",
      status: ProductStatus.PUBLISHED,
      featured: true,
      specifications: {
        create: [
          { key: "Panel thickness", value: "12mm nominal", order: 0 },
          { key: "Fixing", value: "Concealed, aluminium substructure", order: 1 },
          { key: "Fire rating", value: "Class A1", order: 2 },
        ],
      },
      variants: {
        create: [
          { sku: "GRC-FP-BF-600x1200", name: "600×1200mm — Ash Grey", size: "600×1200mm", finish: "Board-formed", color: "Ash Grey", isDefault: true, order: 0 },
          { sku: "GRC-FP-BF-1200x2400", name: "1200×2400mm — Ash Grey", size: "1200×2400mm", finish: "Board-formed", color: "Ash Grey", order: 1 },
        ],
      },
      images: { create: [{ url: IMAGES[0], alt: "GRC board-formed facade panel", isPrimary: true, order: 0 }] },
    },
  });

  // --- Projects ---
  for (const p of PROJECTS) {
    const slug = slugify(p.name, { lower: true, strict: true });
    await prisma.project.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: p.name,
        location: p.location,
        type: p.type,
        architect: p.arch,
        year: p.year,
        description: p.desc,
        technicalInfo:
          "Custom GRC panels with acid-etched finish, mechanically fixed to aluminium substructure. Panels ranged from 600×1200mm to 1200×2400mm, with 12mm nominal thickness. Fire rated to Class A1.",
        materials: {
          create: p.products
            .filter((name) => materialRecords[name])
            .map((name) => ({ materialId: materialRecords[name] })),
        },
      },
    });
  }

  // --- Branches ---
  for (const [order, b] of BRANCHES.entries()) {
    await prisma.branch.create({ data: { ...b, order } });
  }

  // --- Cities (Module 8: automatic city-page generation) ---
  for (const [order, c] of CITIES.entries()) {
    const slug = slugify(c.name, { lower: true, strict: true });
    await prisma.city.upsert({
      where: { slug },
      update: {},
      create: { slug, name: c.name, state: c.state, region: c.region, order },
    });
  }

  // --- Manufacturing steps ---
  for (const [order, s] of MANUFACTURING_STEPS.entries()) {
    await prisma.manufacturingStep.create({ data: { ...s, order } });
  }

  // --- Facility stats (quality standards + infrastructure) ---
  for (const [order, s] of QUALITY_STANDARDS.entries()) {
    await prisma.facilityStat.create({
      data: { type: FacilityStatType.QUALITY_STANDARD, label: s.label, value: s.value, order },
    });
  }
  for (const [order, s] of INFRASTRUCTURE.entries()) {
    await prisma.facilityStat.create({
      data: { type: FacilityStatType.INFRASTRUCTURE, label: s.label, value: s.value, order },
    });
  }

  // --- Certifications ---
  for (const [order, c] of CERTIFICATIONS.entries()) {
    await prisma.certification.create({ data: { ...c, order } });
  }

  // --- Downloads (site-level) ---
  for (const d of DOWNLOADS) {
    await prisma.downloadFile.create({
      data: { ...d, fileUrl: `https://files.bydevyora.com/${slugify(d.name, { lower: true, strict: true })}.pdf` },
    });
  }

  // --- A product-scoped download, attached to the sample Product above ---
  await prisma.downloadFile.create({
    data: {
      name: "GRC Facade Panel — Board Formed — Spec Sheet",
      category: DownloadCategory.TECHNICAL,
      fileUrl: "https://files.bydevyora.com/grc-facade-panel-board-formed-spec.pdf",
      fileSize: Math.round(1.2 * 1024 * 1024),
      productId: sampleProduct.id,
    },
  });

  // --- Blog categories, tags + sample posts ---
  const category = await prisma.blogCategory.upsert({
    where: { slug: "materials" },
    update: {},
    create: { slug: "materials", name: "Materials" },
  });
  const projectsCategory = await prisma.blogCategory.upsert({
    where: { slug: "projects" },
    update: {},
    create: { slug: "projects", name: "Projects" },
  });

  const tagSpecify = await prisma.tag.upsert({ where: { slug: "specification" }, update: {}, create: { slug: "specification", name: "Specification" } });
  const tagGrc = await prisma.tag.upsert({ where: { slug: "grc" }, update: {}, create: { slug: "grc", name: "GRC" } });
  const tagFacades = await prisma.tag.upsert({ where: { slug: "facades" }, update: {}, create: { slug: "facades", name: "Facades" } });

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "studio@bydevyora.com" } });

  await prisma.blogPost.upsert({
    where: { slug: "specifying-grc-an-architects-guide" },
    update: {},
    create: {
      slug: "specifying-grc-an-architects-guide",
      title: "Specifying GRC: an architect's guide",
      excerpt: "Everything you need to know about glass fibre reinforced concrete — from mix design to fixings.",
      content:
        "<p>Glass fibre reinforced concrete (GRC) has become the default choice for architects who want the plasticity of cast concrete without the weight. This guide walks through mix design, panel sizing, fixing systems and finish options.</p><h2>Mix design</h2><p>A typical GRC mix combines Portland cement, sand, water, polymer and alkali-resistant glass fibre...</p>",
      featured: true,
      published: true,
      publishedAt: new Date(),
      metaDescription: "A practical guide to specifying GRC — mix design, panel sizing, fixings and finishes — for architects and specifiers.",
      categoryId: category.id,
      authorId: admin.id,
      tags: { create: [{ tagId: tagSpecify.id }, { tagId: tagGrc.id }] },
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "surat-diamond-bourse-annex-case-study" },
    update: {},
    create: {
      slug: "surat-diamond-bourse-annex-case-study",
      title: "Case study: Surat Diamond Bourse Annex",
      excerpt: "14,000 sqm of unitised GRC cladding, delivered to a construction programme measured in weeks, not months.",
      content:
        "<p>When CnT Architects specified a unitised GRC cladding system for the Surat Diamond Bourse Annex, the brief was as much about programme as it was about form...</p>",
      featured: false,
      published: true,
      publishedAt: new Date(),
      categoryId: projectsCategory.id,
      authorId: admin.id,
      tags: { create: [{ tagId: tagFacades.id }, { tagId: tagGrc.id }] },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
