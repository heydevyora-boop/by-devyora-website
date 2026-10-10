"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { createBranchSchema, updateBranchSchema } from "@/lib/validations/branch";
import { BranchRepository } from "@/lib/repositories/branch.repository";
import type { ActionState } from "./enquiry.actions";

export async function createBranchAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.BRANCH_MANAGE);
  const parsed = createBranchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const branch = await BranchRepository.create(parsed.data);
    revalidatePath("/admin/branches");
    revalidatePath("/contact");
    return { ok: true, data: { id: branch.id } };
  } catch (err) {
    console.error("createBranchAction failed:", err);
    return { ok: false, error: "Could not create branch." };
  }
}

export async function updateBranchAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.BRANCH_MANAGE);
  const parsed = updateBranchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const branch = await BranchRepository.update(parsed.data);
    revalidatePath("/admin/branches");
    revalidatePath("/contact");
    return { ok: true, data: { id: branch.id } };
  } catch (err) {
    console.error("updateBranchAction failed:", err);
    return { ok: false, error: "Could not update branch." };
  }
}

export async function deleteBranchAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.BRANCH_MANAGE);
  try {
    await BranchRepository.delete(id);
    revalidatePath("/admin/branches");
    revalidatePath("/contact");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteBranchAction failed:", err);
    return { ok: false, error: "Could not delete branch." };
  }
}
