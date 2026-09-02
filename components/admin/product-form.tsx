"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PickerItem {
  id: string;
  name: string;
}

interface Specification {
  key: string;
  value: string;
  order: number;
}

interface Variant {
  id?: string;
  sku: string;
  name: string;
  size?: string;
  finish?: string;
  color?: string;
  price?: number;
  currency: string;
  inStock: boolean;
  isDefault: boolean;
  order: number;
}

interface ProductImage {
  url: string;
  alt?: string;
  variantId?: string;
  isPrimary: boolean;
  order: number;
}

interface ProductFormValues {
  id?: string;
  sku: string;
  slug: string;
  name: string;
  materialId: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  status: string;
  featured: boolean;
  order: number;
  specifications: Specification[];
  variants: Variant[];
  images: ProductImage[];
}

// Input shape allows nullable materialId/categoryId, since these can be
// null in the database. They are normalized to "" internally.
type ProductFormInputValues = Omit<ProductFormValues, "materialId" | "categoryId"> & {
  materialId?: string | null;
  categoryId?: string | null;
};

interface ProductFormProps {
  materials: PickerItem[];
  categories: PickerItem[];
  defaultValues?: ProductFormInputValues;
}

const emptyValues: ProductFormValues = {
  sku: "",
  slug: "",
  name: "",
  materialId: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  status: "draft",
  featured: false,
  order: 0,
  specifications: [],
  variants: [],
  images: [],
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontWeight: 500,
  fontSize: 13,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
  paddingBottom: 24,
  borderBottom: "1px solid #eee",
};

export function ProductForm({ materials, categories, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(defaultValues?.id);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ProductFormValues>(
    defaultValues
      ? {
          ...defaultValues,
          materialId: defaultValues.materialId ?? "",
          categoryId: defaultValues.categoryId ?? "",
        }
      : emptyValues
  );

  const updateField = <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // --- Specifications ---
  const addSpecification = () => {
    updateField("specifications", [
      ...values.specifications,
      { key: "", value: "", order: values.specifications.length },
    ]);
  };

  const updateSpecification = (index: number, field: keyof Specification, value: string | number) => {
    const updated = [...values.specifications];
    updated[index] = { ...updated[index], [field]: value };
    updateField("specifications", updated);
  };

  const removeSpecification = (index: number) => {
    updateField(
      "specifications",
      values.specifications.filter((_, i) => i !== index)
    );
  };

  // --- Variants ---
  const addVariant = () => {
    updateField("variants", [
      ...values.variants,
      {
        sku: "",
        name: "",
        currency: "USD",
        inStock: true,
        isDefault: values.variants.length === 0,
        order: values.variants.length,
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number | boolean | undefined) => {
    const updated = [...values.variants];
    updated[index] = { ...updated[index], [field]: value };
    updateField("variants", updated);
  };

  const removeVariant = (index: number) => {
    updateField(
      "variants",
      values.variants.filter((_, i) => i !== index)
    );
  };

  // --- Images ---
  const addImage = () => {
    updateField("images", [
      ...values.images,
      { url: "", isPrimary: values.images.length === 0, order: values.images.length },
    ]);
  };

  const updateImage = (index: number, field: keyof ProductImage, value: string | number | boolean | undefined) => {
    const updated = [...values.images];
    updated[index] = { ...updated[index], [field]: value };
    updateField("images", updated);
  };

  const removeImage = (index: number) => {
    updateField(
      "images",
      values.images.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode ? `/api/admin/products/${values.id}` : "/api/admin/products";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const err = await response.json().catch(() => null);
        alert(err?.message ?? "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      {/* Basic Info */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Basic Info</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>SKU</label>
            <input
              type="text"
              value={values.sku}
              onChange={(e) => updateField("sku", e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={values.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Material</label>
            <select
              value={values.materialId}
              onChange={(e) => updateField("materialId", e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select a material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={values.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Short Description</label>
          <input
            type="text"
            value={values.shortDescription ?? ""}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={values.description ?? ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            style={{ ...inputStyle, fontFamily: "inherit" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={values.status}
              onChange={(e) => updateField("status", e.target.value)}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Order</label>
            <input
              type="number"
              value={values.order}
              onChange={(e) => updateField("order", parseInt(e.target.value, 10) || 0)}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input
              type="checkbox"
              id="featured"
              checked={values.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
            />
            <label htmlFor="featured" style={{ fontSize: 13, fontWeight: 500 }}>
              Featured
            </label>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Specifications</h2>
          <button type="button" onClick={addSpecification} style={addButtonStyle}>
            + Add
          </button>
        </div>

        {values.specifications.map((spec, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Key"
              value={spec.key}
              onChange={(e) => updateSpecification(i, "key", e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="text"
              placeholder="Value"
              value={spec.value}
              onChange={(e) => updateSpecification(i, "value", e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={() => removeSpecification(i)} style={removeButtonStyle}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Variants */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Variants</h2>
          <button type="button" onClick={addVariant} style={addButtonStyle}>
            + Add
          </button>
        </div>

        {values.variants.map((variant, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Name"
                value={variant.name}
                onChange={(e) => updateVariant(i, "name", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Size"
                value={variant.size ?? ""}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Finish"
                value={variant.finish ?? ""}
                onChange={(e) => updateVariant(i, "finish", e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Color"
                value={variant.color ?? ""}
                onChange={(e) => updateVariant(i, "color", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="number"
                placeholder="Price"
                value={variant.price ?? ""}
                onChange={(e) =>
                  updateVariant(i, "price", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                style={{ ...inputStyle, width: 100 }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={variant.inStock}
                  onChange={(e) => updateVariant(i, "inStock", e.target.checked)}
                />
                In Stock
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={variant.isDefault}
                  onChange={(e) => updateVariant(i, "isDefault", e.target.checked)}
                />
                Default
              </label>
              <button
                type="button"
                onClick={() => removeVariant(i)}
                style={{ ...removeButtonStyle, marginLeft: "auto" }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Images */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Images</h2>
          <button type="button" onClick={addImage} style={addButtonStyle}>
            + Add
          </button>
        </div>

        {values.images.map((image, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Image URL"
              value={image.url}
              onChange={(e) => updateImage(i, "url", e.target.value)}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              type="text"
              placeholder="Alt text"
              value={image.alt ?? ""}
              onChange={(e) => updateImage(i, "alt", e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={image.isPrimary}
                onChange={(e) => updateImage(i, "isPrimary", e.target.checked)}
              />
              Primary
            </label>
            <button type="button" onClick={() => removeImage(i)} style={removeButtonStyle}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}

const addButtonStyle: React.CSSProperties = {
  padding: "4px 12px",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
};

const removeButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  backgroundColor: "#fff",
  border: "1px solid #ff4444",
  color: "#ff4444",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};
