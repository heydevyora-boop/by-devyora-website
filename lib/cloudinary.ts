import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "bydevyora";

/**
 * Signs a direct-to-Cloudinary upload so the browser can POST the file bytes
 * straight to Cloudinary (never through our server), while we still control
 * which folder/params are allowed. The client sends this signature + the
 * same params back to Cloudinary's /upload endpoint.
 */
export function signUpload(params: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = { timestamp, folder: CLOUDINARY_FOLDER, ...params };
  const signature = cloudinary.utils.api_sign_request(toSign, process.env.CLOUDINARY_API_SECRET!);

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    folder: CLOUDINARY_FOLDER,
    ...params,
  };
}

export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
