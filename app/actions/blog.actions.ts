"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
  createTagSchema,
} from "@/lib/validations/blog";
import { BlogRepository, BlogCategoryRepository, TagRepository } from "@/lib/repositories/blog.repository";
import type { ActionState } from "./enquiry.actions";

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function createBlogPostAction(input: unknown): Promise<ActionState<{ id: string }>> {
  const session = await requirePermission(PERMISSIONS.BLOG_CREATE);
  const parsed = createBlogPostSchema.safeParse({
    ...(input as Record<string, unknown>),
    authorId: (input as { authorId?: string })?.authorId ?? session.user.id,
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const post = await BlogRepository.create(parsed.data);
    revalidatePath("/journal");
    return { ok: true, data: { id: post.id } };
  } catch (err) {
    console.error("createBlogPostAction failed:", err);
    return { ok: false, error: "Could not create post. Slug may already be in use." };
  }
}

export async function updateBlogPostAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.BLOG_UPDATE);
  const parsed = updateBlogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const post = await BlogRepository.update(parsed.data);
    revalidatePath("/journal");
    revalidatePath(`/journal/${post.slug}`);
    return { ok: true, data: { id: post.id } };
  } catch (err) {
    console.error("updateBlogPostAction failed:", err);
    return { ok: false, error: "Could not update post." };
  }
}

export async function publishBlogPostAction(id: string, published: boolean): Promise<ActionState> {
  await requirePermission(PERMISSIONS.BLOG_PUBLISH);
  try {
    await BlogRepository.update({ id, published, publishedAt: published ? new Date() : undefined });
    revalidatePath("/journal");
    return { ok: true, data: null };
  } catch (err) {
    console.error("publishBlogPostAction failed:", err);
    return { ok: false, error: "Could not update publish status." };
  }
}

export async function deleteBlogPostAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.BLOG_DELETE);
  try {
    await BlogRepository.delete(id);
    revalidatePath("/journal");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteBlogPostAction failed:", err);
    return { ok: false, error: "Could not delete post." };
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createBlogCategoryAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.BLOG_UPDATE);
  const parsed = createBlogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const category = await BlogCategoryRepository.create(parsed.data);
    revalidatePath("/admin/blog/categories");
    return { ok: true, data: { id: category.id } };
  } catch (err) {
    console.error("createBlogCategoryAction failed:", err);
    return { ok: false, error: "Could not create category. Slug may already be in use." };
  }
}

export async function updateBlogCategoryAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.BLOG_UPDATE);
  const parsed = updateBlogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const category = await BlogCategoryRepository.update(parsed.data);
    revalidatePath("/admin/blog/categories");
    return { ok: true, data: { id: category.id } };
  } catch (err) {
    console.error("updateBlogCategoryAction failed:", err);
    return { ok: false, error: "Could not update category." };
  }
}

export async function deleteBlogCategoryAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.BLOG_UPDATE);
  try {
    await BlogCategoryRepository.delete(id);
    revalidatePath("/admin/blog/categories");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteBlogCategoryAction failed:", err);
    return { ok: false, error: "Could not delete category — move or remove its posts first." };
  }
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function createTagAction(input: unknown): Promise<ActionState<{ id: string }>> {
  await requirePermission(PERMISSIONS.BLOG_UPDATE);
  const parsed = createTagSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    const tag = await TagRepository.create(parsed.data);
    revalidatePath("/admin/blog/tags");
    return { ok: true, data: { id: tag.id } };
  } catch (err) {
    console.error("createTagAction failed:", err);
    return { ok: false, error: "Could not create tag. Slug may already be in use." };
  }
}

export async function deleteTagAction(id: string): Promise<ActionState> {
  await requirePermission(PERMISSIONS.BLOG_UPDATE);
  try {
    await TagRepository.delete(id);
    revalidatePath("/admin/blog/tags");
    return { ok: true, data: null };
  } catch (err) {
    console.error("deleteTagAction failed:", err);
    return { ok: false, error: "Could not delete tag." };
  }
}
