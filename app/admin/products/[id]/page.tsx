import { notFound } from "next/navigation";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, materials, categories] = await Promise.all([
    ProductRepository.findById(id),
    MaterialRepository.listForPicker(),
    CategoryRepository.listForPicker(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Edit product</h1>
      <ProductForm
        materials={materials}
        categories={categories}
        defaultValues={{
          id: product.id,
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          materialId: product.materialId,
          categoryId: product.categoryId,
          shortDescription: product.shortDescription ?? undefined,
          description: product.description ?? undefined,
          status: product.status,
          featured: product.featured,
          order: product.order,
          specifications: product.specifications.map(({ key, value, order }) => ({ key, value, order })),
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            name: v.name,
            size: v.size ?? undefined,
            finish: v.finish ?? undefined,
            color: v.color ?? undefined,
            price: v.price ? Number(v.price) : undefined,
            currency: v.currency,
            inStock: v.inStock,
            isDefault: v.isDefault,
            order: v.order,
          })),
          images: product.images.map(({ url, alt, variantId, isPrimary, order }) => ({
            url,
            alt: alt ?? undefined,
            variantId: variantId ?? undefined,
            isPrimary,
            order,
          })),
        }}
      />
    </div>
  );
}
