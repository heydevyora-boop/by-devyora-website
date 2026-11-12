import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { EnquiryRepository } from "@/lib/repositories/enquiry.repository";
import { UserRepository } from "@/lib/repositories/user.repository";
import { StatusBadge } from "@/components/admin/status-badge";
import { EnquiryCrmPanel } from "@/components/admin/enquiry-crm-panel";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission(PERMISSIONS.ENQUIRY_VIEW);
  const { id } = await params;

  const [enquiry, users] = await Promise.all([EnquiryRepository.findById(id), UserRepository.listForPicker()]);
  if (!enquiry) notFound();

  return (
    <div>
      <Link href="/admin/enquiries" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B6862" }}>
        ← All enquiries
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 0 32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 8 }}>
            {enquiry.firstName} {enquiry.lastName}
          </h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <StatusBadge value={enquiry.status} />
            <span style={{ fontSize: 12, color: "#6B6862" }}>{enquiry.type} · received {enquiry.createdAt.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 40 }}>
        <div>
          <div style={{ border: "1px solid #E4E1DC", padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8C6A45", marginBottom: 14 }}>
              Contact details
            </div>
            {[
              ["Email", enquiry.email],
              ["Phone", enquiry.phone],
              ["Company", enquiry.company || "—"],
              ["Source", enquiry.source],
              ["Products", enquiry.productsInterested.join(", ") || "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 0", borderBottom: "1px solid #E4E1DC", fontSize: 13 }}>
                <span style={{ fontSize: 10, color: "#6B6862", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid #E4E1DC", padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8C6A45", marginBottom: 10 }}>
              Message
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{enquiry.message}</p>
          </div>
        </div>

        <EnquiryCrmPanel
          enquiryId={enquiry.id}
          currentStatus={enquiry.status}
          currentAssigneeId={enquiry.assignedToId}
          users={users}
          notes={enquiry.notes.map((n) => ({
            id: n.id,
            note: n.note,
            followUpDate: n.followUpDate ? n.followUpDate.toISOString() : null,
            createdAt: n.createdAt.toISOString(),
            author: n.author ? { name: n.author.name } : null,
          }))}
        />
      </div>
    </div>
  );
}
