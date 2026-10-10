import Link from "next/link";
import { BranchRepository } from "@/lib/repositories/branch.repository";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteBranchAction } from "@/app/actions/branch.actions";

type BranchRow = Awaited<ReturnType<typeof BranchRepository.findAll>>[number];

export default async function AdminBranchesPage() {
  const branches = await BranchRepository.findAll();

  const columns: Column<BranchRow>[] = [
    {
      header: "City",
      cell: (b) => (
        <Link href={`/admin/branches/${b.id}`} style={{ color: "#121110" }}>
          {b.city}
          {b.isHeadOffice && <span style={{ color: "#8C6A45" }}> — Head Office</span>}
        </Link>
      ),
    },
    { header: "Address", cell: (b) => <span style={{ color: "#6B6862" }}>{b.address}</span> },
    { header: "Phone", cell: (b) => b.phone },
    {
      header: "",
      align: "right",
      cell: (b) => (
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
          <Link href={`/admin/branches/${b.id}`} style={{ fontSize: 12, color: "#8C6A45" }}>Edit</Link>
          <DeleteButton id={b.id} action={deleteBranchAction} confirmMessage={`Delete "${b.city}"?`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Branches</h1>
        <Link href="/admin/branches/new" style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>+ New branch</Link>
      </div>
      <p style={{ fontSize: 13, color: "#6B6862", marginBottom: 24, maxWidth: 560 }}>
        These offices and showrooms appear on the public Contact page, in city order with the head office first.
      </p>
      <DataTable columns={columns} rows={branches} rowKey={(b) => b.id} emptyState="No branches yet." />
    </div>
  );
}
