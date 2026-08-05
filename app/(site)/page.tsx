import type { Metadata } from "next";
import Link from "next/link";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { ProjectRepository } from "@/lib/repositories/project.repository";
import { DownloadRepository } from "@/lib/repositories/download.repository";
import { BlogRepository } from "@/lib/repositories/blog.repository";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, PrimaryButton, ImagePlaceholder, SectionLabel } from "@/components/site/ui";
import { TransitionLink } from "@/components/site/transition-link";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "By Devyora — Architectural Materials Made to Drawing",
  description: "Cast, moulded and fired architectural materials for facades, thresholds and landscapes — eleven systems, one integrated facility, made to your drawing.",
  path: "/",
  absoluteTitle: true,
});

export const revalidate = 1800;

export default async function HomePage() {
  const [materials, featuredProjects, downloads, posts] = await Promise.all([
    MaterialRepository.findAll({ publishedOnly: true }),
    ProjectRepository.findFeatured(2),
    DownloadRepository.findAll({ publishedOnly: true }),
    BlogRepository.findAll({ publishedOnly: true }),
  ]);

  const topMaterials = materials.slice(0, 6);
  const topDownloads = downloads.slice(0, 4);
  const topPosts = posts.slice(0, 3);

  return (
    <div>
      <JsonLd data={organizationJsonLd()} />
      {/* Hero */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(28px, 5vw, 80px)",
          alignItems: "end",
          padding: `clamp(100px, 14vw, 180px) ${pagePadX} clamp(48px, 7vw, 96px)`,
        }}
      >
        <div>
          <Eyebrow>Architectural Building Materials</Eyebrow>
          <h1
            style={{
              fontFamily: theme.font.serif,
              fontWeight: 400,
              fontSize: "clamp(52px, 9vw, 140px)",
              lineHeight: 0.88,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Materials
            <br />
            made to
            <br />
            drawing
          </h1>
        </div>
        <div>
          <p style={{ maxWidth: "42ch", fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.65, color: "#4A4844", marginBottom: 32 }}>
            Cast, moulded and fired architectural materials for facades, thresholds and landscapes —
            eleven systems, one integrated facility, made to your drawing.
          </p>
          <PrimaryButton href="/materials">Browse products</PrimaryButton>
        </div>
      </section>

      {/* Material systems grid */}
      <section style={{ padding: `clamp(48px, 7vw, 96px) ${pagePadX}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
          <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(28px, 3.5vw, 44px)", margin: 0 }}>Eleven systems</h2>
          <Link href="/materials" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.color.accent }}>
            View all →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", borderTop: `1px solid ${theme.color.border}`, borderLeft: `1px solid ${theme.color.border}` }}>
          {topMaterials.map((m) => (
            <TransitionLink
              key={m.id}
              href={`/materials/${m.slug}`}
              title={m.name}
              style={{ background: "#FFFFFF", padding: "clamp(24px, 3vw, 36px)", display: "flex", flexDirection: "column", gap: 10, borderRight: `1px solid ${theme.color.border}`, borderBottom: `1px solid ${theme.color.border}` }}
            >
              <span style={{ fontSize: 11, letterSpacing: "0.2em", color: theme.color.accent }}>{String(m.num).padStart(3, "0")}</span>
              <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(20px, 1.8vw, 26px)" }}>{m.name}</span>
              <span style={{ fontSize: 13, color: theme.color.muted }}>{m.tagline}</span>
            </TransitionLink>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <section style={{ padding: `clamp(48px, 7vw, 96px) ${pagePadX}`, background: theme.color.mutedBg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(28px, 3.5vw, 44px)", margin: 0 }}>Recent projects</h2>
            <Link href="/projects" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.color.accent }}>
              All projects →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(28px, 4vw, 56px)" }}>
            {featuredProjects.map((p) => (
              <TransitionLink key={p.id} href={`/projects/${p.slug}`} title={p.name} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ImagePlaceholder label={p.name} aspectRatio="16/10" />
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>
                  {p.location} · {p.type}
                </div>
                <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(22px, 2.2vw, 32px)" }}>{p.name}</span>
              </TransitionLink>
            ))}
          </div>
        </section>
      )}

      {/* Downloads */}
      {topDownloads.length > 0 && (
        <section style={{ padding: `clamp(48px, 7vw, 96px) ${pagePadX}` }}>
          <SectionLabel>Resources</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", borderTop: `1px solid ${theme.color.border}`, borderLeft: `1px solid ${theme.color.border}` }}>
            {topDownloads.map((d) => (
              <div key={d.id} style={{ background: "#FFFFFF", padding: "clamp(20px, 2.5vw, 32px)", display: "flex", flexDirection: "column", gap: 8, borderRight: `1px solid ${theme.color.border}`, borderBottom: `1px solid ${theme.color.border}` }}>
                <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>{d.category}</span>
                <span style={{ fontFamily: theme.font.serif, fontSize: 20 }}>{d.name}</span>
                <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.color.accent }}>
                  Download ↓
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Journal preview */}
      {topPosts.length > 0 && (
        <section style={{ padding: `clamp(48px, 7vw, 120px) ${pagePadX}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(28px, 3.5vw, 44px)", margin: 0 }}>From the journal</h2>
            <Link href="/journal" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.color.accent }}>
              Read the journal →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(24px, 3vw, 40px)" }}>
            {topPosts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>
                  {post.category.name}
                </span>
                <span style={{ fontFamily: theme.font.serif, fontSize: 22, lineHeight: 1.15 }}>{post.title}</span>
                <span style={{ fontSize: 13, color: theme.color.muted, lineHeight: 1.5 }}>{post.excerpt}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
