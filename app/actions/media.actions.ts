"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { signUpload, deleteFromCloudinary } from "@/lib/cloudinary";
import { confirmUploadSchema, updateAssetAltSchema } from "@/lib/validations/media";
import { MediaRepository } from "@/lib/repositories/media.repository";
import type { ActionState } from "./enquiry.actions";

/**
 * Step 1 of the upload flow: the browser asks us for a signature before it's
 * allowed to POST bytes straight to Cloudinary. Keeps the upload off our
 * server (fast, no body-size limits to worry about) while still gating who
 * can upload and into which folder.
 */
export async function requestUploadSignatureAction(): Promise<
  ActionState<ReturnType<typeof signUpload>>
> {
  try {
    await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  } catch {
    return { ok: false, error: "You don't have permission to upload media." };
  }
  const signed = signUpload({});
  return { ok: true, data: signed };
}

/**
 * Step 2: after Cloudinary confirms the upload directly to the browser, the
 * client sends us the resulting metadata (public_id, url, dimensions...) so
 * we can persist an Asset row.
 */
export async function confirmUploadAction(input: unknown): Promise<ActionState<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  const parsed = confirmUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid upload payload", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const asset = await MediaRepository.create(parsed.data, session.user.id);
    revalidatePath("/admin/media");
    return { ok: true, data: { id: asset.id } };
  } catch (err) {
    console.error("confirmUploadAction failed:", err);
    return { ok: false, error: "Upload succeeded but saving the asset record failed." };
  }
}

export async function updateAssetAltAction(input: unknown): Promise<ActionState> {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  const parsed = updateAssetAltSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    await MediaRepository.updateAlt(parsed.data);
    revalidatePath("/admin/media");
    return { ok: true, data: null };
  } catch (err) {
    console.error("updateAssetAltAction failed:", err);
    return { ok: false, error: "Could not save alt text." };
  }
}

export async function deleteAssetAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.MEDIA_MANAGE);
  try {
    const asset = await MediaRepository.findById(id);
    if (!asset) return { ok: false, error: "Asset not found." };

    await deleteFromCloudinary(asset.publicId, asset.resourceType.toLowerCase() as "image" | "video" | "raw");
    await MediaRepository.delete(id);
    revalidatePath("/admin/media");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteAssetAction failed:", err);
    return { ok: false, error: "Could not delete asset." };
  }
}
