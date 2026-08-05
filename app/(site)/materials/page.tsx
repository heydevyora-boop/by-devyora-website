import type { Metadata } from "next";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, ImagePlaceholder } from "@/components/site/ui";
import { TransitionLink } from "@/components/site/transition-link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Products — Eleven Architectural Material Systems",
  description: "Eleven architectural material systems, cast, moulded and fired to drawing: GRC, FRP, terracotta, WPC and more.",
  path: "/materials",
});

export const revalidate = 3600;

export default async function MaterialsPage() {
  const materials = await MaterialRepository.findAll({ publishedOnly: true });

  return (
    <main style={{ padding: `clamp(48px, 9vw, 130px) ${pagePadX} 0` }}>
      <Breadcrumbs items={[{ name: "Products", path: "/materials" }]} />      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 5vw, 80px)", alignItems: "end", paddingBottom: "clamp(40px, 6vw, 84px)" }}>
        <div>
          <Eyebrow>Catalogue — Eleven Systems</Eyebrow>
          <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(54px, 10vw, 150px)", lineHeight: 0.9, letterSpacing: "-0.02em", margin: 0 }}>
            Products
          </h1>
        </div>
        <p style={{ maxWidth: "46ch", margin: 0, fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.65, color: "#4A4844" }}>
          Cast, moulded and fired architectural materials, made to drawing for facades, thresholds and landscapes.
          Select a system to see specifications, applications and the products built on it.
        </p>
      </div>

      <div style={{ height: 1, background: theme.color.ink, marginBottom: "clamp(36px, 5vw, 64px)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(260px, 28vw, 380px), 1fr))", gap: "clamp(16px, 2vw, 28px)", paddingBottom: "clamp(48px, 8vw, 120px)" }}>
        {materials.map((m) => (
          <TransitionLink
            key={m.id}
            href={`/materials/${m.slug}`}
            title={m.name}
            style={{ display: "flex", flexDirection: "column", border: `1px solid ${theme.color.border}`, overflow: "hidden" }}
          >
            <div style={{ position: "relative" }}>
              <ImagePlaceholder label={m.name} />
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#FFFFFF",
                  background: "rgba(18,17,16,0.6)",
                  padding: "5px 10px",
                }}
              >
                {String(m.num).padStart(3, "0")}
              </span>
            </div>
            <div style={{ padding: "clamp(16px, 2vw, 24px)", display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(22px, 2.4vw, 32px)", letterSpacing: "-0.01em" }}>{m.name}</span>
              <span style={{ fontSize: 13, color: theme.color.muted }}>{m.tagline}</span>
              <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.color.accent, paddingTop: 8 }}>
                View system ↗
              </span>
            </div>
          </TransitionLink>
        ))}
      </div>
    </main>
  );
}
