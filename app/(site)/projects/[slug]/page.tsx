import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectRepository } from "@/lib/repositories/project.repository";
import { theme, pagePadX } from "@/lib/theme";
import { ImagePlaceholder, PrimaryButton } from "@/components/site/ui";
import { TransitionLink } from "@/components/site/transition-link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await ProjectRepository.findAll({ publishedOnly: true });
  return projects.map((p) => ({ slug: p.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await ProjectRepository.findBySlug(slug);
  if (!project) return {};
  return buildMetadata({
    title: `${project.name} — ${project.location}`,
    description: project.description,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await ProjectRepository.findBySlug(slug);
  if (!project || !project.published) notFound();

  const related = await ProjectRepository.findRelated(project.id, project.type, 2);
  const productNames = project.materials.map((pm) => pm.material.name).join(", ");

  return (
    <main style={{ padding: `0 0 clamp(60px, 8vw, 120px)` }}>
      <div style={{ aspectRatio: "21/9" }}>
        <ImagePlaceholder label={`${project.name} — Hero`} aspectRatio="21/9" />
      </div>

      <div style={{ padding: `0 ${pagePadX}` }}>
        <div style={{ paddingTop: "clamp(24px, 4vw, 40px)" }}>
          <Breadcrumbs items={[{ name: "Projects", path: "/projects" }, { name: project.name, path: `/projects/${project.slug}` }]} />
        </div>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "clamp(28px, 5vw, 80px)", padding: "clamp(24px, 4vw, 48px) 0 clamp(48px, 7vw, 96px)" }}>
          <div>
            <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 0.95, letterSpacing: "-0.02em", margin: "0 0 clamp(24px, 3vw, 40px)" }}>
              {project.name}
            </h1>
            <p style={{ maxWidth: "48ch", margin: 0, fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: 1.65, color: "#4A4844" }}>{project.description}</p>
          </div>
          <div>
            {[
              ["Location", project.location],
              ["Architect", project.architect],
              ["Year", String(project.year)],
              ["Products used", productNames || "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "18px 0", borderBottom: `1px solid ${theme.color.border}`, fontSize: 14 }}>
                <span style={{ color: theme.color.muted }}>{label}</span>
                <span style={{ textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "clamp(12px, 1.5vw, 20px)", paddingBottom: "clamp(48px, 7vw, 96px)" }}>
          <ImagePlaceholder label="Gallery 1" />
          <ImagePlaceholder label="Gallery 2" />
          <ImagePlaceholder label="Gallery 3" />
          <div style={{ gridColumn: "1 / -1" }}>
            <ImagePlaceholder label="Gallery — Wide" aspectRatio="21/9" />
          </div>
        </div>

        {project.technicalInfo && (
          <section style={{ padding: "clamp(48px, 7vw, 96px) 0", borderTop: `1px solid ${theme.color.ink}` }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.accent, marginBottom: 28 }}>
              Technical information
            </div>
            <p style={{ maxWidth: "64ch", margin: 0, fontSize: "clamp(15px, 1.15vw, 17px)", lineHeight: 1.7, color: "#4A4844" }}>{project.technicalInfo}</p>
          </section>
        )}

        {related.length > 0 && (
          <section style={{ padding: "clamp(48px, 7vw, 96px) 0 0", borderTop: `1px solid ${theme.color.border}` }}>
            <h2 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(28px, 3.5vw, 44px)", margin: "0 0 clamp(28px, 4vw, 48px)" }}>
              Related projects
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "clamp(28px, 4vw, 56px)" }}>
              {related.map((rp) => (
                <TransitionLink key={rp.id} href={`/projects/${rp.slug}`} title={rp.name} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <ImagePlaceholder label={rp.name} aspectRatio="16/10" />
                  <span style={{ fontFamily: theme.font.serif, fontSize: "clamp(20px, 1.8vw, 26px)" }}>{rp.name}</span>
                  <span style={{ fontSize: 13, color: theme.color.muted }}>{rp.location}</span>
                </TransitionLink>
              ))}
            </div>
          </section>
        )}

        <section style={{ padding: "clamp(64px, 9vw, 130px) 0 0", textAlign: "center" }}>
          <h2 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.05, margin: "0 0 24px" }}>
            Specify By Devyora for your next project
          </h2>
          <PrimaryButton href="/contact">Get in touch</PrimaryButton>
        </section>

        <div style={{ paddingTop: "clamp(48px, 7vw, 96px)" }}>
          <Link href="/projects" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.muted }}>
            ← All projects
          </Link>
        </div>
      </div>
    </main>
  );
}
