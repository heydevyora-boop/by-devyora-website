import { prisma } from "@/lib/prisma";
import type { CreateProductInput, UpdateProductInput, ProductListQuery } from "@/lib/validations/product";
import type { Prisma } from "@prisma/client";

const productWithRelations = {
  material: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  specifications: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { order: "asc" as const } },
  images: { orderBy: { order: "asc" as const } },
  downloads: true,
} satisfies Prisma.ProductInclude;

export type ProductListItem = Prisma.ProductGetPayload<{ include: typeof productWithRelations }>;

export class ProductRepository {
  /**
   * Paginated, searchable, filterable list — backs the admin Products data table.
   * Returns items + total count so the page can render pagination controls.
   */
  static async findPaginated(query: ProductListQuery) {
    const where: Prisma.ProductWhereInput = {
      status: query.status,
      materialId: query.materialId,
      categoryId: query.categoryId,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { sku: { contains: query.q, mode: "insensitive" } },
              { shortDescription: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productWithRelations,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      prisma.product.count({ where }),
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
    return prisma.product.findUnique({ where: { id }, include: productWithRelations });
  }

  /** Lightweight — just slugs, for generateStaticParams (Module 12: SSG). */
  static async listPublishedSlugs() {
    return prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  }

  static async findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug }, include: productWithRelations });
  }

  /** Same category first, falling back to same material, excluding self. */
  static async findRelated(product: { id: string; categoryId: string | null; materialId: string }, limit = 4) {
    const byCategory = product.categoryId
      ? await prisma.product.findMany({
          where: { status: "PUBLISHED", categoryId: product.categoryId, NOT: { id: product.id } },
          include: productWithRelations,
          take: limit,
        })
      : [];
    if (byCategory.length >= limit) return byCategory;

    const byMaterial = await prisma.product.findMany({
      where: { status: "PUBLISHED", materialId: product.materialId, NOT: { id: { in: [product.id, ...byCategory.map((p) => p.id)] } } },
      include: productWithRelations,
      take: limit - byCategory.length,
    });
    return [...byCategory, ...byMaterial];
  }

  static async create(data: CreateProductInput) {
    const { specifications, variants, images, categoryId, ...rest } = data;
    return prisma.product.create({
      data: {
        ...rest,
        categoryId: categoryId ?? undefined,
        specifications: specifications?.length ? { create: specifications } : undefined,
        variants: variants?.length
          ? { create: variants.map(({ id, ...v }) => v) }
          : undefined,
        images: images?.length ? { create: images } : undefined,
      },
      include: productWithRelations,
    });
  }

  static async update(data: UpdateProductInput) {
    const { id, specifications, variants, images, categoryId, ...rest } = data;
    return prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined ? { categoryId } : {}),
        // Full replace of child collections when provided — simplest correct
        // semantics for a form-driven admin UI (vs. diffing add/remove/update).
        ...(specifications ? { specifications: { deleteMany: {}, create: specifications } } : {}),
        ...(variants
          ? { variants: { deleteMany: {}, create: variants.map(({ id: _vid, ...v }) => v) } }
          : {}),
        ...(images ? { images: { deleteMany: {}, create: images } } : {}),
      },
      include: productWithRelations,
    });
  }

  static async updateStatus(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    return prisma.product.update({ where: { id }, data: { status } });
  }

  static async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  /** Counts grouped by status, for dashboard stat cards. */
  static async countByStatus() {
    const rows = await prisma.product.groupBy({ by: ["status"], _count: true });
    return Object.fromEntries(rows.map((r) => [r.status, r._count])) as Record<string, number>;
  }
}
