import { prisma } from "@/lib/prisma";

export class BranchRepository {
  static async findAll() {
    return prisma.branch.findMany({ orderBy: [{ isHeadOffice: "desc" }, { order: "asc" }] });
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
