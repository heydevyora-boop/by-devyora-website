import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteDownloadFileAction } from "@/app/actions/download.actions";
import { FilterSelect } from "@/components/admin/filter-select";
import type { ListSearchParams } from "@/lib/list-params";

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminDownloadsPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;

  const files = await prisma.downloadFile.findMany({
    where: category ? { category: category as never } : undefined,
    include: { product: { select: { name: true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  type Row = (typeof files)[number];
  const columns: Column<Row>[] = [
    { header: "Name", cell: (f) => f.name },
    { header: "Category", cell: (f) => f.category },
    { header: "Scope", cell: (f) => f.product?.name ?? "Site-wide" },
    { header: "Size", cell: (f) => formatSize(f.fileSize) },
    { header: "Published", cell: (f) => (f.published ? "Yes" : "No") },
    {
      header: "",
      align: "right",
      cell: (f) => (
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <Link href={`/admin/downloads/${f.id}`} style={{ fontSize: 12, color: "#8C6A45" }}>Edit</Link>
          <DeleteButton id={f.id} action={deleteDownloadFileAction} confirmMessage={`Delete "${f.name}"?`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Downloads</h1>
        <Link
          href="/admin/downloads/new"
          style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          + New download
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <FilterSelect
          paramKey="category"
          placeholder="All categories"
          options={[
            { label: "Catalogue", value: "CATALOGUE" },
            { label: "Technical", value: "TECHNICAL" },
            { label: "Brochure", value: "BROCHURE" },
            { label: "Installation", value: "INSTALLATION" },
          ]}
        />
      </div>

      <DataTable columns={columns} rows={files} rowKey={(f) => f.id} emptyState="No downloads yet." />
    </div>
  );
}
