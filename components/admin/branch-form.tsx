"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { createBranchSchema } from "@/lib/validations/branch";
import { createBranchAction, updateBranchAction } from "@/app/actions/branch.actions";

type BranchFormValues = z.input<typeof createBranchSchema>;

type BranchFormProps = {
  defaultValues?: Partial<BranchFormValues> & { id?: string };
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #E4E1DC",
  background: "#F6F4F1",
  fontFamily: "Archivo, sans-serif",
  fontSize: 13,
  outline: "none",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6B6862",
  marginBottom: 6,
  display: "block",
};
const errorStyle: React.CSSProperties = { color: "#B3261E", fontSize: 11, marginTop: 4 };

export function BranchForm({ defaultValues }: BranchFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: { order: 0, isHeadOffice: false, ...defaultValues },
  });

  async function onSubmit(data: BranchFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    const result = isEditing
      ? await updateBranchAction({ ...data, id: defaultValues!.id })
      : await createBranchAction(data);
    setIsSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/branches");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ border: "1px solid #E4E1DC", padding: 20, maxWidth: 560 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>City</label>
        <input style={inputStyle} {...register("city")} />
        {errors.city && <p style={errorStyle}>{errors.city.message}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Address</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} {...register("address")} />
        {errors.address && <p style={errorStyle}>{errors.address.message}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} {...register("phone")} />
        {errors.phone && <p style={errorStyle}>{errors.phone.message}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Email (optional)</label>
        <input style={inputStyle} {...register("email")} />
        {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Display order</label>
        <input type="number" style={inputStyle} {...register("order", { valueAsNumber: true })} />
      </div>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <input id="isHeadOffice" type="checkbox" {...register("isHeadOffice")} />
        <label htmlFor="isHeadOffice" style={{ fontSize: 13 }}>This is the head office</label>
      </div>

      {serverError && <p style={{ ...errorStyle, marginBottom: 16 }}>{serverError}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create branch"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/branches")}
          style={{ background: "none", border: "1px solid #E4E1DC", padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
