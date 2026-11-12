import Link from "next/link";
import { EnquiryRepository } from "@/lib/repositories/enquiry.repository";
import { UserRepository } from "@/lib/repositories/user.repository";
import { enquiryListQuerySchema } from "@/lib/validations/enquiry";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ListSearchParams } from "@/lib/list-params";
import { buildQueryString } from "@/lib/list-params";
import type { Prisma } from "@prisma/client";

type EnquiryRow = Prisma.EnquiryGetPayload<{
  include: { assignedTo: { select: { id: true; name: true; email: true } }; notes: true };
}>;

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const sp = await searchParams;
  const query = enquiryListQuerySchema.parse({
    q: sp.q,
    status: sp.status,
    type: sp.type,
    assignedToId: sp.assignedToId,
    page: sp.page,
    perPage: sp.perPage,
  });

  const [{ items, total, page, totalPages, perPage }, users, statusCounts] = await Promise.all([
    EnquiryRepository.findPaginated(query),
    UserRepository.listForPicker(),
    EnquiryRepository.countByStatus(),
  ]);

  const exportHref = `/admin/enquiries/export${buildQueryString(sp, {})}`;

  const columns: Column<EnquiryRow>[] = [
    {
      header: "Lead",
      cell: (e) => (
        <Link href={`/admin/enquiries/${e.id}`} style={{ color: "#121110" }}>
          <div>{e.firstName} {e.lastName}</div>
          <div style={{ fontSize: 11, color: "#6B6862" }}>{e.company || e.email}</div>
        </Link>
      ),
    },
    { header: "Type", cell: (e) => e.type },
    { header: "Status", cell: (e) => <StatusBadge value={e.status} /> },
    { header: "Assigned", cell: (e) => e.assignedTo?.name ?? <span style={{ color: "#A6A29B" }}>Unassigned</span> },
    { header: "Follow-ups", cell: (e) => e.notes.length, align: "center" },
    { header: "Received", cell: (e) => e.createdAt.toLocaleDateString() },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Enquiries</h1>
        <a
          href={exportHref}
          style={{ background: "#121110", color: "#FFFFFF", padding: "11px 22px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}
        >
          Export CSV
        </a>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 12, color: "#6B6862" }}>
        {(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"] as const).map((s) => (
          <span key={s}>{s.replace("_", " ")}: <strong style={{ color: "#121110" }}>{statusCounts[s] ?? 0}</strong></span>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <SearchInput placeholder="Search name, email, company…" />
        <FilterSelect
          paramKey="status"
          placeholder="All statuses"
          options={[
            { label: "New", value: "NEW" },
            { label: "Contacted", value: "CONTACTED" },
            { label: "Qualified", value: "QUALIFIED" },
            { label: "Proposal sent", value: "PROPOSAL_SENT" },
            { label: "Won", value: "WON" },
            { label: "Lost", value: "LOST" },
          ]}
        />
        <FilterSelect
          paramKey="type"
          placeholder="All types"
          options={[
            { label: "Architect", value: "ARCHITECT" },
            { label: "Dealer", value: "DEALER" },
            { label: "General", value: "GENERAL" },
          ]}
        />
        <FilterSelect
          paramKey="assignedToId"
          placeholder="All salespeople"
          options={[{ label: "Unassigned", value: "unassigned" }, ...users.map((u) => ({ label: u.name, value: u.id }))]}
        />
      </div>

      <DataTable columns={columns} rows={items} rowKey={(e) => e.id} emptyState="No enquiries match your filters." />

      <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} searchParams={sp} basePath="/admin/enquiries" />
    </div>
  );
}
