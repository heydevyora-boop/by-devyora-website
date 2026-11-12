import { prisma } from "@/lib/prisma";
import type { ConfirmUploadInput, MediaListQuery, UpdateAssetAltInput } from "@/lib/validations/media";
import type { Prisma } from "@prisma/client";

export class MediaRepository {
  static async findPaginated(query: MediaListQuery) {
    const where: Prisma.AssetWhereInput = {
      resourceType: query.resourceType,
      ...(query.missingAltOnly ? { OR: [{ alt: null }, { alt: "" }] } : {}),
      ...(query.q
        ? { OR: [{ name: { contains: query.q, mode: "insensitive" } }, { alt: { contains: query.q, mode: "insensitive" } }] }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      prisma.asset.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      perPage: query.perPage,
      totalPages: Math.max(1, Math.ceil(total / query.perPage)),
    };
  }

  static async findById(id: string) {
    return prisma.asset.findUnique({ where: { id } });
  }

  static async create(data: ConfirmUploadInput, uploadedById: string | null) {
    return prisma.asset.create({ data: { ...data, uploadedById } });
  }

  static async updateAlt(data: UpdateAssetAltInput) {
    return prisma.asset.update({ where: { id: data.id }, data: { alt: data.alt } });
  }

  static async delete(id: string) {
    return prisma.asset.delete({ where: { id } });
  }

  /** For dashboard/library stat chips: how many images are missing alt text. */
  static async countMissingAlt() {
    return prisma.asset.count({ where: { resourceType: "IMAGE", OR: [{ alt: null }, { alt: "" }] } });
  }
}
