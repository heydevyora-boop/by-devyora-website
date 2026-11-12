import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import type { CreateMaterialInput, UpdateMaterialInput } from "@/lib/validations/material";
import type { Prisma } from "@prisma/client";

const materialWithRelations = {
  specs: { orderBy: { order: "asc" as const } },
  applications: { orderBy: { order: "asc" as const } },
  images: { orderBy: { order: "asc" as const } },
  products: { where: { status: "PUBLISHED" as const }, take: 12, orderBy: { order: "asc" as const } },
  _count: { select: { products: true } },
} satisfies Prisma.MaterialInclude;

export class MaterialRepository {
  static async findAll(opts?: { publishedOnly?: boolean }) {
    return prisma.material.findMany({
      where: opts?.publishedOnly ? { published: true } : undefined,
      include: materialWithRelations,
      orderBy: { num: "asc" },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.material.findUnique({
      where: { slug },
      include: materialWithRelations,
    });
  }

  /** Number of published materials — used for the "NNN / TOTAL" catalogue label. */
  static async countPublished() {
    return prisma.material.count({ where: { published: true } });
  }

  static async findById(id: string) {
    return prisma.material.findUnique({
      where: { id },
      include: materialWithRelations,
    });
  }

  /** Mirrors the site's "Related systems" behaviour: next N materials by catalogue order, wrapping around. */
  static async findRelated(currentNum: number, limit = 3) {
    const all = await prisma.material.findMany({
      where: { published: true },
      orderBy: { num: "asc" },
      select: { id: true, num: true },
    });
    if (all.length === 0) return [];
    const startIdx = all.findIndex((m) => m.num === currentNum);
    const related = Array.from({ length: Math.min(limit, all.length - 1) }, (_, i) => {
      const idx = (startIdx + i + 1) % all.length;
      return all[idx].id;
    });
    return prisma.material.findMany({
      where: { id: { in: related } },
      include: materialWithRelations,
    });
  }

  static async create(data: CreateMaterialInput) {
    const { specs, applications, images, ...rest } = data;
    return prisma.material.create({
      data: {
        ...rest,
        specs: specs?.length ? { create: specs } : undefined,
        applications: applications?.length
          ? { create: applications.map((a) => ({ ...a, slug: slugify(a.label, { lower: true, strict: true }) })) }
          : undefined,
        images: images?.length ? { create: images } : undefined,
      },
      include: materialWithRelations,
    });
  }

  static async update(data: UpdateMaterialInput) {
    const { id, specs, applications, images, ...rest } = data;
    return prisma.material.update({
      where: { id },
      data: {
        ...rest,
        ...(specs ? { specs: { deleteMany: {}, create: specs } } : {}),
        ...(applications
          ? {
              applications: {
                deleteMany: {},
                create: applications.map((a) => ({ ...a, slug: slugify(a.label, { lower: true, strict: true }) })),
              },
            }
          : {}),
        ...(images ? { images: { deleteMany: {}, create: images } } : {}),
      },
      include: materialWithRelations,
    });
  }

  static async delete(id: string) {
    return prisma.material.delete({ where: { id } });
  }

  static async search(query: string, limit = 10) {
    return prisma.material.findMany({
      where: {
        published: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { num: "asc" },
    });
  }

  /** Lightweight list for <select> pickers (Product form's "Material" field, etc). */
  static async listForPicker() {
    return prisma.material.findMany({
      where: { published: true },
      select: { id: true, name: true },
      orderBy: { num: "asc" },
    });
  }

  /**
   * Every published (material slug, application slug) pair — the full set of
   * valid first two segments for /materials/[material]/[application]/[city].
   * Used by generateStaticParams to build the location-page matrix.
   */
  static async listMaterialApplicationSlugs() {
    const materials = await prisma.material.findMany({
      where: { published: true },
      select: { slug: true, applications: { select: { slug: true } } },
    });
    return materials.flatMap((m) => m.applications.map((a) => ({ materialSlug: m.slug, applicationSlug: a.slug })));
  }

  /** Resolves a material + one of its applications by slug, for a location landing page. */
  static async findForLocationPage(materialSlug: string, applicationSlug: string) {
    const material = await prisma.material.findUnique({
      where: { slug: materialSlug },
      include: materialWithRelations,
    });
    if (!material || !material.published) return null;
    const application = material.applications.find((a) => a.slug === applicationSlug);
    if (!application) return null;
    return { material, application };
  }
}
