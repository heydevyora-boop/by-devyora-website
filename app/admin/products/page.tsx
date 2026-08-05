import Link from "next/link";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { productListQuerySchema } from "@/lib/validations/product";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProductAction } from "@/app/actions/product.actions";
import type { ListSearchParams } from "@/lib/list-params";
import type { ProductListItem } from "@/lib/repositories/product.repository";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const sp = await searchParams;
  const query = productListQuerySchema.parse({
    q: sp.q,
    status: sp.status,
    materialId: sp.materialId,
    categoryId: sp.categoryId,
    page: sp.page,
    perPage: sp.perPage,
  });

  const [{ items, total, page, totalPages, perPage }, materials, categories] = await Promise.all([
    ProductRepository.findPaginated(query),
    MaterialRepository.listForPicker(),
    CategoryRepository.listForPicker(),
  ]);

  const columns: Column<ProductListItem>[] = [
    {
      header: "Product",
      cell: (p) => (
        <Link href={`/admin/products/${p.id}`} style={{ color: "#121110" }}>
          <div style={{ fontWeight: 400 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: "#6B6862" }}>{p.sku}</div>
        </Link>
      ),
    },
    { header: "Material", cell: (p) => p.material.name },
    { header: "Category", cell: (p) => p.category?.name ?? "—" },
    { header: "Variants", cell: (p) => p.variants.length, align: "center" },
    { header: "Status", cell: (p) => <StatusBadge value={p.status} /> },
    {
      header: "",
      align: "right",
      cell: (p) => (
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <Link href={`/admin/products/${p.id}`} style={{ fontSize: 12, color: "#8C6A45" }}>Edit</Link>
          <DeleteButton id={p.id} action={deleteProductAction} confirmMessage={`Delete "${p.name}"? This can't be undone.`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Products</h1>
        <Link
          href="/admin/products/new"
          style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          + New product
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <SearchInput placeholder="Search products…" />
        <FilterSelect
          paramKey="status"
          placeholder="All statuses"
          options={[
            { label: "Draft", value: "DRAFT" },
            { label: "Published", value: "PUBLISHED" },
            { label: "Archived", value: "ARCHIVED" },
          ]}
        />
        <FilterSelect
          paramKey="materialId"
          placeholder="All materials"
          options={materials.map((m) => ({ label: m.name, value: m.id }))}
        />
        <FilterSelect
          paramKey="categoryId"
          placeholder="All categories"
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />
      </div>

      <DataTable columns={columns} rows={items} rowKey={(p) => p.id} emptyState="No products match your filters." />

      <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} searchParams={sp} basePath="/admin/products" />
    </div>
  );
}
