import { MediaRepository } from "@/lib/repositories/media.repository";
import { mediaListQuerySchema } from "@/lib/validations/media";
import { MediaLibraryClient } from "@/components/admin/media-library/media-library";
import { SearchInput } from "@/components/admin/search-input";
import { FilterSelect } from "@/components/admin/filter-select";
import { Pagination } from "@/components/admin/pagination";
import type { ListSearchParams } from "@/lib/list-params";

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const sp = await searchParams;
  const query = mediaListQuerySchema.parse({
    q: sp.q,
    resourceType: sp.resourceType,
    missingAltOnly: sp.missingAltOnly,
    page: sp.page,
    perPage: sp.perPage,
  });

  const [{ items, total, page, totalPages, perPage }, missingAlt] = await Promise.all([
    MediaRepository.findPaginated(query),
    MediaRepository.countMissingAlt(),
  ]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32 }}>Media library</h1>
        {missingAlt > 0 && (
          <span style={{ fontSize: 12, color: "#B3261E" }}>{missingAlt} image{missingAlt === 1 ? "" : "s"} missing alt text</span>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#6B6862", marginBottom: 24 }}>
        Backed by Cloudinary — uploads go straight from your browser to Cloudinary, optimized delivery (auto format
        + quality) happens automatically wherever <code>buildOptimizedUrl()</code> is used on the public site.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <SearchInput placeholder="Search by filename or alt text…" />
        <FilterSelect
          paramKey="resourceType"
          placeholder="All types"
          options={[
            { label: "Images", value: "IMAGE" },
            { label: "PDFs / files", value: "RAW" },
            { label: "Video", value: "VIDEO" },
          ]}
        />
        <FilterSelect
          paramKey="missingAltOnly"
          placeholder="All alt statuses"
          options={[{ label: "Missing alt text only", value: "true" }]}
        />
      </div>

      <MediaLibraryClient assets={items} />

      <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} searchParams={sp} basePath="/admin/media" />
    </div>
  );
}
