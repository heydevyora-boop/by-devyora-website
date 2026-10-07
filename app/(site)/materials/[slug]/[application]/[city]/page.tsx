import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { theme, pagePadX } from "@/lib/theme";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { RequirementForm } from "@/components/site/requirement-form";
import { SERVICE_CITIES } from "@/lib/data/service-cities";

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
 */
async function resolve(
  materialSlug: string,
  applicationSlug: string,
  citySlug: string
) {
  const city = SERVICE_CITIES.find((c) => c.slug === citySlug);
  if (!city) return null;

  const material = await MaterialRepository.findBySlug(materialSlug);
  if (!material) return null;

  const application = material.applications.find((a) => a.slug === applicationSlug);
  const entityName = application ? `${material.name} ${application.label}` : material.name;

  return { material, application, entityName, city };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, application, city: citySlug } = await params;
  const resolved = await resolve(slug, application, citySlug);
  if (!resolved) return {};

  return buildMetadata({
    title: `${resolved.entityName} in ${resolved.city.name}`,
    description: `${resolved.entityName} by By Devyora, available in ${resolved.city.name}.`,
    path: `/materials/${slug}/${application}/${citySlug}`,
  });
}

export default async function MaterialApplicationCityPage({
  params,
}: PageProps) {
  const { slug, application, city: citySlug } = await params;
  const resolved = await resolve(slug, application, citySlug);
  if (!resolved) notFound();

  const { material, entityName, city } = resolved;

  return (
    <main
      style={{
        padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
      }}
    >
      <Breadcrumbs
        items={[
          { name: "Products", path: "/materials" },
          { name: material.name, path: `/materials/${slug}` },
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
        }}
      >
        {entityName}, made to drawing by By Devyora, serving {city.name} —
        full specifications and photos coming soon.
      </p>

      <RequirementForm
        eyebrow={`${entityName} in ${city.name}`}
        description={`Share your drawing, reference image, dimensions or project requirement with By Devyora to discuss ${entityName} in ${city.name}.`}
        idPrefix={`${slug}-${application}-${citySlug}`}
      />
    </main>
  );
}
