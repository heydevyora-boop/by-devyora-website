import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { theme, pagePadX } from "@/lib/theme";
import { absoluteUrl, buildMetadata, SITE_NAME } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { RequirementForm } from "@/components/site/requirement-form";
import { findProductTypeBySlug, withoutSampleSuffix, PRODUCT_TYPE_IMAGES } from "@/lib/product-types";
import { SERVICE_CITIES, SERVICE_STATES } from "@/lib/data/service-cities";
import { getProductCityDescription, getProductSeo } from "@/lib/product-seo";
import { JsonLd } from "@/components/site/json-ld";

type PageProps = { params: Promise<{ slug: string; city: string }> };
export const revalidate = 3600;

function seoKeywordsForCity(typeSlug: string, fallbackName: string): string[] {
  return getProductSeo(typeSlug, fallbackName).keywords;
}

function getCityState(cityName: string): string | undefined {
  if (cityName === "Chandigarh") return undefined;
  return SERVICE_STATES.find((entry) => entry.cities.includes(cityName))?.state;
}

async function resolve(slug: string, citySlug: string) {
  const city = SERVICE_CITIES.find((item) => item.slug === citySlug);
  if (!city) return null;

  const product = await ProductRepository.findBySlug(slug);
  if (product && product.status === "PUBLISHED") {
    const typeSlug = findProductTypeBySlug(slug)?.type.slug;
    const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
    const heroImage = primary
      ? { url: primary.url, alt: primary.alt ?? product.name }
      : (typeSlug && PRODUCT_TYPE_IMAGES[typeSlug]) || null;
    return {
      entityName: withoutSampleSuffix(product.name),
      city,
      stateName: getCityState(city.name),
      heroImage,
      materialSlug: product.material.slug,
      typeSlug: typeSlug ?? slug,
    };
  }

  const fallback = findProductTypeBySlug(slug);
  if (!fallback) return null;
  return {
    entityName: fallback.type.name,
    city,
    stateName: getCityState(city.name),
    heroImage: PRODUCT_TYPE_IMAGES[fallback.type.slug] ?? null,
    materialSlug: fallback.materialSlug,
    typeSlug: fallback.type.slug,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const resolved = await resolve(slug, citySlug);
  if (!resolved) return {};

  const description = getProductCityDescription(resolved.entityName, resolved.city.name, resolved.stateName);
  return buildMetadata({
    title: `${resolved.entityName} in ${resolved.city.name}`,
    description,
    keywords: [...seoKeywordsForCity(resolved.typeSlug, resolved.entityName), `${resolved.entityName} in ${resolved.city.name}`, `${resolved.entityName} supplier ${resolved.city.name}`, `${resolved.entityName} ${resolved.city.name} ${resolved.stateName ?? "India"}`],
    path: `/products/${slug}/${citySlug}`,
    image: resolved.heroImage?.url,
    type: "product",
  });
}

export default async function ProductCityPage({ params }: PageProps) {
  const { slug, city: citySlug } = await params;
  const resolved = await resolve(slug, citySlug);
  if (!resolved) notFound();

  const { entityName, city, stateName, heroImage, materialSlug, typeSlug } = resolved;
  const seo = getProductSeo(typeSlug, entityName);
  const location = stateName ? `${city.name}, ${stateName}` : city.name;
  const description = getProductCityDescription(entityName, city.name, stateName);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${entityName} for projects in ${city.name}`,
    serviceType: entityName,
    description,
    provider: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    areaServed: { "@type": "City", name: city.name, containedInPlace: stateName ? { "@type": "State", name: stateName } : { "@type": "Country", name: "India" } },
    url: absoluteUrl(`/products/${slug}/${citySlug}`),
  };

  return (
    <main style={{ padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)` }}>
      <JsonLd data={serviceSchema} />
      <Breadcrumbs items={[
        { name: "Products", path: "/materials" },
        { name: entityName, path: `/products/${slug}` },
        { name: city.name, path: `/products/${slug}/${citySlug}` },
      ]} />

      <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.015em", margin: "0 0 16px" }}>
        {entityName} in {city.name}
      </h1>
      <p style={{ fontSize: 16, color: theme.color.muted, maxWidth: "68ch", marginBottom: 18, lineHeight: 1.75 }}>
        {description}
      </p>
      <p style={{ fontSize: 13, color: theme.color.muted, maxWidth: "68ch", marginBottom: "clamp(32px, 5vw, 56px)", lineHeight: 1.7 }}>
        By Devyora is based in Bhopal, Madhya Pradesh and discusses custom architectural product requirements for projects across India. This page provides product information for enquiries from {location}; it is not a claim of a local showroom or branch in {city.name}.
      </p>

      {heroImage && (
        <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", aspectRatio: "16/9", overflow: "hidden", position: "relative", background: "#F6F4F1", marginBottom: "clamp(40px, 6vw, 72px)" }}>
          <Image src={heroImage.url} alt={heroImage.alt} fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} />
        </div>
      )}

      <section style={{ maxWidth: 900, margin: "0 auto 56px" }}>
        <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 400, margin: "0 0 16px" }}>
          Custom {entityName} for projects in {city.name}
        </h2>
        <p style={{ color: theme.color.muted, lineHeight: 1.8, fontSize: 15 }}>
          {seo.intro} For enquiries from {location}, share your project location, drawings or reference images, required dimensions, finish preference and approximate quantity. The team can review the brief and advise on product options, customisation and delivery feasibility.
        </p>
        <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(24px, 2.8vw, 34px)", fontWeight: 400, margin: "34px 0 14px" }}>
          Applications of {entityName}
        </h2>
        <ul style={{ paddingLeft: 22, color: theme.color.muted, lineHeight: 1.9, fontSize: 15 }}>
          {seo.applications.map((application) => <li key={application}>{application}</li>)}
        </ul>
        <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(24px, 2.8vw, 34px)", fontWeight: 400, margin: "34px 0 14px" }}>
          Ordering and delivery to {city.name}
        </h2>
        <p style={{ color: theme.color.muted, lineHeight: 1.8, fontSize: 15 }}>
          Product selection depends on the design, dimensions, material, finish, quantity and site conditions. By Devyora coordinates enquiries for projects across India. Delivery timelines, packaging, transport and installation responsibilities are confirmed against the final product and destination before an order is placed.
        </p>
        <p style={{ color: theme.color.muted, lineHeight: 1.8, fontSize: 15 }}>
          Explore the main <Link href={`/products/${slug}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{entityName} product page</Link> or browse the <Link href={`/materials/${materialSlug}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{materialSlug.replaceAll("-", " ")} range</Link> for related architectural products.
        </p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto 64px" }}>
        <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(24px, 2.8vw, 34px)", fontWeight: 400, margin: "0 0 18px" }}>Frequently asked questions</h2>
        <div style={{ borderTop: "1px solid #E7E4DF", padding: "18px 0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 8px" }}>Can I order custom {entityName.toLowerCase()} for a project in {city.name}?</h3>
          <p style={{ color: theme.color.muted, lineHeight: 1.75, margin: 0, fontSize: 14 }}>Yes. Share your drawings, reference images, dimensions and quantity so the team can review the custom requirement and confirm feasibility.</p>
        </div>
        <div style={{ borderTop: "1px solid #E7E4DF", padding: "18px 0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 8px" }}>Does By Devyora deliver {entityName.toLowerCase()} to {city.name}?</h3>
          <p style={{ color: theme.color.muted, lineHeight: 1.75, margin: 0, fontSize: 14 }}>PAN-India delivery can be discussed for suitable products. Transport method, packing and delivery timelines are confirmed according to product size, quantity and destination.</p>
        </div>
        <div style={{ borderTop: "1px solid #E7E4DF", borderBottom: "1px solid #E7E4DF", padding: "18px 0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 8px" }}>How can I get a quote for {entityName.toLowerCase()}?</h3>
          <p style={{ color: theme.color.muted, lineHeight: 1.75, margin: 0, fontSize: 14 }}>Send the product type, dimensions, finish, quantity and project location. A drawing or reference photograph helps the team understand the requirement.</p>
        </div>
      </section>

      <RequirementForm eyebrow={`${entityName} in ${city.name}`} description={`Share your drawing, reference image, dimensions, quantity and project location in ${city.name} to request a product consultation and quote.`} idPrefix={`${slug}-${citySlug}`} />
    </main>
  );
}
