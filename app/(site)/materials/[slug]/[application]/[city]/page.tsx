import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { theme, pagePadX } from "@/lib/theme";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { RequirementForm } from "@/components/site/requirement-form";
import { SERVICE_CITIES } from "@/lib/data/service-cities";
import { MATERIAL_PAGE_CONTENT, SPECIAL_MATERIAL_NAMES, resolveMaterialHeroImage } from "@/lib/material-pages";

type PageProps = {
  params: Promise<{ slug: string; application: string; city: string }>;
};

export const revalidate = 3600;

/**
 * Resolves `/materials/<material>/<application>/<city>` — the destination
 * for both the Applications chips and the by-city links on the material
 * page (components/site/city-coverage.tsx), neither of which had a page to
 * land on before this route existed.
 *
 * `applicationSlug` is resolved loosely on purpose: if it doesn't match one
 * of the material's real applications — including the "overview"
 * placeholder the material page passes when it has no applications at all,
 * since Next.js won't allow a sibling [application] and [city] dynamic
 * segment at the same path level — this still renders, just without an
 * application in the heading, rather than 404ing. Only an unknown material
 * or city 404s.
 *
 * `materialSlug` falls back the same way /materials/[slug]/page.tsx does
 * (MATERIAL_PAGE_CONTENT, then SPECIAL_MATERIAL_NAMES for GRC/FRP/
 * Terracotta) when there's no database row — this route used to skip that
 * fallback entirely and hard-404 for any material without one, which is why
 * e.g. "GRC Pillars in Indore" 404'd even though /materials/grc itself
 * didn't.
 */
async function resolve(
  materialSlug: string,
  applicationSlug: string,
  citySlug: string
) {
  const city = SERVICE_CITIES.find((c) => c.slug === citySlug);
  if (!city) return null;

  const material = await MaterialRepository.findBySlug(materialSlug);
  const fallbackName = MATERIAL_PAGE_CONTENT[materialSlug]?.name ?? SPECIAL_MATERIAL_NAMES[materialSlug];
  if (!material && !fallbackName) return null;

  const materialName = material?.name ?? fallbackName!;
  const application = material?.applications.find((a) => a.slug === applicationSlug);
  const entityName = application ? `${materialName} ${application.label}` : materialName;

  // The identical photo the material's own /materials/<slug> page shows —
  // never a different or newly invented one, per request.
  const heroImage = resolveMaterialHeroImage(materialSlug, materialName, material?.heroImage ?? null);

  return { materialName, application, entityName, city, heroImage };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, application, city: citySlug } = await params;
  const resolved = await resolve(slug, application, citySlug);
  if (!resolved) return {};

  return buildMetadata({
    title: `${resolved.entityName} in ${resolved.city.name}`,
    description: `Premium ${resolved.entityName} in ${resolved.city.name} by By Devyora. Custom-made to your drawings with lasting quality for residential and commercial projects.`,
    path: `/materials/${slug}/${application}/${citySlug}`,
  });
}

export default async function MaterialApplicationCityPage({
  params,
}: PageProps) {
  const { slug, application, city: citySlug } = await params;
  const resolved = await resolve(slug, application, citySlug);
  if (!resolved) notFound();

  const { materialName, entityName, city, heroImage } = resolved;

  return (
    <main
      style={{
        padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
      }}
    >
      <Breadcrumbs
        items={[
          { name: "Products", path: "/materials" },
          { name: materialName, path: `/materials/${slug}` },
          { name: city.name, path: `/materials/${slug}/${application}/${citySlug}` },
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
          lineHeight: 1.55,
        }}
      >
        Looking for premium {entityName} in {city.name}? By Devyora crafts
        custom architectural elements made precisely to your drawings —
        combining refined detailing with durable performance for homes,
        commercial spaces and restoration projects across {city.name}.
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
        idPrefix={`${slug}-${application}-${citySlug}`}
      />
    </main>
  );
}
