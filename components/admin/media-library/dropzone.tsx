"use client";

import { useState, useRef } from "react";

interface MediaDropzoneProps {
  onUploaded: () => void;
}

export function MediaDropzone({ onUploaded }: MediaDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      onUploaded();
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      style={{
        border: `2px dashed ${isDragging ? "#0070f3" : "#ccc"}`,
        borderRadius: 8,
        padding: 32,
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: isDragging ? "#f0f7ff" : "transparent",
        transition: "all 0.3s ease",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept="image/*,.pdf,.doc,.docx"
      />

      {isUploading ? (
        <div>
          <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
            Uploading files...
          </p>
        </div>
      ) : (
        <div>
          <p style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 500 }}>
            📁 Drop files here or click to browse
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
            Supported: Images, PDF, DOC, DOCX
          </p>
        </div>
      )}
    </div>
  );
}
