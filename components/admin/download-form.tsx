"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDownloadFileSchema, type CreateDownloadFileInput } from "@/lib/validations/download";
import { createDownloadFileAction, updateDownloadFileAction } from "@/app/actions/download.actions";
import { FileUploader } from "@/components/admin/file-uploader";

type DownloadFormProps = {
  products: { id: string; name: string }[];
  defaultValues?: Partial<CreateDownloadFileInput> & { id?: string };
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

export function DownloadForm({ products, defaultValues }: DownloadFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateDownloadFileInput>({
    resolver: zodResolver(createDownloadFileSchema),
    defaultValues: { published: true, category: "TECHNICAL", ...defaultValues },
  });

  async function onSubmit(data: CreateDownloadFileInput) {
    setServerError(null);
    setIsSubmitting(true);
    const result = isEditing
      ? await updateDownloadFileAction({ ...data, id: defaultValues!.id })
      : await createDownloadFileAction(data);
    setIsSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/downloads");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ border: "1px solid #E4E1DC", padding: 20, maxWidth: 620 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Name</label>
        <input style={inputStyle} {...register("name")} placeholder="e.g. GRC Technical Data Sheet" />
        {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} {...register("category")}>
            <option value="CATALOGUE">Catalogue</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BROCHURE">Brochure</option>
            <option value="INSTALLATION">Installation</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Attach to product (optional)</label>
          <select style={inputStyle} {...register("productId")}>
            <option value="">Site-wide (not product-specific)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>File</label>
        <div style={{ marginBottom: 10 }}>
          <FileUploader
            onUploaded={({ url, size }) => {
              setValue("fileUrl", url, { shouldValidate: true });
              setValue("fileSize", size, { shouldValidate: true });
            }}
          />
        </div>
        <input style={inputStyle} {...register("fileUrl")} placeholder="…or paste a file URL directly" />
        {errors.fileUrl && <p style={errorStyle}>{errors.fileUrl.message}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>File size (bytes)</label>
          <input style={inputStyle} type="number" {...register("fileSize", { valueAsNumber: true })} />
          {errors.fileSize && <p style={errorStyle}>{errors.fileSize.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Year (optional)</label>
          <input style={inputStyle} type="number" {...register("year", { valueAsNumber: true })} />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20 }}>
        <input type="checkbox" {...register("published")} /> Published
      </label>

      {serverError && <p style={{ ...errorStyle, marginBottom: 16 }}>{serverError}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create download"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/downloads")}
          style={{ background: "none", border: "1px solid #E4E1DC", padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
