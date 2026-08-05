import Image, { type ImageProps } from "next/image";
import { buildOptimizedUrl } from "@/lib/cloudinary-url";

type CloudinaryImageProps = Omit<ImageProps, "src" | "loader"> & {
  publicId: string;
};

/**
 * Drop-in replacement for next/image when the source is a Cloudinary asset.
 * Uses a custom loader so Next's own image optimizer is bypassed in favor of
 * Cloudinary's (f_auto + q_auto — best format per browser, perceptual quality
 * compression) at whatever width Next requests for the current viewport/DPR.
 */
export function CloudinaryImage({ publicId, alt, ...props }: CloudinaryImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      loader={({ width, quality }) => buildOptimizedUrl(publicId, { width, quality: quality ?? "auto" })}
      src={buildOptimizedUrl(publicId, { width: typeof props.width === "number" ? props.width : undefined })}
    />
  );
}
