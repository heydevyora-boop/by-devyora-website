import { MaterialRepository } from "@/lib/repositories/material.repository";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [materials, categories] = await Promise.all([
    MaterialRepository.listForPicker(),
    CategoryRepository.listForPicker(),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>New product</h1>
      <ProductForm materials={materials} categories={categories} />
    </div>
  );
}
