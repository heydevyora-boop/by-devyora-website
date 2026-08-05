import type { Metadata } from "next";
import Link from "next/link";
import { ProjectRepository } from "@/lib/repositories/project.repository";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, ImagePlaceholder } from "@/components/site/ui";
import { TransitionLink } from "@/components/site/transition-link";
import type { ProjectType } from "@prisma/client";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

const TYPES: { label: string; value: ProjectType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Hospitality", value: "HOSPITALITY" },
  { label: "Landscape", value: "LANDSCAPE" },
];

type PageProps = { searchParams: Promise<{ type?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  // Filtered views (?type=RESIDENTIAL etc.) are noindexed — same content as the
  // canonical /projects, just pre-filtered, so indexing both would be duplicate content.
  return buildMetadata({
    title: "Projects — Portfolio",
    description: "Residential, commercial, hospitality and landscape projects specifying By Devyora materials.",
    path: "/projects",
    index: !sp.type,
  });
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const activeType = (sp.type as ProjectType | undefined) ?? undefined;

  const projects = await ProjectRepository.findAll({ publishedOnly: true, type: activeType });

  return (
    <main style={{ padding: `clamp(48px, 9vw, 130px) ${pagePadX} 0` }}>
      <Breadcrumbs items={[{ name: "Projects", path: "/projects" }]} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 5vw, 80px)", alignItems: "end", paddingBottom: "clamp(40px, 6vw, 84px)" }}>
        <div>
          <Eyebrow>Portfolio</Eyebrow>
          <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(54px, 10vw, 150px)", lineHeight: 0.9, letterSpacing: "-0.02em", margin: 0 }}>
            Projects
          </h1>
        </div>
        <p style={{ maxWidth: "46ch", margin: 0, fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.65, color: "#4A4844" }}>
          A selection of residential, commercial and hospitality projects where our materials define the
          architectural character.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "clamp(20px, 3vw, 32px) 0", borderTop: `1px solid ${theme.color.ink}`, borderBottom: `1px solid ${theme.color.border}` }}>
        {TYPES.map((t) => {
          const isActive = (t.value === "ALL" && !activeType) || t.value === activeType;
          const href = t.value === "ALL" ? "/projects" : `/projects?type=${t.value}`;
          return (
            <Link
              key={t.value}
              href={href}
              style={{
                padding: "9px 18px",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: `1px solid ${theme.color.border}`,
                background: isActive ? theme.color.ink : "transparent",
                color: isActive ? "#FFFFFF" : theme.color.ink,
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "clamp(28px, 4vw, 56px)", padding: "clamp(36px, 5vw, 64px) 0 clamp(64px, 8vw, 120px)" }}>
        {projects.map((p) => (
          <TransitionLink key={p.id} href={`/projects/${p.slug}`} title={p.name} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <ImagePlaceholder label={p.name} aspectRatio="16/10" />
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>
              {p.location} · {p.type}
            </div>
            <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(22px, 2.2vw, 32px)", lineHeight: 1.1 }}>{p.name}</span>
            <span style={{ fontSize: 13, color: theme.color.muted, lineHeight: 1.5 }}>{p.architect}</span>
          </TransitionLink>
        ))}
        {projects.length === 0 && <p style={{ color: theme.color.muted }}>No projects match this filter yet.</p>}
      </div>
    </main>
  );
}
