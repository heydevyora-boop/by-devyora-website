import Link from "next/link";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCategoryAction } from "@/app/actions/category.actions";

type CategoryRow = Awaited<ReturnType<typeof CategoryRepository.findAll>>[number];

export default async function AdminCategoriesPage() {
  const categories = await CategoryRepository.findAll();

  const columns: Column<CategoryRow>[] = [
    {
      header: "Name",
      cell: (c) => (
        <Link href={`/admin/categories/${c.id}`} style={{ color: "#121110" }}>
          {c.parentId && <span style={{ color: "#A6A29B" }}>— </span>}
          {c.name}
        </Link>
      ),
    },
    { header: "Slug", cell: (c) => <span style={{ color: "#6B6862" }}>{c.slug}</span> },
    { header: "Parent", cell: (c) => c.parent?.name ?? "—" },
    { header: "Products", cell: (c) => c._count.products, align: "center" },
    { header: "Subcategories", cell: (c) => c._count.children, align: "center" },
    {
      header: "",
      align: "right",
      cell: (c) => (
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <Link href={`/admin/categories/${c.id}`} style={{ fontSize: 12, color: "#8C6A45" }}>Edit</Link>
          <DeleteButton id={c.id} action={deleteCategoryAction} confirmMessage={`Delete "${c.name}"?`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Categories</h1>
        <Link
          href="/admin/categories/new"
          style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          + New category
        </Link>
      </div>

      <DataTable columns={columns} rows={categories} rowKey={(c) => c.id} emptyState="No categories yet." />
    </div>
  );
}
