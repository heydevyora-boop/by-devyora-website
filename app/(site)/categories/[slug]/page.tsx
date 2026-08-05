import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { theme, pagePadX } from "@/lib/theme";
import { ImagePlaceholder, Eyebrow } from "@/components/site/ui";
import { ProductLink } from "@/components/site/product-link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await CategoryRepository.listForPicker();
  return categories.map((c) => ({ slug: c.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await CategoryRepository.findBySlugWithProducts(slug);
  if (!category) return {};
  return buildMetadata({
    title: category.name,
    description: category.description ?? `${category.name} — architectural products by By Devyora.`,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await CategoryRepository.findBySlugWithProducts(slug);
  if (!category) notFound();

  return (
    <main style={{ padding: `clamp(48px, 9vw, 130px) ${pagePadX} clamp(64px, 10vw, 160px)` }}>
      <Breadcrumbs
        items={
          category.parent
            ? [{ name: category.parent.name, path: `/categories/${category.parent.slug}` }, { name: category.name, path: `/categories/${category.slug}` }]
            : [{ name: category.name, path: `/categories/${category.slug}` }]
        }
      />
      {category.parent && (
        <Link href={`/categories/${category.parent.slug}`} style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: theme.color.muted }}>
          ← {category.parent.name}
        </Link>
      )}

      <Eyebrow>Category</Eyebrow>
      <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(48px, 8vw, 110px)", lineHeight: 0.92, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
        {category.name}
      </h1>
      {category.description && (
        <p style={{ maxWidth: "56ch", fontSize: 15, lineHeight: 1.65, color: "#4A4844", marginBottom: "clamp(36px, 5vw, 56px)" }}>
          {category.description}
        </p>
      )}

      {category.children.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "clamp(36px, 5vw, 56px)" }}>
          {category.children.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} style={{ padding: "9px 18px", border: `1px solid ${theme.color.border}`, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div style={{ height: 1, background: theme.color.ink, marginBottom: "clamp(36px, 5vw, 56px)" }} />

      {category.products.length === 0 ? (
        <p style={{ color: theme.color.muted, fontSize: 14 }}>No products in this category yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
          {category.products.map((p) => (
            <ProductLink key={p.id} href={`/products/${p.slug}`} title={p.name} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ImagePlaceholder label={p.name} />
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>{p.material.name}</div>
              <span style={{ fontFamily: theme.font.serif, fontSize: 20 }}>{p.name}</span>
              {p.shortDescription && <span style={{ fontSize: 12, color: theme.color.muted }}>{p.shortDescription}</span>}
            </ProductLink>
          ))}
        </div>
      )}
    </main>
  );
}
