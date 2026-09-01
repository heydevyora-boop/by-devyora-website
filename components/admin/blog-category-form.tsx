"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { createBlogCategoryAction } from "@/app/actions/blog.actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #E4E1DC",
  background: "#F6F4F1",
  fontFamily: "Archivo, sans-serif",
  fontSize: 13,
  outline: "none",
  marginBottom: 12,
};

export function BlogCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await createBlogCategoryAction({ name, slug: slug || slugify(name, { lower: true, strict: true }) });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setSlug("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #E4E1DC", padding: 20 }}>
      <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, marginBottom: 14 }}>New category</h3>
      <input
        style={inputStyle}
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => !slug && setSlug(slugify(name, { lower: true, strict: true }))}
        required
      />
      <input style={inputStyle} placeholder="Slug (auto-generated)" value={slug} onChange={(e) => setSlug(e.target.value)} />
      {error && <p style={{ color: "#B3261E", fontSize: 11, marginBottom: 12 }}>{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{ background: "#121110", color: "#FFFFFF", border: 0, padding: "11px 22px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: isSubmitting ? "default" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
      >
        {isSubmitting ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
