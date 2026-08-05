import { prisma } from "@/lib/prisma";
import type {
  CreateEnquiryInput,
  AssignEnquiryInput,
  AddFollowUpNoteInput,
  EnquiryListQuery,
  UpdateEnquiryStatusInput,
} from "@/lib/validations/enquiry";
import type { Prisma } from "@prisma/client";

const enquiryWithRelations = {
  assignedTo: { select: { id: true, name: true, email: true } },
  notes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.EnquiryInclude;

export class EnquiryRepository {
  /** Paginated, searchable, filterable list — backs the admin CRM table. */
  static async findPaginated(query: EnquiryListQuery) {
    const where: Prisma.EnquiryWhereInput = {
      status: query.status,
      type: query.type,
      ...(query.assignedToId === "unassigned"
        ? { assignedToId: null }
        : query.assignedToId
          ? { assignedToId: query.assignedToId }
          : {}),
      ...(query.q
        ? {
            OR: [
              { firstName: { contains: query.q, mode: "insensitive" } },
              { lastName: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
              { company: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        include: enquiryWithRelations,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      prisma.enquiry.count({ where }),
    ]);

    return { items, total, page: query.page, perPage: query.perPage, totalPages: Math.max(1, Math.ceil(total / query.perPage)) };
  }

  /** Same filters as findPaginated but unpaginated — used by CSV export. */
  static async findAllFiltered(query: Omit<EnquiryListQuery, "page" | "perPage">) {
    const where: Prisma.EnquiryWhereInput = {
      status: query.status,
      type: query.type,
      ...(query.assignedToId === "unassigned"
        ? { assignedToId: null }
        : query.assignedToId
          ? { assignedToId: query.assignedToId }
          : {}),
      ...(query.q
        ? {
            OR: [
              { firstName: { contains: query.q, mode: "insensitive" } },
              { lastName: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
              { company: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return prisma.enquiry.findMany({ where, include: enquiryWithRelations, orderBy: { createdAt: "desc" } });
  }

  static async findAll(opts?: { status?: Prisma.EnquiryWhereInput["status"] }) {
    return prisma.enquiry.findMany({ where: { status: opts?.status }, orderBy: { createdAt: "desc" } });
  }

  static async findById(id: string) {
    return prisma.enquiry.findUnique({ where: { id }, include: enquiryWithRelations });
  }

  static async create(data: CreateEnquiryInput) {
    return prisma.enquiry.create({ data });
  }

  static async updateStatus(data: UpdateEnquiryStatusInput) {
    return prisma.enquiry.update({ where: { id: data.id }, data: { status: data.status } });
  }

  static async assign(data: AssignEnquiryInput) {
    return prisma.enquiry.update({ where: { id: data.id }, data: { assignedToId: data.assignedToId } });
  }

  static async addNote(data: AddFollowUpNoteInput, authorId: string | null) {
    return prisma.enquiryNote.create({
      data: { enquiryId: data.enquiryId, note: data.note, followUpDate: data.followUpDate, authorId },
    });
  }

  /** Upcoming/overdue follow-ups across all enquiries — for a CRM "tasks" widget. */
  static async findUpcomingFollowUps(limit = 10) {
    return prisma.enquiryNote.findMany({
      where: { followUpDate: { not: null } },
      include: { enquiry: { select: { id: true, firstName: true, lastName: true, company: true } } },
      orderBy: { followUpDate: "asc" },
      take: limit,
    });
  }

  static async delete(id: string) {
    return prisma.enquiry.delete({ where: { id } });
  }

  static async countByStatus() {
    const rows = await prisma.enquiry.groupBy({ by: ["status"], _count: true });
    return Object.fromEntries(rows.map((r) => [r.status, r._count])) as Record<string, number>;
  }
}
