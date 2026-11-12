# Module 5 — Media Library

Cloudinary-backed media library, replacing the uploadthing wiring from
Module 3/4. `ImageUploader`/`FileUploader` (used inside the Product/Material/
Download admin forms) now upload through Cloudinary too, so there's one
upload pipeline for the whole admin.

## Files

```
prisma/schema.prisma           # Asset model extended: publicId, folder, resourceType, width/height/bytes
lib/
  cloudinary.ts                 # server-only: SDK config, signUpload(), deleteFromCloudinary()
  cloudinary-url.ts             # client-safe: buildOptimizedUrl() — no SDK import, zero deps
  validations/media.ts          # confirmUploadSchema, updateAssetAltSchema, mediaListQuerySchema
  repositories/media.repository.ts
app/actions/media.actions.ts    # requestUploadSignatureAction, confirmUploadAction, updateAssetAltAction, deleteAssetAction
app/admin/media/page.tsx        # library: search, type filter, "missing alt" filter, pagination
components/
  admin/media-library/
    dropzone.tsx                 # multi-file drag&drop, direct-to-Cloudinary, per-file progress
    gallery.tsx                  # grid, inline alt editor, delete, copy URL
    media-library.tsx            # client wrapper (dropzone + gallery + router.refresh())
  admin/image-uploader.tsx        # single-purpose uploader used inside other forms
  admin/file-uploader.tsx         # same, for PDFs
  shared/cloudinary-image.tsx     # public-facing <CloudinaryImage publicId=... /> — used in Module 6
```

## How uploads work (direct-to-Cloudinary, signed)

Files never pass through our server — the browser uploads straight to
Cloudinary, which avoids Server Action body-size limits and keeps large image
uploads off our compute:

1. Client calls `requestUploadSignatureAction()` (permission-gated) → gets
   back `{ signature, timestamp, apiKey, cloudName, folder }`.
2. Client `POST`s the file directly to
   `https://api.cloudinary.com/v1_1/{cloudName}/{image|raw}/upload` with that
   signature attached — Cloudinary trusts it because it was signed
   server-side with `CLOUDINARY_API_SECRET`, which the browser never sees.
3. Cloudinary returns `{ public_id, secure_url, width, height, bytes, format }`.
4. Client calls `confirmUploadAction(...)` with that metadata, which writes
   the `Asset` row (this is the only round-trip through our own server).

`MediaDropzone` (the full library uploader, multi-file + progress bars) and
`ImageUploader`/`FileUploader` (single-file, embedded in other forms) both
follow this exact flow — the plumbing is duplicated rather than shared
because the UI needs differ enough (progress-per-file vs. single spinner)
that a shared abstraction would've been more indirection than it saved.

## ALT tags

`Asset.alt` is nullable in the schema (nothing blocks an upload from
completing without one), but:
- The gallery's alt input has an amber background/border when empty, so
  missing alt text is visually obvious while browsing.
- `MediaRepository.countMissingAlt()` powers a small warning chip at the top
  of the library ("3 images missing alt text").
- `?missingAltOnly=true` filters the gallery down to exactly those.

This is a deliberate soft-enforcement — blocking upload on alt text would
mean writing decent alt copy under upload pressure, which produces worse alt
text than writing it a minute later while looking at the thumbnail.

## Optimization

`buildOptimizedUrl(publicId, { width, height, crop, quality })` appends
`f_auto` (Cloudinary serves AVIF/WebP/JPEG depending on what the requesting
browser supports) and `q_auto` (perceptual quality compression — usually
30-50% smaller than a fixed quality setting with no visible difference) to
every delivery URL. Two consumers:

- **Admin gallery thumbnails** — `w_320,c_fill` keeches thumbnail requests
  small regardless of the original upload size.
- **`<CloudinaryImage publicId="..." />`** (`components/shared/cloudinary-image.tsx`) —
  a drop-in for `next/image` on public pages, using a custom `loader` so
  Cloudinary (not Next's built-in image optimizer) handles resizing —
  avoids double-processing the image and lets Cloudinary's CDN cache the
  transformed variant.

## Setup

```bash
npm install cloudinary
```

Add to `.env` (see `.env.example`):
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLOUDINARY_FOLDER="bydevyora"
```

Cloud name is intentionally `NEXT_PUBLIC_*` — it's not a secret (it's visible
in every delivery URL anyway) and both server (`lib/cloudinary.ts`) and
client (`lib/cloudinary-url.ts`) code need it. API key/secret stay
server-only and are never sent to the browser — only the signed, time-boxed
signature is.

## Migration note

Run `npx prisma migrate dev --name cloudinary_media` — this drops the old
`key`/`mimeType`/`size` columns on `Asset` in favor of
`publicId`/`format`/`bytes`/`width`/`height`/`folder`/`resourceType`. If you
had uploadthing-era `Asset` rows, they won't map cleanly (different storage
backend entirely) — this assumes a fresh media library.
