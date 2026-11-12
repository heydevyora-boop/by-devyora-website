import { prisma } from "@/lib/prisma";

export class UserRepository {
  static async listForPicker() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
  }
}
