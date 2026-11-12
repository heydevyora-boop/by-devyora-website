import { prisma } from "@/lib/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project";
import type { Prisma, ProjectType } from "@prisma/client";

const projectWithRelations = {
  images: { orderBy: { order: "asc" as const } },
  materials: { include: { material: true } },
} satisfies Prisma.ProjectInclude;

export class ProjectRepository {
  static async findAll(opts?: { type?: ProjectType; publishedOnly?: boolean }) {
    return prisma.project.findMany({
      where: {
        published: opts?.publishedOnly ? true : undefined,
        type: opts?.type,
      },
      include: projectWithRelations,
      orderBy: { year: "desc" },
    });
  }

  static async findFeatured(limit = 3) {
    return prisma.project.findMany({
      where: { published: true, featured: true },
      include: projectWithRelations,
      orderBy: { year: "desc" },
      take: limit,
    });
  }

  static async findBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      include: projectWithRelations,
    });
  }

  static async findRelated(currentId: string, type: ProjectType, limit = 2) {
    return prisma.project.findMany({
      where: { published: true, type, NOT: { id: currentId } },
      include: projectWithRelations,
      orderBy: { year: "desc" },
      take: limit,
    });
  }

  static async create(data: CreateProjectInput) {
    const { images, materialIds, ...rest } = data;
    return prisma.project.create({
      data: {
        ...rest,
        images: images?.length ? { create: images } : undefined,
        materials: materialIds?.length
          ? { create: materialIds.map((materialId) => ({ materialId })) }
          : undefined,
      },
      include: projectWithRelations,
    });
  }

  static async update(data: UpdateProjectInput) {
    const { id, images, materialIds, ...rest } = data;
    return prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(images ? { images: { deleteMany: {}, create: images } } : {}),
        ...(materialIds
          ? {
              materials: {
                deleteMany: {},
                create: materialIds.map((materialId) => ({ materialId })),
              },
            }
          : {}),
      },
      include: projectWithRelations,
    });
  }

  static async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }

  static async search(query: string, limit = 10) {
    return prisma.project.findMany({
      where: {
        published: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { year: "desc" },
    });
  }
}
