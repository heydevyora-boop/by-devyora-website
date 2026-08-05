import type { Metadata } from "next";
import Link from "next/link";
import { BlogRepository, BlogCategoryRepository, TagRepository } from "@/lib/repositories/blog.repository";
import { blogListQuerySchema } from "@/lib/validations/blog";
import { theme, pagePadX } from "@/lib/theme";
import { Eyebrow, ImagePlaceholder } from "@/components/site/ui";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import type { ListSearchParams } from "@/lib/list-params";

export async function generateMetadata({ searchParams }: { searchParams: Promise<ListSearchParams> }): Promise<Metadata> {
  const sp = await searchParams;
  return buildMetadata({
    title: "Journal",
    description: "Notes on materials, specification and manufacturing from the By Devyora studio.",
    path: "/journal",
    index: !sp.categorySlug && !sp.tagSlug && !sp.q,
  });
}

export default async function JournalPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const sp = await searchParams;
  const query = blogListQuerySchema.parse({
    q: sp.q,
    categorySlug: sp.categorySlug,
    tagSlug: sp.tagSlug,
    publishedOnly: true,
    page: sp.page,
    perPage: sp.perPage,
  });

  const [{ items, total }, categories, tags] = await Promise.all([
    BlogRepository.findPaginated(query),
    BlogCategoryRepository.listForPicker(),
    TagRepository.listForPicker(),
  ]);

  return (
    <main style={{ padding: `clamp(48px, 9vw, 130px) ${pagePadX} clamp(64px, 10vw, 160px)` }}>
      <Breadcrumbs items={[{ name: "Journal", path: "/journal" }]} />
      <Eyebrow>Notes from the studio</Eyebrow>
      <h1 style={{ fontFamily: theme.font.serif, fontWeight: 400, fontSize: "clamp(48px, 8vw, 110px)", lineHeight: 0.9, letterSpacing: "-0.02em", margin: "0 0 clamp(28px, 4vw, 48px)" }}>
        Journal
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingBottom: 24, borderBottom: `1px solid ${theme.color.border}`, marginBottom: "clamp(28px, 4vw, 44px)" }}>
        <Link
          href="/journal"
          style={{ padding: "8px 16px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${!sp.categorySlug ? theme.color.ink : theme.color.border}`, background: !sp.categorySlug ? theme.color.ink : "transparent", color: !sp.categorySlug ? "#FFFFFF" : theme.color.ink }}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/journal?categorySlug=${c.slug}`}
            style={{ padding: "8px 16px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${sp.categorySlug === c.slug ? theme.color.ink : theme.color.border}`, background: sp.categorySlug === c.slug ? theme.color.ink : "transparent", color: sp.categorySlug === c.slug ? "#FFFFFF" : theme.color.ink }}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "clamp(36px, 5vw, 56px)" }}>
          {tags.map((t) => (
            <Link key={t.id} href={`/journal?tagSlug=${t.slug}`} style={{ fontSize: 11, color: sp.tagSlug === t.slug ? theme.color.ink : theme.color.accent }}>
              #{t.name}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p style={{ color: theme.color.muted }}>No posts match this filter yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(28px, 4vw, 48px)" }}>
          {items.map((post) => (
            <Link key={post.id} href={`/journal/${post.slug}`} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ImagePlaceholder label={post.title} aspectRatio="3/2" />
              <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: theme.color.accent }}>{post.category.name}</span>
              <span style={{ fontFamily: theme.font.serif, fontSize: 22, lineHeight: 1.15 }}>{post.title}</span>
              <span style={{ fontSize: 13, color: theme.color.muted, lineHeight: 1.5 }}>{post.excerpt}</span>
            </Link>
          ))}
        </div>
      )}
      <p style={{ fontSize: 11, color: theme.color.muted, marginTop: 40 }}>{total} post{total === 1 ? "" : "s"}</p>
    </main>
  );
}
