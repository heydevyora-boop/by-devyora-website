import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { CityRepository } from "@/lib/repositories/city.repository";
import { absoluteUrl } from "@/lib/seo";

const CITY_CHUNK_SIZE = 2000; // Google's own limit is 50,000 URLs/file — chunking well under that keeps each file fast to generate and fetch

/**
 * id 0        → static pages + materials + categories + products + projects
 * id 1..N     → city landing pages, chunked (this is the set that grows
 *               fastest as Module 8 generates more Material × Application ×
 *               City combinations, so it gets its own chunk(s) rather than
 *               risking pushing id 0 over the per-file limit later)
 */
export async function generateSitemaps() {
  const materialApplicationSlugs = await MaterialRepository.listMaterialApplicationSlugs();
  const cities = await CityRepository.findAll();
  const totalCityPages = materialApplicationSlugs.length * cities.length;
  const cityChunks = Math.max(1, Math.ceil(totalCityPages / CITY_CHUNK_SIZE));

  return Array.from({ length: 1 + cityChunks }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  if (id === 0) return coreSitemap();
  return cityChunkSitemap(id - 1);
}

async function coreSitemap(): Promise<MetadataRoute.Sitemap> {
  const [materials, categories, products, projects] = await Promise.all([
    MaterialRepository.findAll({ publishedOnly: true }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/materials"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/projects"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/manufacturing"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...materials.map((m) => ({ url: absoluteUrl(`/materials/${m.slug}`), lastModified: m.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...categories.map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

async function cityChunkSitemap(chunkIndex: number): Promise<MetadataRoute.Sitemap> {
  const [materialApplicationSlugs, cities] = await Promise.all([
    MaterialRepository.listMaterialApplicationSlugs(),
    CityRepository.findAll(),
  ]);

  // Flatten the full Material × Application × City matrix, then slice out this chunk.
  const allCombos: { materialSlug: string; applicationSlug: string; citySlug: string }[] = [];
  for (const ma of materialApplicationSlugs) {
    for (const city of cities) {
      allCombos.push({ ...ma, citySlug: city.slug });
    }
  }

  const start = chunkIndex * CITY_CHUNK_SIZE;
  const chunk = allCombos.slice(start, start + CITY_CHUNK_SIZE);

  return chunk.map((c) => ({
    url: absoluteUrl(`/materials/${c.materialSlug}/${c.applicationSlug}/${c.citySlug}`),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
}
