"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import slugify from "slugify";
import type { z } from "zod";
import { createBlogPostSchema } from "@/lib/validations/blog";
import { createBlogPostAction, updateBlogPostAction } from "@/app/actions/blog.actions";
import { ImageUploader } from "./image-uploader";

// createBlogPostSchema has fields with `.default(...)` (featured, published,
// tagIds), so its *input* type (what the form actually collects, before
// defaults are applied) has those as optional — while CreateBlogPostInput
// (z.infer, i.e. the *output* type) has them required. zodResolver types
// against the input side, so the form must use this, not CreateBlogPostInput.
type BlogPostFormValues = z.input<typeof createBlogPostSchema>;

// Tiptap touches the DOM on mount and isn't needed anywhere but this form —
// lazy-loaded so it's out of every other admin page's bundle (Module 12).
const RichEditor = dynamic(() => import("./rich-editor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => <div style={{ border: "1px solid #E4E1DC", padding: 40, textAlign: "center", color: "#6B6862", fontSize: 13 }}>Loading editor…</div>,
});

type BlogPostFormProps = {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  defaultValues?: Partial<BlogPostFormValues> & { id?: string };
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

export function BlogPostForm({ categories, tags, defaultValues }: BlogPostFormProps) {
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
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: { published: false, featured: false, content: "", tagIds: [], ...defaultValues },
  });

  const title = watch("title");
  const metaTitle = watch("metaTitle");
  const metaDescription = watch("metaDescription");

  async function onSubmit(data: BlogPostFormValues) {
    setServerError(null);
    setIsSubmitting(true);
    const result = isEditing ? await updateBlogPostAction({ ...data, id: defaultValues!.id }) : await createBlogPostAction(data);
    setIsSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={sectionStyle}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Title</label>
          <input
            style={inputStyle}
            {...register("title")}
            onBlur={(e) => {
              if (!isEditing && !watch("slug")) setValue("slug", slugify(e.target.value, { lower: true, strict: true }));
            }}
          />
          {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Slug</label>
          <input style={inputStyle} {...register("slug")} />
          {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Excerpt</label>
          <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} {...register("excerpt")} />
          {errors.excerpt && <p style={errorStyle}>{errors.excerpt.message}</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} {...register("categoryId")}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p style={errorStyle}>{errors.categoryId.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Tags</label>
            <Controller
              control={control}
              name="tagIds"
              render={({ field }) => (
                <select
                  multiple
                  style={{ ...inputStyle, height: 90 }}
                  value={field.value}
                  onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
                >
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            />
            <p style={{ fontSize: 10, color: "#A6A29B", marginTop: 4 }}>Ctrl/Cmd-click to select multiple</p>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Content</label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => <RichEditor value={field.value} onChange={field.onChange} />}
        />
        {errors.content && <p style={errorStyle}>{errors.content.message}</p>}
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, marginBottom: 14 }}>Cover image</h3>
        {watch("coverImage") && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={watch("coverImage")} alt="" style={{ width: 200, height: 130, objectFit: "cover", marginBottom: 12 }} />
        )}
        <ImageUploader onUploaded={(url) => setValue("coverImage", url)} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, marginBottom: 14 }}>SEO</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Meta title <span style={{ color: "#A6A29B", textTransform: "none" }}>(defaults to post title — {(metaTitle || title || "").length}/70)</span></label>
          <input style={inputStyle} {...register("metaTitle")} placeholder={title} maxLength={70} />
        </div>
        <div>
          <label style={labelStyle}>Meta description <span style={{ color: "#A6A29B", textTransform: "none" }}>(defaults to excerpt — {(metaDescription || "").length}/160)</span></label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} {...register("metaDescription")} maxLength={160} />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: "flex", gap: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input type="checkbox" {...register("published")} /> Published
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input type="checkbox" {...register("featured")} /> Featured
          </label>
        </div>
      </div>

      {serverError && <p style={{ ...errorStyle, marginBottom: 16 }}>{serverError}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          style={{ background: "none", border: "1px solid #E4E1DC", padding: "13px 28px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
