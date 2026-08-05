"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { createProductSchema, updateProductSchema } from "@/lib/validations/product";
import { ProductRepository } from "@/lib/repositories/product.repository";
import type { ActionState } from "./enquiry.actions";

export async function createProductAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.PRODUCT_CREATE);
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const product = await ProductRepository.create(parsed.data);
    revalidatePath("/admin/products");
    return { ok: true, data: { id: product.id } };
  } catch (err) {
    console.error("createProductAction failed:", err);
    return { ok: false, error: "Could not create product. SKU or slug may already be in use." };
  }
}

export async function updateProductAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.PRODUCT_UPDATE);
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const product = await ProductRepository.update(parsed.data);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${product.id}`);
    return { ok: true, data: { id: product.id } };
  } catch (err) {
    console.error("updateProductAction failed:", err);
    return { ok: false, error: "Could not update product." };
  }
}

export async function updateProductStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.PRODUCT_PUBLISH);
  try {
    await ProductRepository.updateStatus(id, status);
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch (err) {
    console.error("updateProductStatusAction failed:", err);
    return { ok: false, error: "Could not update status." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.PRODUCT_DELETE);
  try {
    await ProductRepository.delete(id);
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteProductAction failed:", err);
    return { ok: false, error: "Could not delete product." };
  }
}
