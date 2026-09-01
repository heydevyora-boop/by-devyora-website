"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import slugify from "slugify";
import type { z } from "zod";
import { createCategorySchema } from "@/lib/validations/category";
import { createCategoryAction, updateCategoryAction } from "@/app/actions/category.actions";

// createCategorySchema has fields with `.default(...)` (order), so its
// *input* type (pre-default) is what zodResolver expects — not the z.infer
// *output* type, which has those fields required.
type CategoryFormValues = z.input<typeof createCategorySchema>;

type CategoryFormProps = {
  parentOptions: { id: string; name: string }[];
  defaultValues?: Partial<CategoryFormValues> & { id?: string };
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

export function CategoryForm({ parentOptions, defaultValues }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { order: 0, ...defaultValues },
  });

  async function onSubmit(data: CategoryFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    const result = isEditing
      ? await updateCategoryAction({ ...data, id: defaultValues!.id })
      : await createCategoryAction(data);
    setIsSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ border: "1px solid #E4E1DC", padding: 20, maxWidth: 560 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Name</label>
        <input
          style={inputStyle}
          {...register("name")}
          onBlur={(e) => {
            if (!isEditing && !watch("slug")) {
              setValue("slug", slugify(e.target.value, { lower: true, strict: true }));
            }
          }}
        />
        {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Slug</label>
        <input style={inputStyle} {...register("slug")} />
        {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} {...register("description")} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Parent category</label>
        <select style={inputStyle} {...register("parentId")}>
          <option value="">None (top level)</option>
          {parentOptions
            .filter((p) => p.id !== defaultValues?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
      </div>

      {serverError && <p style={{ ...errorStyle, marginBottom: 16 }}>{serverError}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create category"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          style={{ background: "none", border: "1px solid #E4E1DC", padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
