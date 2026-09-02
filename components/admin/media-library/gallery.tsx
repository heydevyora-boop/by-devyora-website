"use client";

import { useState } from "react";

interface GalleryAsset {
  id: string;
  publicId: string;
  url: string;
  folder: string;
  resourceType: string; // "IMAGE" | "VIDEO" | "DOCUMENT" | ... (AssetResourceType enum)
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes: number;
  name: string;
  alt?: string | null;
}

interface GalleryProps {
  assets: GalleryAsset[];
  onChanged: () => void;
}

export function Gallery({ assets, onChanged }: GalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    setDeletingId(assetId);

    try {
      const response = await fetch(`/api/admin/media/${assetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onChanged();
      } else {
        alert("Failed to delete asset");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Error deleting asset");
    } finally {
      setDeletingId(null);
    }
  };

  if (assets.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#999" }}>
        <p>No media files uploaded yet</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 500 }}>
        Uploaded Media ({assets.length})
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        {assets.map((asset) => (
          <div
            key={asset.id}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
            }}
          >
            {/* Thumbnail Preview */}
            <div
              style={{
                width: "100%",
                height: 120,
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#999",
                wordBreak: "break-word",
                padding: 8,
              }}
            >
              {asset.resourceType?.startsWith("IMAGE") ? (
                <img
                  src={asset.url}
                  alt={asset.alt ?? asset.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span>📄 {(asset.format ?? asset.resourceType ?? "FILE").toUpperCase()}</span>
              )}
            </div>

            {/* File Info */}
            <div style={{ padding: 12 }}>
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={asset.name}
              >
                {asset.name}
              </p>

              {!asset.alt && asset.resourceType === "IMAGE" && (
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 10,
                    color: "#c9820a",
                  }}
                >
                  ⚠ Missing alt text
                </p>
              )}

              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 11,
                  color: "#999",
                }}
              >
                {(asset.bytes / 1024).toFixed(2)} KB
                {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
              </p>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(asset.id)}
                disabled={deletingId === asset.id}
                style={{
                  width: "100%",
                  padding: "6px",
                  backgroundColor: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: deletingId === asset.id ? "not-allowed" : "pointer",
                  fontSize: 12,
                  opacity: deletingId === asset.id ? 0.6 : 1,
                  fontWeight: 500,
                }}
              >
                {deletingId === asset.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
