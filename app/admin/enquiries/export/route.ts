import { NextRequest } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { EnquiryRepository } from "@/lib/repositories/enquiry.repository";
import { enquiryListQuerySchema } from "@/lib/validations/enquiry";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const COLUMNS = [
  "id",
  "createdAt",
  "type",
  "status",
  "firstName",
  "lastName",
  "email",
  "phone",
  "company",
  "source",
  "productsInterested",
  "assignedTo",
  "message",
] as const;

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.ENQUIRY_VIEW);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = enquiryListQuerySchema
    .omit({ page: true, perPage: true })
    .parse({
      q: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      assignedToId: searchParams.get("assignedToId") ?? undefined,
    });

  const enquiries = await EnquiryRepository.findAllFiltered(query);

  const rows = enquiries.map((e) =>
    [
      e.id,
      e.createdAt.toISOString(),
      e.type,
      e.status,
      e.firstName,
      e.lastName,
      e.email,
      e.phone,
      e.company ?? "",
      e.source,
      e.productsInterested.join("; "),
      e.assignedTo?.name ?? "",
      e.message.replace(/\r?\n/g, " "),
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = [COLUMNS.join(","), ...rows].join("\n");
  const filename = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
