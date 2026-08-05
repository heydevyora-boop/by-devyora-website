"use client";

import { useState } from "react";
import type { Asset } from "@prisma/client";
import { updateAssetAltAction, deleteAssetAction } from "@/app/actions/media.actions";
import { buildOptimizedUrl } from "@/lib/cloudinary-url";

type GalleryProps = {
  assets: Asset[];
  onChanged?: () => void;
};

function AssetCard({ asset, onChanged }: { asset: Asset; onChanged?: () => void }) {
  const [alt, setAlt] = useState(asset.alt ?? "");
  const [isSavingAlt, setIsSavingAlt] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const thumbUrl =
    asset.resourceType === "IMAGE" ? buildOptimizedUrl(asset.publicId, { width: 320, crop: "fill" }) : null;

  async function saveAlt() {
    setIsSavingAlt(true);
    await updateAssetAltAction({ id: asset.id, alt });
    setIsSavingAlt(false);
    onChanged?.();
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${asset.name}"? This can't be undone.`)) return;
    setIsDeleting(true);
    const result = await deleteAssetAction(asset.id);
    if (!result.ok) {
      window.alert(result.error);
      setIsDeleting(false);
      return;
    }
    onChanged?.();
  }

  return (
    <div style={{ border: "1px solid #E4E1DC", opacity: isDeleting ? 0.4 : 1 }}>
      <div style={{ aspectRatio: "4/3", background: "#F6F4F1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {thumbUrl ? (
          // Using a plain <img> here (not next/image) since this is an admin
          // tool rendering arbitrary user-uploaded assets at a fixed thumb size.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={asset.alt ?? asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" decoding="async" />
        ) : (
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A6A29B" }}>
            {asset.format ?? asset.resourceType}
          </span>
        )}
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {asset.name}
        </div>

        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={saveAlt}
          placeholder="Alt text (required for accessibility & SEO)"
          style={{
            width: "100%",
            padding: "7px 10px",
            fontSize: 11,
            border: `1px solid ${alt ? "#E4E1DC" : "#D9A15C"}`,
            background: alt ? "#FFFFFF" : "#FBF3E7",
            outline: "none",
            marginBottom: 10,
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(asset.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "#8C6A45" }}
          >
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "#B3261E" }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
        {isSavingAlt && <div style={{ fontSize: 10, color: "#A6A29B", marginTop: 6 }}>Saving…</div>}
      </div>
    </div>
  );
}

export function Gallery({ assets, onChanged }: GalleryProps) {
  if (assets.length === 0) {
    return (
      <div style={{ border: "1px solid #E4E1DC", padding: "48px 24px", textAlign: "center", color: "#6B6862", fontSize: 13 }}>
        No media yet — drop some files above to get started.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} onChanged={onChanged} />
      ))}
    </div>
  );
}
