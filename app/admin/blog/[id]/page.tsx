import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogCategoryRepository, TagRepository } from "@/lib/repositories/blog.repository";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { tags: true } }),
    BlogCategoryRepository.listForPicker(),
    TagRepository.listForPicker(),
  ]);
  if (!post) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Edit post</h1>
      <BlogPostForm
        categories={categories}
        tags={tags}
        defaultValues={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage ?? undefined,
          featured: post.featured,
          published: post.published,
          metaTitle: post.metaTitle ?? undefined,
          metaDescription: post.metaDescription ?? undefined,
          categoryId: post.categoryId,
          authorId: post.authorId ?? undefined,
          tagIds: post.tags.map((t) => t.tagId),
        }}
      />
    </div>
  );
}
