import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { theme, pagePadX } from "@/lib/theme";
import { absoluteUrl, buildMetadata, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { RequirementForm } from "@/components/site/requirement-form";
import { SERVICE_CITIES, SERVICE_STATES } from "@/lib/data/service-cities";
import { resolveMaterialHeroImage } from "@/lib/material-pages";

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

  // The identical photo the material's own /materials/<slug> page shows —
  // never a different or newly invented one, per request.
  const heroImage = resolveMaterialHeroImage(materialSlug, material.name, material.heroImage);

  const stateName = city.name === "Chandigarh" ? undefined : SERVICE_STATES.find((entry) => entry.cities.includes(city.name))?.state;
  return { material, application, entityName, city, stateName, heroImage };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, application, city: citySlug } = await params;
  const resolved = await resolve(slug, application, citySlug);
  if (!resolved) return {};

  const region = resolved.stateName ? `${resolved.city.name}, ${resolved.stateName}` : resolved.city.name;
  return buildMetadata({
    title: `${resolved.entityName} in ${resolved.city.name}`,
    description: `Explore ${resolved.entityName.toLowerCase()} by By Devyora for projects in ${region}. Discuss custom designs, material options, dimensions and quantities for residential and commercial applications, with delivery across India.`,
    keywords: [
      `${resolved.entityName} in ${resolved.city.name}`,
      `${resolved.material.name} products ${resolved.city.name}`,
      `${resolved.entityName} supplier ${resolved.city.name}`,
      `${resolved.entityName} manufacturer India`,
    ],
    path: `/materials/${slug}/${application}/${citySlug}`,
  });
}

export default async function MaterialApplicationCityPage({
  params,
}: PageProps) {
  const { slug, application, city: citySlug } = await params;
  const resolved = await resolve(slug, application, citySlug);
  if (!resolved) notFound();

  const { material, entityName, city, stateName, heroImage } = resolved;
  const region = stateName ? `${city.name}, ${stateName}` : city.name;
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${entityName} for projects in ${city.name}`,
    serviceType: entityName,
    description: `By Devyora discusses custom ${entityName.toLowerCase()} requirements for residential and commercial projects in ${region}.`,
    provider: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    areaServed: { "@type": "City", name: city.name, containedInPlace: stateName ? { "@type": "State", name: stateName } : { "@type": "Country", name: "India" } },
    url: absoluteUrl(`/materials/${slug}/${application}/${citySlug}`),
  };

  return (
    <main
      style={{
        padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
      }}
    >
      <JsonLd data={serviceSchema} />
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
          lineHeight: 1.55,
        }}
      >
        Looking for {entityName.toLowerCase()} in {city.name}? By Devyora discusses custom architectural product requirements made to drawing for residential, commercial and hospitality projects in {region}. Share your reference, dimensions and quantity to request a project-specific consultation.
      </p>

      <p style={{ fontSize: 13, color: theme.color.muted, maxWidth: "60ch", lineHeight: 1.7, marginTop: -18, marginBottom: 36 }}>
        By Devyora is based in Bhopal, Madhya Pradesh and handles enquiries for projects across India. This page provides product information for {region}; it does not represent a local branch or showroom in {city.name}.
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
