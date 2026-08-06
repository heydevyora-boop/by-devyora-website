"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import slugify from "slugify";
import type { z } from "zod";
import {
  createProductSchema,
} from "@/lib/validations/product";
import { createProductAction, updateProductAction } from "@/app/actions/product.actions";
import { ImageUploader } from "@/components/admin/image-uploader";

// createProductSchema (and its nested spec/variant/image sub-schemas) has
// fields with `.default(...)` (currency, inStock, isDefault, order,
// isPrimary, status, featured), so its *input* type (pre-default) is what
// zodResolver expects — not the z.infer *output* type, which has those
// fields required.
type ProductFormValues = z.input<typeof createProductSchema>;

type Option = { id: string; name: string };

type ProductFormProps = {
  materials: Option[];
  categories: Option[];
  defaultValues?: Partial<ProductFormValues> & { id?: string };
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

const sectionStyle: React.CSSProperties = {
  border: "1px solid #E4E1DC",
  padding: 20,
  marginBottom: 20,
};

const errorStyle: React.CSSProperties = { color: "#B3261E", fontSize: 11, marginTop: 4 };

const smallBtn: React.CSSProperties = {
  background: "none",
  border: "1px solid #121110",
  padding: "8px 16px",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export function ProductForm({ materials, categories, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      status: "DRAFT",
      featured: false,
      order: 0,
      specifications: [],
      variants: [],
      images: [],
      ...defaultValues,
    },
  });

  const specs = useFieldArray({ control, name: "specifications" });
  const variants = useFieldArray({ control, name: "variants" });
  const images = useFieldArray({ control, name: "images" });

  const name = watch("name");

  async function onSubmit(data: ProductFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    const result = isEditing
      ? await updateProductAction({ ...data, id: defaultValues!.id })
      : await createProductAction(data);
    setIsSubmitting(false);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Core fields */}
      <div style={sectionStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
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
          <div>
            <label style={labelStyle}>Slug</label>
            <input style={inputStyle} {...register("slug")} />
            {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>SKU</label>
            <input style={inputStyle} {...register("sku")} />
            {errors.sku && <p style={errorStyle}>{errors.sku.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Material</label>
            <select style={inputStyle} {...register("materialId")}>
              <option value="">Select…</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.materialId && <p style={errorStyle}>{errors.materialId.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} {...register("categoryId")}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Short description</label>
          <input style={inputStyle} {...register("shortDescription")} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} {...register("description")} />
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} {...register("status")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 20 }}>
            <input type="checkbox" {...register("featured")} /> Featured
          </label>
        </div>
      </div>

      {/* Specifications */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Specifications</h3>
          <button type="button" style={smallBtn} onClick={() => specs.append({ key: "", value: "", order: specs.fields.length })}>
            + Add spec
          </button>
        </div>
        {specs.fields.length === 0 && <p style={{ fontSize: 12, color: "#6B6862" }}>No specifications yet.</p>}
        {specs.fields.map((field, i) => (
          <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} placeholder="Key (e.g. Panel thickness)" {...register(`specifications.${i}.key`)} />
            <input style={inputStyle} placeholder="Value (e.g. 12mm nominal)" {...register(`specifications.${i}.value`)} />
            <button type="button" style={{ ...smallBtn, borderColor: "#B3261E", color: "#B3261E" }} onClick={() => specs.remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Variants */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Variants</h3>
          <button
            type="button"
            style={smallBtn}
            onClick={() =>
              variants.append({
                sku: "",
                name: "",
                currency: "INR",
                inStock: true,
                isDefault: variants.fields.length === 0,
                order: variants.fields.length,
              })
            }
          >
            + Add variant
          </button>
        </div>
        {variants.fields.length === 0 && <p style={{ fontSize: 12, color: "#6B6862" }}>No variants yet — {name || "this product"} will show as a single configuration.</p>}
        {variants.fields.map((field, i) => (
          <div key={field.id} style={{ border: "1px solid #E4E1DC", padding: 14, marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} placeholder="Variant SKU" {...register(`variants.${i}.sku`)} />
              <input style={inputStyle} placeholder="Variant name (e.g. 600×1200mm — Ash Grey)" {...register(`variants.${i}.name`)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input style={inputStyle} placeholder="Size" {...register(`variants.${i}.size`)} />
              <input style={inputStyle} placeholder="Finish" {...register(`variants.${i}.finish`)} />
              <input style={inputStyle} placeholder="Color" {...register(`variants.${i}.color`)} />
              <input style={inputStyle} type="number" step="0.01" placeholder="Price" {...register(`variants.${i}.price`)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" {...register(`variants.${i}.inStock`)} /> In stock
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" {...register(`variants.${i}.isDefault`)} /> Default variant
                </label>
              </div>
              <button type="button" style={{ ...smallBtn, borderColor: "#B3261E", color: "#B3261E" }} onClick={() => variants.remove(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Images */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Images</h3>
          <button type="button" style={smallBtn} onClick={() => images.append({ url: "", isPrimary: images.fields.length === 0, order: images.fields.length })}>
            + Add image URL
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#6B6862", marginBottom: 12 }}>
          Drag and drop to upload, or add an image URL manually below.
        </p>
        <div style={{ marginBottom: 14 }}>
          <ImageUploader
            onUploaded={(url) =>
              images.append({ url, isPrimary: images.fields.length === 0, order: images.fields.length })
            }
          />
        </div>
        {images.fields.length === 0 && <p style={{ fontSize: 12, color: "#6B6862" }}>No images yet.</p>}
        {images.fields.map((field, i) => (
          <div key={field.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto auto", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input style={inputStyle} placeholder="Image URL" {...register(`images.${i}.url`)} />
            <input style={inputStyle} placeholder="Alt text" {...register(`images.${i}.alt`)} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <input type="checkbox" {...register(`images.${i}.isPrimary`)} /> Primary
            </label>
            <button type="button" style={{ ...smallBtn, borderColor: "#B3261E", color: "#B3261E" }} onClick={() => images.remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {serverError && <p style={{ ...errorStyle, marginBottom: 16 }}>{serverError}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: "#121110",
            color: "#FFFFFF",
            border: 0,
            padding: "13px 28px",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: isSubmitting ? "default" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          style={{ background: "none", border: "1px solid #E4E1DC", padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
