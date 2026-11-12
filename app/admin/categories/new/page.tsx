import { CategoryRepository } from "@/lib/repositories/category.repository";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const parentOptions = await CategoryRepository.listForPicker();
  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>New category</h1>
      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
