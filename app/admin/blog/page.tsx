import Link from "next/link";
import { BlogRepository, BlogCategoryRepository } from "@/lib/repositories/blog.repository";
import { blogListQuerySchema } from "@/lib/validations/blog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBlogPostAction } from "@/app/actions/blog.actions";
import type { ListSearchParams } from "@/lib/list-params";
import type { Prisma } from "@prisma/client";

type PostRow = Prisma.BlogPostGetPayload<{ include: { category: true; author: { select: { id: true; name: true; image: true } }; tags: { include: { tag: true } } } }>;

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const sp = await searchParams;
  const query = blogListQuerySchema.parse({ q: sp.q, categorySlug: sp.categorySlug, page: sp.page, perPage: sp.perPage });

  const [{ items, total, page, totalPages, perPage }, categories] = await Promise.all([
    BlogRepository.findPaginated(query),
    BlogCategoryRepository.listForPicker(),
  ]);

  const columns: Column<PostRow>[] = [
    {
      header: "Post",
      cell: (p) => (
        <Link href={`/admin/blog/${p.id}`} style={{ color: "#121110" }}>
          <div>{p.title}</div>
          <div style={{ fontSize: 11, color: "#6B6862" }}>{p.tags.map((t) => t.tag.name).join(", ") || "No tags"}</div>
        </Link>
      ),
    },
    { header: "Category", cell: (p) => p.category.name },
    { header: "Author", cell: (p) => p.author?.name ?? "—" },
    { header: "Status", cell: (p) => <StatusBadge value={p.published ? "PUBLISHED" : "DRAFT"} /> },
    { header: "Updated", cell: (p) => p.updatedAt.toLocaleDateString() },
    {
      header: "",
      align: "right",
      cell: (p) => (
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <Link href={`/admin/blog/${p.id}`} style={{ fontSize: 12, color: "#8C6A45" }}>Edit</Link>
          <DeleteButton id={p.id} action={deleteBlogPostAction} confirmMessage={`Delete "${p.title}"?`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Blog</h1>
        <Link href="/admin/blog/new" style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          + New post
        </Link>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 20, fontSize: 12 }}>
        <Link href="/admin/blog/categories" style={{ color: "#8C6A45" }}>Manage categories →</Link>
        <Link href="/admin/blog/tags" style={{ color: "#8C6A45" }}>Manage tags →</Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <SearchInput placeholder="Search posts…" />
        <FilterSelect paramKey="categorySlug" placeholder="All categories" options={categories.map((c) => ({ label: c.name, value: c.slug }))} />
      </div>

      <DataTable columns={columns} rows={items} rowKey={(p) => p.id} emptyState="No posts match your filters." />

      <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} searchParams={sp} basePath="/admin/blog" />
    </div>
  );
}
