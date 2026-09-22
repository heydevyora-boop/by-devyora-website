import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogRepository } from "@/lib/repositories/blog.repository";
import { theme, pagePadX } from "@/lib/theme";
import { ImagePlaceholder } from "@/components/site/ui";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata, articleJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await BlogRepository.listPublishedSlugs();
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await BlogRepository.findBySlug(slug);
  if (!post || !post.published) return {};
  return buildMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    path: `/journal/${post.slug}`,
    image: post.coverImage ?? undefined,
    type: "article",
  });
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await BlogRepository.findBySlug(slug);
  if (!post || !post.published) notFound();

  const related = await BlogRepository.findRelated(post.id, post.categoryId, 3);

  return (
    <main style={{ padding: `clamp(48px, 8vw, 110px) ${pagePadX} clamp(64px, 10vw, 160px)` }}>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          image: post.coverImage,
          publishedAt: post.publishedAt,
          authorName: post.author?.name,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Journal", path: "/journal" },
          { name: post.category.name, path: `/journal?categorySlug=${post.category.slug}` },
          { name: post.title, path: `/journal/${post.slug}` },
        ]}
      />

      <div style={{ maxWidth: "72ch" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>{post.category.name}</span>
        <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.05, letterSpacing: "-0.015em", margin: "16px 0 20px" }}>
          {post.title}
        </h1>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: theme.color.muted, marginBottom: "clamp(32px, 5vw, 52px)" }}>
          {post.author?.name && <span>{post.author.name}</span>}
          {post.publishedAt && <span>{post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>}
        </div>
      </div>

      <ImagePlaceholder label={post.title} aspectRatio="21/9" />

      <article
        style={{ maxWidth: "72ch", margin: "clamp(32px, 5vw, 52px) 0", fontSize: 16, lineHeight: 1.8, color: "#2A2826" }}
        // Content is authored in the admin's Tiptap editor (Module 10) by
        // trusted staff accounts only — never rendered from public input.
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "clamp(48px, 7vw, 80px)" }}>
          {post.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/journal?tagSlug=${tag.slug}`} style={{ fontSize: 11, color: theme.color.accent, border: `1px solid ${theme.color.border}`, padding: "6px 12px" }}>
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section style={{ paddingTop: "clamp(48px, 7vw, 80px)", borderTop: `1px solid ${theme.color.border}` }}>
          <h2 style={{ fontFamily: theme.font.serif, fontSize: "clamp(24px, 3vw, 34px)", marginBottom: 28 }}>More from {post.category.name}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "clamp(24px, 3vw, 40px)" }}>
            {related.map((r) => (
              <Link key={r.id} href={`/journal/${r.slug}`} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ImagePlaceholder label={r.title} aspectRatio="3/2" />
                <span style={{ fontFamily: theme.font.serif, fontSize: 18 }}>{r.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
