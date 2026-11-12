import { notFound } from "next/navigation";
import { MaterialRepository } from "@/lib/repositories/material.repository";
import { MaterialForm } from "@/components/admin/material-form";

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const material = await MaterialRepository.findById(id);
  if (!material) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Edit material</h1>
      <MaterialForm
        nextNum={material.num}
        defaultValues={{
          id: material.id,
          num: material.num,
          slug: material.slug,
          name: material.name,
          tagline: material.tagline,
          description: material.description ?? undefined,
          material: material.material ?? undefined,
          finishes: material.finishes ?? undefined,
          formats: material.formats,
          leadTime: material.leadTime,
          heroImage: material.heroImage ?? undefined,
          published: material.published,
          specs: material.specs.map(({ key, value, order }) => ({ key, value, order })),
          applications: material.applications.map(({ label, order }) => ({ label, order })),
          images: material.images.map(({ url, alt, order }) => ({ url, alt: alt ?? undefined, order })),
        }}
      />
    </div>
  );
}
