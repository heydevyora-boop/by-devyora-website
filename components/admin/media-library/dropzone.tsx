"use client";

import { useCallback, useRef, useState } from "react";
import { requestUploadSignatureAction, confirmUploadAction } from "@/app/actions/media.actions";

type UploadItem = {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "uploading" | "done" | "error";
  error?: string;
};

type DropzoneProps = {
  /** Called once per successfully uploaded + persisted file. Parent typically calls router.refresh(). */
  onUploaded: () => void;
  accept?: string; // e.g. "image/*" or "image/*,application/pdf"
};

function resourceTypeFor(file: File): "IMAGE" | "VIDEO" | "RAW" {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  return "RAW";
}

/** Uploads one file straight to Cloudinary using a signed request, reporting progress via XHR. */
function uploadToCloudinary(
  file: File,
  signed: Awaited<ReturnType<typeof requestUploadSignatureAction>> extends { ok: true; data: infer D } ? D : never,
  onProgress: (pct: number) => void
): Promise<{ public_id: string; secure_url: string; width?: number; height?: number; format?: string; bytes: number; resource_type: string }> {
  return new Promise((resolve, reject) => {
    const resourceType = resourceTypeFor(file).toLowerCase();
    const endpoint = `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType === "image" ? "image" : resourceType === "video" ? "video" : "raw"}/upload`;

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("signature", signed.signature);
    form.append("folder", signed.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export function MediaDropzone({ onUploaded, accept = "image/*,application/pdf" }: DropzoneProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const idCounter = useRef(0);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const signedResult = await requestUploadSignatureAction();
      if (!signedResult.ok) {
        setItems((prev) => [
          ...prev,
          { id: String(idCounter.current++), file: fileList[0], progress: 0, status: "error", error: signedResult.error },
        ]);
        return;
      }

      Array.from(fileList).forEach(async (file) => {
        const id = String(idCounter.current++);
        setItems((prev) => [...prev, { id, file, progress: 0, status: "uploading" }]);

        try {
          const result = await uploadToCloudinary(file, signedResult.data, (pct) =>
            setItems((prev) => prev.map((it) => (it.id === id ? { ...it, progress: pct } : it)))
          );

          const confirmed = await confirmUploadAction({
            publicId: result.public_id,
            url: result.secure_url,
            folder: signedResult.data.folder,
            resourceType: resourceTypeFor(file),
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            name: file.name,
          });

          if (!confirmed.ok) throw new Error(confirmed.error);

          setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: "done", progress: 100 } : it)));
          onUploaded();
        } catch (err) {
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, status: "error", error: err instanceof Error ? err.message : "Upload failed" } : it))
          );
        }
      });
    },
    [onUploaded]
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `1px dashed ${isDragging ? "#8C6A45" : "#E4E1DC"}`,
          background: isDragging ? "#F6F4F1" : "transparent",
          padding: "40px 20px",
          textAlign: "center",
          fontSize: 13,
          color: "#6B6862",
        }}
      >
        <label style={{ cursor: "pointer" }}>
          Drop files here, or <span style={{ color: "#8C6A45", textDecoration: "underline" }}>browse</span>
          <input type="file" accept={accept} multiple onChange={(e) => handleFiles(e.target.files)} style={{ display: "none" }} />
        </label>
        <p style={{ fontSize: 11, marginTop: 8, color: "#A6A29B" }}>Images and PDFs. Uploads go straight to Cloudinary.</p>
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</span>
              <div style={{ width: 120, height: 4, background: "#E4E1DC" }}>
                <div
                  style={{
                    width: `${item.progress}%`,
                    height: "100%",
                    background: item.status === "error" ? "#B3261E" : "#121110",
                    transition: "width 200ms ease",
                  }}
                />
              </div>
              <span style={{ width: 70, color: item.status === "error" ? "#B3261E" : "#6B6862" }}>
                {item.status === "error" ? "Failed" : item.status === "done" ? "Done" : `${item.progress}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
