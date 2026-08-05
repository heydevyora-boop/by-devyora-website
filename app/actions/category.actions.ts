"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import type { ActionState } from "./enquiry.actions";

export async function createCategoryAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const category = await CategoryRepository.create(parsed.data);
    revalidatePath("/admin/categories");
    return { ok: true, data: { id: category.id } };
  } catch (err) {
    console.error("createCategoryAction failed:", err);
    return { ok: false, error: "Could not create category. Slug may already be in use." };
  }
}

export async function updateCategoryAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const category = await CategoryRepository.update(parsed.data);
    revalidatePath("/admin/categories");
    return { ok: true, data: { id: category.id } };
  } catch (err) {
    console.error("updateCategoryAction failed:", err);
    return { ok: false, error: "Could not update category." };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  try {
    await CategoryRepository.delete(id);
    revalidatePath("/admin/categories");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteCategoryAction failed:", err);
    return { ok: false, error: "Could not delete category. Move or remove its products first." };
  }
}
