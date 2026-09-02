"use client";

import { useState } from "react";
import { requestUploadSignatureAction, confirmUploadAction } from "@/app/actions/media.actions";

type FileUploaderProps = {
  /** Called once with the uploaded file's URL and size in bytes. */
  onUploaded: (result: { url: string; size: number }) => void;
};

/** PDF/raw-file counterpart to ImageUploader, used by the Downloads form. */
export function FileUploader({ onUploaded }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsUploading(true);

    const signedResult = await requestUploadSignatureAction();
    if (!signedResult.ok) {
      setError(signedResult.error);
      setIsUploading(false);
      return;
    }
    const signed = signedResult.data;

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("signature", signed.signature);
      form.append("folder", signed.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/raw/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();

      const confirmed = await confirmUploadAction({
        publicId: result.public_id,
        url: result.secure_url,
        folder: signed.folder,
        resourceType: "RAW",
        format: result.format,
        bytes: result.bytes,
        name: file.name,
      });
      if (!confirmed.ok) throw new Error(confirmed.error);

      onUploaded({ url: result.secure_url, size: result.bytes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={{ border: "1px dashed #E4E1DC", padding: "20px 16px", textAlign: "center", fontSize: 12, color: "#6B6862" }}>
      {isUploading ? (
        <span>Uploading…</span>
      ) : (
        <label style={{ cursor: "pointer" }}>
          Drop a PDF here, or <span style={{ color: "#8C6A45", textDecoration: "underline" }}>browse</span>
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: "none" }} />
        </label>
      )}
      {error && <p style={{ color: "#B3261E", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
