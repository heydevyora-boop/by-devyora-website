import { BlogCategoryRepository, TagRepository } from "@/lib/repositories/blog.repository";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function NewBlogPostPage() {
  const [categories, tags] = await Promise.all([BlogCategoryRepository.listForPicker(), TagRepository.listForPicker()]);
  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>New post</h1>
      <BlogPostForm categories={categories} tags={tags} />
    </div>
  );
}
