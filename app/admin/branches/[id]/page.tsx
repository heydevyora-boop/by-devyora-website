import { notFound } from "next/navigation";
import { BranchRepository } from "@/lib/repositories/branch.repository";
import { BranchForm } from "@/components/admin/branch-form";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const branch = await BranchRepository.findById(id);
  if (!branch) notFound();

  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>Edit branch</h1>
      <BranchForm
        defaultValues={{
          id: branch.id,
          city: branch.city,
          address: branch.address,
          phone: branch.phone,
          email: branch.email ?? undefined,
          isHeadOffice: branch.isHeadOffice,
          order: branch.order,
        }}
      />
    </div>
  );
}
