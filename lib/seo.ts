import type { Metadata } from "next";

/**
 * Single source of truth for the site origin. Every canonical URL, OG image,
 * sitemap entry, and JSON-LD @id is built from this — change it once here
 * when you move from staging to production.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bydevyora.com").replace(/\/$/, "");
export const SITE_NAME = "By Devyora";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/materials/grc" — used for canonical + OG url. */
  path: string;
  image?: string;
  /** "article" for blog posts, "product" for product pages, "website" otherwise. */
  type?: "website" | "article" | "product";
  /** Set false on pages that shouldn't be indexed (e.g. thin/duplicate variants). */
  index?: boolean;
  /**
   * Set true when `title` already includes the brand name (e.g. the homepage) —
   * bypasses the root layout's `%s — By Devyora` template so it doesn't get
   * appended a second time. Every other page should leave this false.
   */
  absoluteTitle?: boolean;
};

/**
 * Every page's `generateMetadata`/`metadata` export should return this
 * (spread with any page-specific overrides) rather than hand-rolling OG/
 * canonical tags — keeps title templates, image fallbacks, and robots
 * directives consistent site-wide.
 */
export function buildMetadata({ title, description, path, image, type = "website", index = true, absoluteTitle = false }: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: type === "product" ? "website" : type, // OG protocol has no "product" type
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD builders — plain objects, serialized by <JsonLd /> (components/site/json-ld.tsx)
// ---------------------------------------------------------------------------

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Architectural building materials manufacturer — GRC, FRP, terracotta and composite systems, made to drawing.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Industrial Area, Sector 82",
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      postalCode: "122004",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-000-000-0000",
      contactType: "sales",
      email: "studio@bydevyora.com",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  sku: string;
  brand?: string;
  variants: { sku: string; price: string | null; currency: string; inStock: boolean }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku,
    image: product.image ?? undefined,
    brand: { "@type": "Brand", name: product.brand ?? SITE_NAME },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: v.currency,
      price: v.price ?? undefined,
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    })),
  };
}

export function articleJsonLd(post: { title: string; excerpt: string; slug: string; image?: string | null; publishedAt: Date | null; authorName?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    author: { "@type": "Person", name: post.authorName ?? SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
  };
}

/**
 * LocalBusiness-flavoured schema for a city landing page — signals "we serve
 * this area" without claiming a physical branch exists there.
 */
export function localBusinessJsonLd(input: { cityName: string; region: string | null; path: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${SITE_NAME} — ${input.cityName}`,
    description: input.description,
    url: absoluteUrl(input.path),
    areaServed: { "@type": "City", name: input.cityName, containedInPlace: input.region ?? "India" },
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
