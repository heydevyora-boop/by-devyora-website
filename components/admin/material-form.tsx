"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import slugify from "slugify";
import { createMaterialSchema, type CreateMaterialInput } from "@/lib/validations/material";
import { createMaterialAction, updateMaterialAction } from "@/app/actions/material.actions";

type MaterialFormProps = {
  defaultValues?: Partial<CreateMaterialInput> & { id?: string };
  nextNum: number;
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
const sectionStyle: React.CSSProperties = { border: "1px solid #E4E1DC", padding: 20, marginBottom: 20 };
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

export function MaterialForm({ defaultValues, nextNum }: MaterialFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateMaterialInput>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      num: nextNum,
      published: true,
      formats: "Standard & made to drawing",
      leadTime: "6–10 weeks",
      specs: [],
      applications: [],
      images: [],
      ...defaultValues,
    },
  });

  const specs = useFieldArray({ control, name: "specs" });
  const applications = useFieldArray({ control, name: "applications" });
  const images = useFieldArray({ control, name: "images" });

  async function onSubmit(data: CreateMaterialInput) {
    setServerError(null);
    setIsSubmitting(true);
    const result = isEditing
      ? await updateMaterialAction({ ...data, id: defaultValues!.id })
      : await createMaterialAction(data);
    setIsSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/materials");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={sectionStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 16, marginBottom: 16 }}>
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
          <div>
            <label style={labelStyle}>Order #</label>
            <input style={inputStyle} type="number" {...register("num", { valueAsNumber: true })} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Tagline</label>
          <input style={inputStyle} {...register("tagline")} />
          {errors.tagline && <p style={errorStyle}>{errors.tagline.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} {...register("description")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Material composition</label>
            <input style={inputStyle} {...register("material")} placeholder="e.g. Alkali-resistant glass fibre & cement" />
          </div>
          <div>
            <label style={labelStyle}>Finishes</label>
            <input style={inputStyle} {...register("finishes")} placeholder="e.g. Sandblasted, acid-etched, board-formed" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Formats</label>
            <input style={inputStyle} {...register("formats")} />
          </div>
          <div>
            <label style={labelStyle}>Lead time</label>
            <input style={inputStyle} {...register("leadTime")} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Hero image URL</label>
          <input style={inputStyle} {...register("heroImage")} />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" {...register("published")} /> Published
        </label>
      </div>

      {/* Applications */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Applications</h3>
          <button type="button" style={smallBtn} onClick={() => applications.append({ label: "", order: applications.fields.length })}>
            + Add
          </button>
        </div>
        {applications.fields.map((field, i) => (
          <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} placeholder="e.g. Facades" {...register(`applications.${i}.label`)} />
            <button type="button" style={{ ...smallBtn, borderColor: "#B3261E", color: "#B3261E" }} onClick={() => applications.remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Specs */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Specification rows</h3>
          <button type="button" style={smallBtn} onClick={() => specs.append({ key: "", value: "", order: specs.fields.length })}>
            + Add
          </button>
        </div>
        {specs.fields.map((field, i) => (
          <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} placeholder="Key" {...register(`specs.${i}.key`)} />
            <input style={inputStyle} placeholder="Value" {...register(`specs.${i}.value`)} />
            <button type="button" style={{ ...smallBtn, borderColor: "#B3261E", color: "#B3261E" }} onClick={() => specs.remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Images */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Gallery images</h3>
          <button type="button" style={smallBtn} onClick={() => images.append({ url: "", order: images.fields.length })}>
            + Add
          </button>
        </div>
        {images.fields.map((field, i) => (
          <div key={field.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 10, marginBottom: 10 }}>
            <input style={inputStyle} placeholder="Image URL" {...register(`images.${i}.url`)} />
            <input style={inputStyle} placeholder="Alt text" {...register(`images.${i}.alt`)} />
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
          style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create material"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/materials")}
          style={{ background: "none", border: "1px solid #E4E1DC", padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
