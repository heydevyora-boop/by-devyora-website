import { prisma } from "@/lib/prisma";
import type {
  CreateDownloadFileInput,
  UpdateDownloadFileInput,
} from "@/lib/validations/download";
import type { DownloadCategory } from "@prisma/client";

export class DownloadRepository {
  static async findAll(opts?: { category?: DownloadCategory; publishedOnly?: boolean }) {
    return prisma.downloadFile.findMany({
      where: {
        published: opts?.publishedOnly ? true : undefined,
        category: opts?.category,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  static async findById(id: string) {
    return prisma.downloadFile.findUnique({ where: { id } });
  }

  static async findByProduct(productId: string) {
    return prisma.downloadFile.findMany({ where: { productId }, orderBy: { name: "asc" } });
  }

  static async create(data: CreateDownloadFileInput) {
    return prisma.downloadFile.create({ data });
  }

  static async update(data: UpdateDownloadFileInput) {
    const { id, ...rest } = data;
    return prisma.downloadFile.update({ where: { id }, data: rest });
  }

  static async delete(id: string) {
    return prisma.downloadFile.delete({ where: { id } });
  }

  static async search(query: string, limit = 10) {
    return prisma.downloadFile.findMany({
      where: { published: true, name: { contains: query, mode: "insensitive" } },
      take: limit,
    });
  }
}
