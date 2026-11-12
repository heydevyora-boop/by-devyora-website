import { z } from "zod";

export const createBlogCategorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  name: z.string().min(1).max(60),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial().extend({ id: z.string().cuid() });

export const createTagSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  name: z.string().min(1).max(60),
});

export const createBlogPostSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, kebab-case"),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(400),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  categoryId: z.string().cuid(),
  authorId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).max(15).default([]),
});

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  id: z.string().cuid(),
});

export const blogListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  categorySlug: z.string().optional(),
  tagSlug: z.string().optional(),
  publishedOnly: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type BlogListQuery = z.infer<typeof blogListQuerySchema>;
