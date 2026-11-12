import { prisma } from "@/lib/prisma";
import { MaterialForm } from "@/components/admin/material-form";

export default async function NewMaterialPage() {
  const last = await prisma.material.findFirst({ orderBy: { num: "desc" }, select: { num: true } });
  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>New material</h1>
      <MaterialForm nextNum={(last?.num ?? 0) + 1} />
    </div>
  );
}
