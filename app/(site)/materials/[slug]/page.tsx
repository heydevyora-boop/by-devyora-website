import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { CityRepository } from "@/lib/repositories/city.repository";
import { theme, pagePadX } from "@/lib/theme";
import { ImagePlaceholder } from "@/components/site/ui";
import { ProductLink } from "@/components/site/product-link";
import { TransitionLink } from "@/components/site/transition-link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

type PageProps = { params: Promise<{ slug: string }> };

// Prebuild every published material at deploy time (there are only 11) — new
// ones added later still render fine on first request via dynamicParams.
export async function generateStaticParams() {
  const materials = await MaterialRepository.findAll({ publishedOnly: true });
  return materials.map((m) => ({ slug: m.slug }));
}

// Falls back to a time-based refresh if nothing triggers on-demand
// revalidation — material.actions.ts already calls revalidatePath() on every
// edit, so in practice this rarely needs to fire, but it's a safety net for
// edits made directly in the DB (e.g. a manual fix) that bypass the action layer.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const material = await MaterialRepository.findBySlug(slug);
  if (!material) return {};
  return buildMetadata({
    title: `${material.name} — Architectural Material System`,
    description: material.description ?? material.tagline,
    path: `/materials/${material.slug}`,
    image: material.heroImage ?? undefined,
  });
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const material = await MaterialRepository.findBySlug(slug);
  if (!material) notFound();

  const related = await MaterialRepository.findRelated(material.num, 3);
  const cities = await CityRepository.findAll();
  const topCities = cities.slice(0, 8);

  return (
    <main style={{ padding: `0 ${pagePadX} clamp(60px, 8vw, 120px)` }}>
      <div style={{ paddingTop: "clamp(24px, 4vw, 40px)" }}>
        <Breadcrumbs items={[{ name: "Products", path: "/materials" }, { name: material.name, path: `/materials/${material.slug}` }]} />
      </div>
      <section style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(24px, 4vw, 48px) 0 clamp(32px, 5vw, 60px)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: "clamp(20px, 3vw, 36px)" }}>
          {String(material.num).padStart(3, "0")} / 011 — Architectural System
        </div>
        <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(56px, 12.5vw, 210px)", lineHeight: 0.86, letterSpacing: "-0.03em", margin: 0 }}>
          {material.name}
        </h1>
        <p style={{ maxWidth: "40ch", margin: "clamp(28px, 4vw, 48px) 0 0", fontSize: "clamp(16px, 1.4vw, 21px)", lineHeight: 1.6, color: "#4A4844" }}>
          {material.tagline}
        </p>
      </section>

      <div style={{ aspectRatio: "16/7", width: "100%", overflow: "hidden" }}>
        <ImagePlaceholder label={`${material.name} — Hero`} aspectRatio="16/7" />
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(28px, 5vw, 80px)", padding: "clamp(48px, 7vw, 110px) 0 0" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 18, borderBottom: `1px solid ${theme.color.ink}` }}>
            Specification
          </div>
          {material.specs.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "16px 0", borderBottom: `1px solid ${theme.color.border}`, fontSize: 14 }}>
              <span style={{ color: theme.color.muted }}>{s.key}</span>
              <span style={{ textAlign: "right" }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 18, borderBottom: `1px solid ${theme.color.ink}` }}>
            Applications
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 22 }}>
            {material.applications.map((a) => (
              <Link
                key={a.id}
                href={topCities[0] ? `/materials/${material.slug}/${a.slug}/${topCities[0].slug}` : "#"}
                style={{ padding: "8px 16px", border: `1px solid ${theme.color.border}`, fontSize: 12, color: theme.color.muted }}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* City coverage — surfaces the automatically-generated location pages so search engines and visitors can discover them via internal links, not just the sitemap */}
      {topCities.length > 0 && material.applications[0] && (
        <section style={{ padding: "clamp(40px, 6vw, 72px) 0 0" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 18, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: 22 }}>
            {material.name} {material.applications[0].label}, by city
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topCities.map((c) => (
              <Link
                key={c.id}
                href={`/materials/${material.slug}/${material.applications[0].slug}/${c.slug}`}
                style={{ fontSize: 12, color: theme.color.accent }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products built on this material */}
      {material.products.length > 0 && (
        <section style={{ padding: "clamp(56px, 9vw, 130px) 0 0" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}`, marginBottom: 28 }}>
            Products in this system
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
            {material.products.map((p) => (
              <ProductLink key={p.id} href={`/products/${p.slug}`} title={p.name} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <ImagePlaceholder label={p.name} />
                <span style={{ fontFamily: theme.font.serif, fontSize: 20 }}>{p.name}</span>
                {p.shortDescription && <span style={{ fontSize: 12, color: theme.color.muted }}>{p.shortDescription}</span>}
              </ProductLink>
            ))}
          </div>
        </section>
      )}

      {/* Related systems */}
      {related.length > 0 && (
        <section style={{ padding: "clamp(56px, 9vw, 130px) 0 0" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, paddingBottom: 20, borderBottom: `1px solid ${theme.color.ink}` }}>
            Related systems
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", borderTop: `1px solid ${theme.color.border}`, borderLeft: `1px solid ${theme.color.border}` }}>
            {related.map((r) => (
              <TransitionLink key={r.id} href={`/materials/${r.slug}`} title={r.name} style={{ background: "#FFFFFF", padding: "clamp(24px, 3vw, 40px) clamp(18px, 2vw, 28px)", display: "flex", flexDirection: "column", gap: 12, borderRight: `1px solid ${theme.color.border}`, borderBottom: `1px solid ${theme.color.border}` }}>
                <span style={{ fontSize: 11, letterSpacing: "0.2em", color: theme.color.accent }}>{String(r.num).padStart(3, "0")}</span>
                <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(24px, 2.4vw, 34px)", lineHeight: 1.05 }}>{r.name}</span>
                <span style={{ fontSize: 13, color: theme.color.muted }}>{r.tagline}</span>
              </TransitionLink>
            ))}
          </div>
        </section>
      )}

      <div style={{ paddingTop: "clamp(48px, 7vw, 96px)" }}>
        <Link href="/materials" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.muted }}>
          ← All products
        </Link>
      </div>
    </main>
  );
}
