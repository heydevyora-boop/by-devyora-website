"use client";

import { useRouter } from "next/navigation";
import type { Asset } from "@prisma/client";
import { MediaDropzone } from "./dropzone";
import { Gallery } from "./gallery";

export function MediaLibraryClient({ assets }: { assets: Asset[] }) {
  const router = useRouter();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <MediaDropzone onUploaded={() => router.refresh()} />
      </div>
      <Gallery assets={assets} onChanged={() => router.refresh()} />
    </div>
  );
}
