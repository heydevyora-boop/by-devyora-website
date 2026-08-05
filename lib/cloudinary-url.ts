/**
 * Pure string-building, deliberately with zero imports from the `cloudinary`
 * SDK (that package pulls in Node core modules and will break if imported
 * from a Client Component). Safe to use anywhere — admin gallery, public
 * pages, `<CloudinaryImage>`.
 */
export type OptimizedImageOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb";
  quality?: "auto" | number;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Builds a transformed delivery URL from a public_id — f_auto (best format
 * per-browser: AVIF/WebP/JPEG) and q_auto (perceptual quality compression)
 * are the two transformations that matter most for page weight; width/height/
 * crop are applied on top when the caller knows the slot size.
 */
export function buildOptimizedUrl(publicId: string, opts: OptimizedImageOptions = {}) {
  const parts = ["f_auto", `q_${opts.quality ?? "auto"}`];
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${parts.join(",")}/${publicId}`;
}

/**
 * Given any URL, injects Cloudinary's f_auto/q_auto transformation segment if
 * it's a Cloudinary delivery URL — safe no-op otherwise (e.g. the seed
 * data's Unsplash placeholder images, or any future non-Cloudinary source).
 * Useful anywhere the DB only stores a full `url` string rather than a
 * `publicId` (ProductImage, ProjectImage, MaterialImage) — buildOptimizedUrl()
 * above is preferred when a publicId is available directly.
 */
export function optimizeImageUrl(url: string, opts: OptimizedImageOptions = {}): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const parts = ["f_auto", `q_${opts.quality ?? "auto"}`];
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);

  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}
