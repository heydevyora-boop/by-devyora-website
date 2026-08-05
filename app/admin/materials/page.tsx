import Link from "next/link";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchInput } from "@/components/admin/search-input";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteMaterialAction } from "@/app/actions/material.actions";
import type { ListSearchParams } from "@/lib/list-params";

type MaterialRow = Awaited<ReturnType<typeof MaterialRepository.findAll>>[number];

export default async function AdminMaterialsPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.toLowerCase() : "";

  const all = await MaterialRepository.findAll();
  const rows = q
    ? all.filter((m) => m.name.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q))
    : all;

  const columns: Column<MaterialRow>[] = [
    { header: "#", cell: (m) => String(m.num).padStart(3, "0"), width: "60px" },
    {
      header: "Name",
      cell: (m) => (
        <Link href={`/admin/materials/${m.id}`} style={{ color: "#121110" }}>
          <div>{m.name}</div>
          <div style={{ fontSize: 11, color: "#6B6862" }}>{m.tagline}</div>
        </Link>
      ),
    },
    { header: "Products", cell: (m) => m._count?.products ?? 0, align: "center" },
    { header: "Status", cell: (m) => <StatusBadge value={m.published ? "PUBLISHED" : "DRAFT"} /> },
    {
      header: "",
      align: "right",
      cell: (m) => (
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <Link href={`/admin/materials/${m.id}`} style={{ fontSize: 12, color: "#8C6A45" }}>Edit</Link>
          <DeleteButton id={m.id} action={deleteMaterialAction} confirmMessage={`Delete "${m.name}"? Products under this material must be reassigned first.`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Materials</h1>
        <Link
          href="/admin/materials/new"
          style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          + New material
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <SearchInput placeholder="Search materials…" />
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(m) => m.id} emptyState="No materials match your search." />
    </div>
  );
}
