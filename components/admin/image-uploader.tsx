"use client";

import { useState, useCallback } from "react";
import { requestUploadSignatureAction, confirmUploadAction } from "@/app/actions/media.actions";

type ImageUploaderProps = {
  /** Called once per successfully uploaded file, with its public delivery URL. */
  onUploaded: (url: string) => void;
};

/**
 * Same direct-to-Cloudinary flow as the Media Library's dropzone, trimmed
 * down to "upload and hand back a URL" for embedding inside other forms
 * (Product/Material image fields). For the full library UI (gallery, alt
 * text, search) see components/admin/media-library/.
 */
export function ImageUploader({ onUploaded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError(null);
      setIsUploading(true);

      const signedResult = await requestUploadSignatureAction();
      if (!signedResult.ok) {
        setError(signedResult.error);
        setIsUploading(false);
        return;
      }
      const signed = signedResult.data;

      for (const file of Array.from(fileList)) {
        try {
          const form = new FormData();
          form.append("file", file);
          form.append("api_key", signed.apiKey);
          form.append("timestamp", String(signed.timestamp));
          form.append("signature", signed.signature);
          form.append("folder", signed.folder);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error("Upload failed");
          const result = await res.json();

          const confirmed = await confirmUploadAction({
            publicId: result.public_id,
            url: result.secure_url,
            folder: signed.folder,
            resourceType: "IMAGE",
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            name: file.name,
          });
          if (!confirmed.ok) throw new Error(confirmed.error);

          onUploaded(result.secure_url as string);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
        }
      }
      setIsUploading(false);
    },
    [onUploaded]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      style={{
        border: `1px dashed ${isDragging ? "#8C6A45" : "#E4E1DC"}`,
        background: isDragging ? "#F6F4F1" : "transparent",
        padding: "24px 16px",
        textAlign: "center",
        fontSize: 12,
        color: "#6B6862",
      }}
    >
      {isUploading ? (
        <span>Uploading…</span>
      ) : (
        <label style={{ cursor: "pointer" }}>
          Drop images here, or <span style={{ color: "#8C6A45", textDecoration: "underline" }}>browse</span>
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} style={{ display: "none" }} />
        </label>
      )}
      {error && <p style={{ color: "#B3261E", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
