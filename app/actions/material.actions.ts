"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { createMaterialSchema, updateMaterialSchema } from "@/lib/validations/material";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import type { ActionState } from "./enquiry.actions";

export async function createMaterialAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.MATERIAL_CREATE);
  const parsed = createMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const material = await MaterialRepository.create(parsed.data);
    revalidatePath("/admin/materials");
    revalidatePath("/products");
    return { ok: true, data: { id: material.id } };
  } catch (err) {
    console.error("createMaterialAction failed:", err);
    return { ok: false, error: "Could not create material." };
  }
}

export async function updateMaterialAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.MATERIAL_UPDATE);
  const parsed = updateMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const material = await MaterialRepository.update(parsed.data);
    revalidatePath("/admin/materials");
    revalidatePath("/products");
    revalidatePath(`/products/${material.slug}`);
    return { ok: true, data: { id: material.id } };
  } catch (err) {
    console.error("updateMaterialAction failed:", err);
    return { ok: false, error: "Could not update material." };
  }
}

export async function deleteMaterialAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.MATERIAL_DELETE);
  try {
    await MaterialRepository.delete(id);
    revalidatePath("/admin/materials");
    revalidatePath("/products");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteMaterialAction failed:", err);
    return { ok: false, error: "Could not delete material. It may still have products attached." };
  }
}
