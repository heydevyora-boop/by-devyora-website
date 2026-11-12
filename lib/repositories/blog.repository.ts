import { prisma } from "@/lib/prisma";
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogListQuery,
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
  CreateTagInput,
} from "@/lib/validations/blog";
import type { Prisma } from "@prisma/client";

const postWithRelations = {
  category: true,
  author: { select: { id: true, name: true, image: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.BlogPostInclude;

export class BlogRepository {
  static async findAll(opts?: { categorySlug?: string; publishedOnly?: boolean }) {
    return prisma.blogPost.findMany({
      where: {
        published: opts?.publishedOnly ? true : undefined,
        category: opts?.categorySlug ? { slug: opts.categorySlug } : undefined,
      },
      include: postWithRelations,
      orderBy: { publishedAt: "desc" },
    });
  }

  /** Paginated + filterable — backs both the admin list and the public /journal page. */
  static async findPaginated(query: BlogListQuery) {
    const where: Prisma.BlogPostWhereInput = {
      published: query.publishedOnly ? true : undefined,
      category: query.categorySlug ? { slug: query.categorySlug } : undefined,
      tags: query.tagSlug ? { some: { tag: { slug: query.tagSlug } } } : undefined,
      ...(query.q
        ? { OR: [{ title: { contains: query.q, mode: "insensitive" } }, { excerpt: { contains: query.q, mode: "insensitive" } }] }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: postWithRelations,
        orderBy: { publishedAt: "desc" },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { items, total, page: query.page, perPage: query.perPage, totalPages: Math.max(1, Math.ceil(total / query.perPage)) };
  }

  static async findFeatured() {
    return prisma.blogPost.findFirst({
      where: { published: true, featured: true },
      include: postWithRelations,
      orderBy: { publishedAt: "desc" },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.blogPost.findUnique({
      where: { slug },
      include: postWithRelations,
    });
  }

  /** Lightweight — just slugs, for generateStaticParams (Module 12: SSG). */
  static async listPublishedSlugs() {
    return prisma.blogPost.findMany({ where: { published: true }, select: { slug: true } });
  }

  /** Other posts in the same category, excluding self — for a detail page's "related" rail. */
  static async findRelated(postId: string, categoryId: string, limit = 3) {
    return prisma.blogPost.findMany({
      where: { published: true, categoryId, NOT: { id: postId } },
      include: postWithRelations,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  static async create(data: CreateBlogPostInput) {
    const { tagIds, ...rest } = data;
    return prisma.blogPost.create({
      data: { ...rest, tags: tagIds.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined },
      include: postWithRelations,
    });
  }

  static async update(data: UpdateBlogPostInput) {
    const { id, tagIds, ...rest } = data;
    return prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        ...(tagIds ? { tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } } : {}),
      },
      include: postWithRelations,
    });
  }

  static async delete(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  }

  static async listCategories() {
    return prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  }

  static async search(query: string, limit = 10) {
    return prisma.blogPost.findMany({
      where: {
        published: true,
        OR: [{ title: { contains: query, mode: "insensitive" } }, { excerpt: { contains: query, mode: "insensitive" } }],
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
    });
  }
}

export class BlogCategoryRepository {
  static async findAll() {
    return prisma.blogCategory.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });
  }
  static async listForPicker() {
    return prisma.blogCategory.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } });
  }
  static async create(data: CreateBlogCategoryInput) {
    return prisma.blogCategory.create({ data });
  }
  static async update(data: UpdateBlogCategoryInput) {
    const { id, ...rest } = data;
    return prisma.blogCategory.update({ where: { id }, data: rest });
  }
  static async delete(id: string) {
    return prisma.blogCategory.delete({ where: { id } });
  }
}

export class TagRepository {
  static async findAll() {
    return prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });
  }
  static async listForPicker() {
    return prisma.tag.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } });
  }
  static async create(data: CreateTagInput) {
    return prisma.tag.create({ data });
  }
  static async delete(id: string) {
    return prisma.tag.delete({ where: { id } });
  }
}
