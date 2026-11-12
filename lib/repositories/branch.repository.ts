import { prisma } from "@/lib/prisma";
import type { CreateBranchInput, UpdateBranchInput } from "@/lib/validations/branch";

export class BranchRepository {
  static async findAll() {
    return prisma.branch.findMany({ orderBy: [{ isHeadOffice: "desc" }, { order: "asc" }] });
  }

  static async findById(id: string) {
    return prisma.branch.findUnique({ where: { id } });
  }

  static async create(data: CreateBranchInput) {
    return prisma.branch.create({ data });
  }

  static async update(data: UpdateBranchInput) {
    const { id, ...rest } = data;
    return prisma.branch.update({ where: { id }, data: rest });
  }

  static async delete(id: string) {
    return prisma.branch.delete({ where: { id } });
  }
}

export class ManufacturingRepository {
  static async findSteps() {
    return prisma.manufacturingStep.findMany({ orderBy: { order: "asc" } });
  }

  static async findStats() {
    return prisma.facilityStat.findMany({ orderBy: { order: "asc" } });
  }

  static async findCertifications() {
    return prisma.certification.findMany({ orderBy: { order: "asc" } });
  }
}
