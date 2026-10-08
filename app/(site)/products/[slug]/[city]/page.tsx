import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { theme, pagePadX } from "@/lib/theme";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { RequirementForm } from "@/components/site/requirement-form";
import {
  findProductTypeBySlug,
  withoutSampleSuffix,
  PRODUCT_TYPE_IMAGES,
} from "@/lib/product-types";
import { SERVICE_CITIES } from "@/lib/data/service-cities";

type PageProps = { params: Promise<{ slug: string; city: string }> };

export const revalidate = 3600;

/**
 * Resolves `/products/<slug>/<city>` for either a real, published product
 * or one of the type-fallback pages from products/[slug]/page.tsx (same
 * `findProductTypeBySlug` this file already uses, so a product and its
 * per-city pages stay consistent whether or not it's been seeded yet).
 * Returns null if the product/type or the city isn't recognised, which the
 * caller turns into a real 404 — everything else renders, deliberately,
 * even with no real content yet (per request: these pages exist today as
 * name + enquiry form, with text and photos added later via the admin
 * panel once that data is ready).
 */
async function resolve(slug: string, citySlug: string) {
  const city = SERVICE_CITIES.find((c) => c.slug === citySlug);
  if (!city) return null;

  const product = await ProductRepository.findBySlug(slug);
  if (product && product.status === "PUBLISHED") {
    // The identical photo the product's own /products/<slug> page shows:
    // its own uploaded image if it has one, else (every type-sample
    // product, seeded with none on purpose) the type's photo, if supplied.
    const typeSlug = findProductTypeBySlug(slug)?.type.slug;
    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
    const heroImage = primary
      ? { url: primary.url, alt: primary.alt ?? product.name }
      : (typeSlug && PRODUCT_TYPE_IMAGES[typeSlug]) || null;
    return { entityName: withoutSampleSuffix(product.name), city, heroImage };
  }

  const fallback = findProductTypeBySlug(slug);
  if (!fallback) return null;
  return {
    entityName: fallback.type.name,
    city,
    heroImage: PRODUCT_TYPE_IMAGES[fallback.type.slug] ?? null,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const resolved = await resolve(slug, citySlug);
  if (!resolved) return {};

  return buildMetadata({
    title: `${resolved.entityName} in ${resolved.city.name}`,
    description: `${resolved.entityName}, made to drawing by By Devyora, serving ${resolved.city.name}.`,
    path: `/products/${slug}/${citySlug}`,
    type: "product",
  });
}

export default async function ProductCityPage({ params }: PageProps) {
  const { slug, city: citySlug } = await params;
  const resolved = await resolve(slug, citySlug);
  if (!resolved) notFound();

  const { entityName, city, heroImage } = resolved;

  return (
    <main
      style={{
        padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
      }}
    >
      <Breadcrumbs
        items={[
          { name: "Products", path: "/materials" },
          { name: entityName, path: `/products/${slug}` },
          { name: city.name, path: `/products/${slug}/${citySlug}` },
        ]}
      />

      <h1
        style={{
          fontFamily: theme.font.serif,
          fontWeight: 400,
          fontSize: "clamp(36px, 5vw, 64px)",
          lineHeight: 1.02,
          letterSpacing: "-0.015em",
          margin: "0 0 12px",
        }}
      >
        {entityName} in {city.name}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: theme.color.muted,
          maxWidth: "60ch",
          marginBottom: "clamp(32px, 5vw, 56px)",
        }}
      >
        {entityName}, made to drawing by By Devyora, serving {city.name} —
        full specifications{heroImage ? "" : " and photos"} coming soon.
      </p>

      {heroImage && (
        <div
          style={{
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
            aspectRatio: "16/9",
            overflow: "hidden",
            position: "relative",
            background: "#F6F4F1",
            marginBottom: "clamp(40px, 6vw, 72px)",
          }}
        >
          <Image
            src={heroImage.url}
            alt={heroImage.alt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      )}

      <RequirementForm
        eyebrow={`${entityName} in ${city.name}`}
        description={`Share your drawing, reference image, dimensions or project requirement with By Devyora to discuss ${entityName} in ${city.name}.`}
        idPrefix={`${slug}-${citySlug}`}
      />
    </main>
  );
}
