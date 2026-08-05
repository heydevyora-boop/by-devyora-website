import Link from "next/link";
import { BlogCategoryRepository } from "@/lib/repositories/blog.repository";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBlogCategoryAction } from "@/app/actions/blog.actions";
import { BlogCategoryForm } from "@/components/admin/blog-category-form";

type CategoryRow = Awaited<ReturnType<typeof BlogCategoryRepository.findAll>>[number];

export default async function BlogCategoriesPage() {
  const categories = await BlogCategoryRepository.findAll();

  const columns: Column<CategoryRow>[] = [
    { header: "Name", cell: (c) => c.name },
    { header: "Slug", cell: (c) => <span style={{ color: "#6B6862" }}>{c.slug}</span> },
    { header: "Posts", cell: (c) => c._count.posts, align: "center" },
    {
      header: "",
      align: "right",
      cell: (c) => <DeleteButton id={c.id} action={deleteBlogCategoryAction} confirmMessage={`Delete "${c.name}"?`} />,
    },
  ];

  return (
    <div>
      <Link href="/admin/blog" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6862" }}>
        ← Blog
      </Link>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, margin: "16px 0 24px" }}>Blog categories</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
        <DataTable columns={columns} rows={categories} rowKey={(c) => c.id} emptyState="No categories yet." />
        <BlogCategoryForm />
      </div>
    </div>
  );
}
