import { prisma } from "@/lib/prisma";

export class CityRepository {
  static async findAll() {
    return prisma.city.findMany({ orderBy: [{ region: "asc" }, { order: "asc" }] });
  }

  static async findBySlug(slug: string) {
    return prisma.city.findUnique({ where: { slug } });
  }

  /** For pickers: a flat, cheap list. */
  static async listForPicker() {
    return prisma.city.findMany({ select: { id: true, slug: true, name: true }, orderBy: { order: "asc" } });
  }
}
