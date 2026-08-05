import { notFound } from "next/navigation";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, parentOptions] = await Promise.all([
    CategoryRepository.findById(id),
    CategoryRepository.listForPicker(),
  ]);
  if (!category) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Edit category</h1>
      <CategoryForm
        parentOptions={parentOptions}
        defaultValues={{
          id: category.id,
          slug: category.slug,
          name: category.name,
          description: category.description ?? undefined,
          parentId: category.parentId,
        }}
      />
    </div>
  );
}
