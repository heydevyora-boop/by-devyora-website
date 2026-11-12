import { BranchForm } from "@/components/admin/branch-form";

export default function NewBranchPage() {
  return (
    <div>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 24 }}>New branch</h1>
      <BranchForm />
    </div>
  );
}
