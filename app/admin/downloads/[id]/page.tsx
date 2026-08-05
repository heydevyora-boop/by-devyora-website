import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DownloadRepository } from "@/lib/repositories/download.repository";
import { DownloadForm } from "@/components/admin/download-form";

export default async function EditDownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [file, products] = await Promise.all([
    DownloadRepository.findById(id),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!file) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Edit download</h1>
      <DownloadForm
        products={products}
        defaultValues={{
          id: file.id,
          name: file.name,
          category: file.category,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          year: file.year ?? undefined,
          published: file.published,
          productId: file.productId ?? undefined,
        }}
      />
    </div>
  );
}
