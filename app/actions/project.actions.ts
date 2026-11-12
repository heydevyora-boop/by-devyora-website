"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project";
import { ProjectRepository } from "@/lib/repositories/project.repository";
import type { ActionState } from "./enquiry.actions";

export async function createProjectAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.PROJECT_CREATE);
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const project = await ProjectRepository.create(parsed.data);
    revalidatePath("/projects");
    return { ok: true, data: { id: project.id } };
  } catch (err) {
    console.error("createProjectAction failed:", err);
    return { ok: false, error: "Could not create project." };
  }
}

export async function updateProjectAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.PROJECT_UPDATE);
  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const project = await ProjectRepository.update(parsed.data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    return { ok: true, data: { id: project.id } };
  } catch (err) {
    console.error("updateProjectAction failed:", err);
    return { ok: false, error: "Could not update project." };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.PROJECT_DELETE);
  try {
    await ProjectRepository.delete(id);
    revalidatePath("/projects");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteProjectAction failed:", err);
    return { ok: false, error: "Could not delete project." };
  }
}
