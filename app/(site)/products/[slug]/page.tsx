import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { theme, pagePadX } from "@/lib/theme";
import { ImagePlaceholder } from "@/components/site/ui";
import { ProductDetailInteractive } from "@/components/site/product-detail-client";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ProductLink } from "@/components/site/product-link";
import { RequirementForm } from "@/components/site/requirement-form";
import { ALL_PRODUCT_TYPE_SLUGS, findProductTypeBySlug } from "@/lib/product-types";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await ProductRepository.listPublishedSlugs();
  const dbSlugs = new Set(products.map((p) => p.slug));
  // Union with every type's implied slug so each type's page is prerendered
  // even before the database has a matching row — see findProductTypeBySlug.
  const allSlugs = new Set([...dbSlugs, ...ALL_PRODUCT_TYPE_SLUGS]);
  return Array.from(allSlugs).map((slug) => ({ slug }));
}

export const revalidate = 3600;

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductRepository.findBySlug(slug);
  if (product) {
    return buildMetadata({
      title: product.name,
      description:
        product.shortDescription ??
        `${product.name} — a ${product.material.name} product from By Devyora, made to drawing.`,
      path: `/products/${product.slug}`,
      image: product.images[0]?.url ?? undefined,
      type: "product",
    });
  }

  const fallback = findProductTypeBySlug(slug);
  if (!fallback) return {};
  return buildMetadata({
    title: fallback.type.name,
    description: `${fallback.type.name}, made to drawing by By Devyora.`,
    path: `/products/${slug}`,
    type: "product",
  });
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await ProductRepository.findBySlug(slug);

  if (!product || product.status !== "PUBLISHED") {
    // Not in the database yet (production hasn't been reseeded since this
    // type was added) — fall back to a minimal page built from the type
    // list alone, so this is never a dead link. No photo yet, same shared
    // enquiry form as every other product page; once the real row exists
    // (after seeding), that version takes over automatically.
    const fallback = findProductTypeBySlug(slug);
    if (!fallback) notFound();

    const material = await MaterialRepository.findBySlug(fallback.materialSlug);
    const materialName = material?.name ?? titleCaseFromSlug(fallback.materialSlug);

    return (
      <main
        style={{
          padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
        }}
      >
        <Breadcrumbs
          items={[
            { name: "Products", path: "/materials" },
            { name: materialName, path: `/materials/${fallback.materialSlug}` },
            { name: fallback.type.name, path: `/products/${slug}` },
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
          {fallback.type.name}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: theme.color.muted,
            maxWidth: "60ch",
            marginBottom: "clamp(32px, 5vw, 56px)",
          }}
        >
          {fallback.type.name}, made to drawing — full specifications and
          photos coming soon.
        </p>

        <RequirementForm
          eyebrow={`${fallback.type.name} By Devyora`}
          description={`Share your drawing, reference image, dimensions or project requirement with By Devyora to discuss ${fallback.type.name}.`}
          idPrefix={slug}
        />
      </main>
    );
  }

  const related = await ProductRepository.findRelated(product, 4);

  return (
    <main
      style={{
        padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)`,
      }}
    >
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.description ?? product.shortDescription,
          slug: product.slug,
          image: product.images[0]?.url ?? null,
          sku: product.sku,
          brand: product.material.name,
          variants: product.variants.map((v) => ({
            sku: v.sku,
            price: v.price ? v.price.toString() : null,
            currency: v.currency,
            inStock: v.inStock,
          })),
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Products", path: "/materials" },
          {
            name: product.material.name,
            path: `/materials/${product.material.slug}`,
          },
          ...(product.category
            ? [
                {
                  name: product.category.name,
                  path: `/categories/${product.category.slug}`,
                },
              ]
            : []),
          { name: product.name, path: `/products/${product.slug}` },
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
        {product.name}
      </h1>
      {product.shortDescription && (
        <p
          style={{
            fontSize: 15,
            color: theme.color.muted,
            maxWidth: "60ch",
            marginBottom: "clamp(32px, 5vw, 56px)",
          }}
        >
          {product.shortDescription}
        </p>
      )}

      <ProductDetailInteractive
        productName={product.name}
        images={product.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          variantId: img.variantId,
          isPrimary: img.isPrimary,
        }))}
        variants={product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          size: v.size,
          finish: v.finish,
          color: v.color,
          price: v.price ? v.price.toString() : null,
          currency: v.currency,
          inStock: v.inStock,
          isDefault: v.isDefault,
        }))}
      />

      {product.description && (
        <section
          style={{
            padding: "clamp(48px, 7vw, 88px) 0 0",
            borderTop: `1px solid ${theme.color.border}`,
            marginTop: "clamp(48px, 7vw, 88px)",
          }}
        >
          <p
            style={{
              maxWidth: "68ch",
              fontSize: 15,
              lineHeight: 1.75,
              color: "#4A4844",
            }}
          >
            {product.description}
          </p>
        </section>
      )}

      {product.specifications.length > 0 && (
        <section style={{ padding: "clamp(40px, 6vw, 72px) 0 0" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 18,
              borderBottom: `1px solid ${theme.color.ink}`,
              marginBottom: 4,
            }}
          >
            Specification
          </div>
          {product.specifications.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 24,
                padding: "14px 0",
                borderBottom: `1px solid ${theme.color.border}`,
                fontSize: 14,
              }}
            >
              <span style={{ color: theme.color.muted }}>{s.key}</span>
              <span style={{ textAlign: "right" }}>{s.value}</span>
            </div>
          ))}
        </section>
      )}

      {product.downloads.length > 0 && (
        <section style={{ padding: "clamp(40px, 6vw, 72px) 0 0" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 18,
              borderBottom: `1px solid ${theme.color.ink}`,
              marginBottom: 4,
            }}
          >
            Downloads
          </div>
          {product.downloads.map((d) => (
            <a
              key={d.id}
              href={d.fileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                alignItems: "center",
                gap: 24,
                padding: "16px 0",
                borderBottom: `1px solid ${theme.color.border}`,
                fontSize: 14,
              }}
            >
              <span>{d.name}</span>
              <span style={{ fontSize: 12, color: theme.color.muted }}>
                {formatBytes(d.fileSize)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: theme.color.accent,
                }}
              >
                Download ↓
              </span>
            </a>
          ))}
        </section>
      )}

      <RequirementForm
        eyebrow={`${product.name} By Devyora`}
        description={`Share your drawing, reference image, dimensions or project requirement with By Devyora to discuss ${product.name}.`}
        idPrefix={product.slug}
      />

      {related.length > 0 && (
        <section style={{ padding: "clamp(56px, 9vw, 130px) 0 0" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: theme.color.accent,
              paddingBottom: 20,
              borderBottom: `1px solid ${theme.color.ink}`,
              marginBottom: 28,
            }}
          >
            You might also specify
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
              gap: "clamp(20px, 3vw, 32px)",
            }}
          >
            {related.map((p) => (
              <ProductLink
                key={p.id}
                href={`/products/${p.slug}`}
                title={p.name}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <ImagePlaceholder label={p.name} />
                <span style={{ fontFamily: theme.font.serif, fontSize: 20 }}>
                  {p.name}
                </span>
              </ProductLink>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
