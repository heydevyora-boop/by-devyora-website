import { prisma } from "@/lib/prisma";
import { DownloadForm } from "@/components/admin/download-form";

export default async function NewDownloadPage() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>New download</h1>
      <DownloadForm products={products} />
    </div>
  );
}
