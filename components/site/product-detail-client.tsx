"use client";

import { useMemo, useState } from "react";
import { theme } from "@/lib/theme";
import { optimizeImageUrl } from "@/lib/cloudinary-url";

type Variant = {
  id: string;
  sku: string;
  name: string;
  size: string | null;
  finish: string | null;
  color: string | null;
  price: string | null; // Decimal serialized as string
  currency: string;
  inStock: boolean;
  isDefault: boolean;
};

type ProductImage = {
  id: string;
  url: string | null; // null means "no real image uploaded yet" -> placeholder
  alt: string | null;
  variantId: string | null;
  isPrimary: boolean;
};

type ProductDetailInteractiveProps = {
  productName: string;
  images: ProductImage[];
  variants: Variant[];
};

function formatPrice(price: string | null, currency: string) {
  if (!price) return null;
  const n = Number(price);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export function ProductDetailInteractive({ productName, images, variants }: ProductDetailInteractiveProps) {
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(defaultVariant?.id);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const galleryImages = useMemo(() => {
    const variantImages = images.filter((img) => img.variantId === selectedVariantId);
    return variantImages.length > 0 ? variantImages : images.filter((img) => !img.variantId);
  }, [images, selectedVariantId]);

  const [activeImage, setActiveImage] = useState(0);
  const shownImages = galleryImages.length > 0 ? galleryImages : [{ id: "placeholder", url: null, alt: productName, variantId: null, isPrimary: true }];
  const current = shownImages[Math.min(activeImage, shownImages.length - 1)];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "clamp(28px, 5vw, 64px)" }}>
      {/* Gallery */}
      <div>
        <div style={{ aspectRatio: "4/3", background: theme.color.mutedBg, border: `1px solid ${theme.color.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          {current.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={optimizeImageUrl(current.url, { width: 900 })}
              alt={current.alt ?? productName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="eager"
              decoding="async"
            />
          ) : (
            <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.color.faint }}>{productName}</span>
          )}
        </div>
        {shownImages.length > 1 && (
          <div style={{ display: "flex", gap: 8 }}>
            {shownImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                style={{
                  width: 64,
                  height: 64,
                  padding: 0,
                  border: `1px solid ${i === activeImage ? theme.color.ink : theme.color.border}`,
                  background: theme.color.mutedBg,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {img.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optimizeImageUrl(img.url, { width: 128 })} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" decoding="async" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Variant picker */}
      <div>
        {selectedVariant && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: theme.color.muted, marginBottom: 4 }}>SKU {selectedVariant.sku}</div>
            {selectedVariant.price && (
              <div style={{ fontFamily: theme.font.serif, fontSize: 32 }}>
                {formatPrice(selectedVariant.price, selectedVariant.currency)}
              </div>
            )}
            <div style={{ fontSize: 12, color: selectedVariant.inStock ? "#3A6B33" : "#B3261E", marginTop: 6 }}>
              {selectedVariant.inStock ? "In stock" : "Made to order"}
            </div>
          </div>
        )}

        {variants.length > 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: theme.color.muted, marginBottom: 10 }}>
              Configuration
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVariantId(v.id); setActiveImage(0); }}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    border: `1px solid ${v.id === selectedVariantId ? theme.color.ink : theme.color.border}`,
                    background: v.id === selectedVariantId ? theme.color.mutedBg : "transparent",
                    cursor: "pointer",
                    fontFamily: theme.font.sans,
                    fontSize: 13,
                  }}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
