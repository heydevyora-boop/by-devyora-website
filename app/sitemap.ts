import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { absoluteUrl } from "@/lib/seo";
import { ALL_PRODUCT_TYPE_SLUGS } from "@/lib/product-types";
import { SERVICE_CITIES } from "@/lib/data/service-cities";

const CITY_CHUNK_SIZE = 2000;

type CityPageEntry =
  | { kind: "material"; materialSlug: string; applicationSlug: string; citySlug: string }
  | { kind: "product"; productSlug: string; citySlug: string };

export async function generateSitemaps() {
  const [materialApplicationSlugs, publishedProducts] = await Promise.all([
    MaterialRepository.listMaterialApplicationSlugs(),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
  ]);
  const cities = SERVICE_CITIES;
  const productSlugs = new Set([...publishedProducts.map((product) => product.slug), ...ALL_PRODUCT_TYPE_SLUGS]);
  const totalCityPages = materialApplicationSlugs.length * cities.length + productSlugs.size * cities.length;
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
    ...materials.map((material) => ({ url: absoluteUrl(`/materials/${material.slug}`), lastModified: material.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...categories.map((category) => ({ url: absoluteUrl(`/categories/${category.slug}`), lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((product) => ({ url: absoluteUrl(`/products/${product.slug}`), lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...projects.map((project) => ({ url: absoluteUrl(`/projects/${project.slug}`), lastModified: project.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

async function cityChunkSitemap(chunkIndex: number): Promise<MetadataRoute.Sitemap> {
  const [materialApplicationSlugs, publishedProducts] = await Promise.all([
    MaterialRepository.listMaterialApplicationSlugs(),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
  ]);
  const cities = SERVICE_CITIES;
  const productSlugs = [...new Set([...publishedProducts.map((product) => product.slug), ...ALL_PRODUCT_TYPE_SLUGS])];

  // Material × application × city URLs, followed by product × city URLs.
  // Chunking keeps each generated sitemap comfortably below Google's URL cap.
  const start = chunkIndex * CITY_CHUNK_SIZE;
  const end = start + CITY_CHUNK_SIZE;
  const entries: CityPageEntry[] = [];
  const materialCount = materialApplicationSlugs.length * cities.length;

  if (start < materialCount) {
    for (let index = start; index < Math.min(end, materialCount); index += 1) {
      const materialApplication = materialApplicationSlugs[Math.floor(index / cities.length)];
      const city = cities[index % cities.length];
      if (materialApplication && city) entries.push({ kind: "material", ...materialApplication, citySlug: city.slug });
    }
  }

  const productStart = Math.max(0, start - materialCount);
  const productEnd = Math.max(0, end - materialCount);
  for (let index = productStart; index < Math.min(productEnd, productSlugs.length * cities.length); index += 1) {
    const productSlug = productSlugs[Math.floor(index / cities.length)];
    const city = cities[index % cities.length];
    if (productSlug && city) entries.push({ kind: "product", productSlug, citySlug: city.slug });
  }

  return entries.map((entry) => ({
    url: absoluteUrl(entry.kind === "material"
      ? `/materials/${entry.materialSlug}/${entry.applicationSlug}/${entry.citySlug}`
      : `/products/${entry.productSlug}/${entry.citySlug}`),
    changeFrequency: "monthly" as const,
    priority: entry.kind === "product" ? 0.55 : 0.5,
  }));
}
