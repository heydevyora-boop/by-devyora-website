# Module 3 — Admin Dashboard, Module 4 — Material Management

These two shipped together because Module 4 changes the data model that
Module 3's CRUD screens are built on. The old Module 1 `Product` model (the
11 systems: GRC, FRP, Terracotta…) is renamed to `Material`. A real,
SKU-level `Product` now lives underneath it, alongside a `Category` taxonomy,
`ProductSpecification`, `ProductVariant`, and `ProductImage`.

## The new catalogue hierarchy

```
Material            "GRC", "FRP", "Terracotta"… (was Module 1's Product)
  └─ Product         SKU-level catalogue item, e.g. "GRC Facade Panel — Board Formed"
       ├─ ProductSpecification   key/value rows (panel thickness, fire rating…)
       ├─ ProductVariant         sellable configuration: size/finish/color/price/SKU
       │    └─ ProductImage      optionally scoped to one variant
       ├─ ProductImage           product-level gallery images
       └─ DownloadFile           product-scoped spec sheets (optional productId)

Category (self-referencing, one level of nesting)
  └─ Product.categoryId          cross-cuts Material — "Facades" can contain
                                  products from GRC, FRP, and Terracotta alike
```

Every renamed/added piece:

| Before (Module 1) | Now |
|---|---|
| `Product`, `ProductSpec`, `ProductApplication`, `ProductImage` | `Material`, `MaterialSpec`, `MaterialApplication`, `MaterialImage` |
| `ProjectProduct` (join table) | `ProjectMaterial` — `Project.materials`, not `Project.products` |
| `lib/repositories/product.repository.ts` → `ProductRepository` | `lib/repositories/material.repository.ts` → `MaterialRepository` |
| `lib/validations/product.ts` | `lib/validations/material.ts` |
| `app/actions/product.actions.ts` | `app/actions/material.actions.ts` |
| *(new)* | `Category`, `Product` (SKU), `ProductSpecification`, `ProductVariant`, new `ProductImage` |

`PERMISSIONS` in `lib/permissions.ts` grew to match: `MATERIAL_CREATE/UPDATE/DELETE`,
`CATEGORY_MANAGE`, `PRODUCT_CREATE/UPDATE/DELETE/PUBLISH`, `VARIANT_MANAGE`.
EDITORs can create/update products and manage variants; everything else
(materials, categories, publishing, deleting) is ADMIN-only — adjust
`ROLE_PERMISSIONS` if that split doesn't match how your team actually works.

**Run a migration after pulling this in**, since it renames tables:
```bash
npx prisma migrate dev --name material_product_catalog
npx prisma db seed
```

## Module 3 — Admin Dashboard

```
components/admin/
  data-table.tsx       # generic, presentational table — no fetching inside it
  pagination.tsx        # plain <Link>s that update ?page=, no client JS needed
  search-input.tsx      # client: debounced, writes ?q= to the URL
  filter-select.tsx     # client: writes any ?key= to the URL
  delete-button.tsx     # confirm() + useTransition, calls any (id) => ActionState action
  status-badge.tsx      # colored pill for DRAFT/PUBLISHED/NEW/etc.
  product-form.tsx       # full form: specs/variants/images as dynamic field arrays
  material-form.tsx      # same pattern for materials (specs/applications/images)
  category-form.tsx      # simple form with parent picker
  download-form.tsx      # file form with product-scoping and uploader
  image-uploader.tsx      # uploadthing dropzone → image URLs
  file-uploader.tsx       # uploadthing dropzone → PDF URL + size

app/admin/
  page.tsx                          # dashboard: stat cards + recent enquiries
  materials/  (page, new, [id])     # list + CRUD
  categories/ (page, new, [id])     # list + CRUD
  products/   (page, new, [id])     # list + CRUD — the flagship: search/filter/paginate
  downloads/  (page, new, [id])     # list + CRUD
  enquiries/page.tsx                 # from Module 2, unchanged
```

### The "URL is the state" pattern

`SearchInput` and `FilterSelect` are the only client components in the list
flow, and all they do is push `router.push(pathname + "?" + params)`. The
list pages themselves (`app/admin/products/page.tsx`) are Server Components
that read `searchParams`, validate them with `productListQuerySchema`
(`lib/validations/product.ts`), and call `ProductRepository.findPaginated()`.
No client-side fetching, no loading spinners to manage, and the URL is
shareable/bookmarkable/back-button-safe by construction.

`ProductRepository.findPaginated()` is the one to look at for the
pagination/search/filter mechanics — it builds a Prisma `where` from the
query, runs `findMany` + `count` in parallel, and returns
`{ items, total, page, perPage, totalPages }` straight into `<DataTable>` and
`<Pagination>`.

### CRUD forms

`product-form.tsx` is the reference implementation: `react-hook-form` +
`zodResolver(createProductSchema)`, with `useFieldArray` for
`specifications`, `variants`, and `images`. Submitting calls
`createProductAction`/`updateProductAction` (Module 1/2-style Server Actions
returning `ActionState`), and on success does `router.push` + `router.refresh()`.
`material-form.tsx` and `category-form.tsx` follow the same shape — copy this
pattern for any new entity.

### Images & file uploads

Rather than a standalone "Images" CRUD screen, images are managed as a
sub-resource inside the Product/Material forms (`useFieldArray` +
`<ImageUploader>`), which is how most admin UIs actually want it — you rarely
manage an image independent of the thing it illustrates. `ImageUploader` and
`FileUploader` wrap `uploadthing`'s `useUploadThing` hook:

```
app/api/uploadthing/core.ts    # file router: catalogImage (images), downloadFile (PDFs)
app/api/uploadthing/route.ts   # route handler
lib/uploadthing.ts             # generateReactHelpers() — typed useUploadThing/uploadFiles
```

Both endpoints are permission-gated in their `.middleware()` (reuses
`hasPermission` from Module 2) and write an `Asset` row on
`.onUploadComplete()` for a full audit trail of what was uploaded and by whom.

Install the extra packages this module needs:
```bash
npm install @hookform/resolvers @uploadthing/react
```
(`react-hook-form`, `zod`, and `uploadthing` are already in your
`package.json` from Module 1.)

## What's deliberately not built

- **Bulk actions** (multi-select + bulk delete/publish) — the `DataTable` has
  no selection state; add a checkbox column + a small selection store if you
  need this.
- **Sortable columns** — `findPaginated` takes a fixed `orderBy`; extend
  `productListQuerySchema` with a `sort` param and switch on it if you want
  clickable column headers.
- **Optimistic UI** — deletes/status changes wait for the server round-trip
  (`router.refresh()`), which is simpler to reason about but not instant.
- **A separate Variant management screen** — variants are edited inline on
  the Product form; if variants become complex enough to need their own
  list/detail pages, `ProductVariant` already has everything a repository
  needs (`sku`, `size`, `finish`, `color`, `price`, `inStock`).
