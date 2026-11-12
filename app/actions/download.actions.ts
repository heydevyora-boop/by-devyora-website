"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { createDownloadFileSchema, updateDownloadFileSchema } from "@/lib/validations/download";
import { DownloadRepository } from "@/lib/repositories/download.repository";
import type { ActionState } from "./enquiry.actions";

export async function createDownloadFileAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.DOWNLOAD_MANAGE);
  const parsed = createDownloadFileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const file = await DownloadRepository.create(parsed.data);
    revalidatePath("/downloads");
    return { ok: true, data: { id: file.id } };
  } catch (err) {
    console.error("createDownloadFileAction failed:", err);
    return { ok: false, error: "Could not create download." };
  }
}

export async function updateDownloadFileAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.DOWNLOAD_MANAGE);
  const parsed = updateDownloadFileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const file = await DownloadRepository.update(parsed.data);
    revalidatePath("/downloads");
    return { ok: true, data: { id: file.id } };
  } catch (err) {
    console.error("updateDownloadFileAction failed:", err);
    return { ok: false, error: "Could not update download." };
  }
}

export async function deleteDownloadFileAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.DOWNLOAD_MANAGE);
  try {
    await DownloadRepository.delete(id);
    revalidatePath("/downloads");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteDownloadFileAction failed:", err);
    return { ok: false, error: "Could not delete download." };
  }
}
