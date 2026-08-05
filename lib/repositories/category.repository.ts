import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category";

export class CategoryRepository {
  static async findAll() {
    return prisma.category.findMany({
      include: { parent: true, _count: { select: { products: true, children: true } } },
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
    });
  }

  /** Flat list for <select> pickers. */
  static async listForPicker() {
    return prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { order: "asc" },
    });
  }

  static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });
  }

  /** Public-facing: category + its published products (with material info) + subcategories. */
  static async findBySlugWithProducts(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { orderBy: { order: "asc" } },
        products: {
          where: { status: "PUBLISHED" },
          include: { material: { select: { name: true, slug: true } }, images: { take: 1, orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  static async create(data: CreateCategoryInput) {
    return prisma.category.create({ data });
  }

  static async update(data: UpdateCategoryInput) {
    const { id, ...rest } = data;
    return prisma.category.update({ where: { id }, data: rest });
  }

  static async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}
