# Module 9 — Inquiry CRM, Module 10 — Blog

Two independent features shipped together for scheduling reasons, not
because they share code — CRM extends Module 1's `Enquiry`; Blog extends
Module 1's `BlogPost`/`BlogCategory`.

## Module 9 — Inquiry CRM

```
prisma/schema.prisma          # EnquiryStatus expanded, + assignedTo, + source, + EnquiryNote
lib/
  validations/enquiry.ts       # + assignEnquirySchema, addFollowUpNoteSchema, enquiryListQuerySchema
  repositories/
    enquiry.repository.ts      # + findPaginated, findAllFiltered, assign, addNote, countByStatus
    user.repository.ts         # new — minimal, just for the "assign to" picker
app/
  actions/enquiry.actions.ts    # + assignEnquiryAction, addFollowUpNoteAction, deleteEnquiryAction
  admin/enquiries/
    page.tsx                    # rebuilt: search/filter/pagination/status counts/export
    [id]/page.tsx                # new — lead detail + CRM panel
    export/route.ts              # new — CSV download, respects active filters
components/admin/enquiry-crm-panel.tsx   # client: status/assign/notes, all in one panel
```

### Lead capture

Unchanged from Module 1 — `submitEnquiry` (the public Contact form action)
still writes an `Enquiry` row. What's new: every enquiry now gets a
`source` field (defaults to `"website"`) so a future integration — a
trade-show lead list import, a referral form — has somewhere to record where
a lead came from without adding a new column later.

### Status (the pipeline)

`EnquiryStatus` went from a flat `NEW / CONTACTED / CLOSED` to a real
funnel:

```
NEW → CONTACTED → QUALIFIED → PROPOSAL_SENT → WON
                                             → LOST
```

The old `CLOSED` value is gone (migration will need `CLOSED` rows manually
reassigned to `WON` or `LOST` if you have any). `StatusBadge` has colors for
all six.

### Follow-up

`EnquiryNote` is an append-only log per enquiry — free-text notes with an
optional `followUpDate`. The detail page renders it newest-first with a form
above it; there's deliberately no "edit" or "delete" on individual notes —
a CRM log is more useful as an honest history than as a tidied-up one.
`EnquiryRepository.findUpcomingFollowUps()` exists for a future "my tasks
today" dashboard widget but isn't wired into the UI yet (see gaps below).

### Assign salesperson

`Enquiry.assignedToId` → `User`. Any user can be assigned — there's no
`SALES` role; `ENQUIRY_MANAGE` (which `ADMIN` has, `EDITOR` doesn't) gates
who can *do* the assigning, but the picker itself lists every user
(`UserRepository.listForPicker()`), regardless of role. If your team wants
assignment restricted to a subset of users, that's a filter on the picker's
query, not a schema change.

### Export CSV

`GET /admin/enquiries/export` — reads the *same* query params as the list
page (`?status=&type=&assignedToId=&q=`), so "export what I'm currently
looking at" is just adding `/export` to the current URL rather than a
separate export flow with its own filter UI to keep in sync. Streams a
`Content-Disposition: attachment` response; no temp file, no background job.

---

## Module 10 — Blog

```
prisma/schema.prisma           # + Tag, BlogPostTag, BlogPost.metaTitle/metaDescription
lib/
  validations/blog.ts           # + tagIds, metaTitle/metaDescription, blogListQuerySchema
  repositories/blog.repository.ts   # + findPaginated, findRelated, listPublishedSlugs
                                     # + BlogCategoryRepository, TagRepository (new exports)
app/
  actions/blog.actions.ts        # + category/tag CRUD actions, publishBlogPostAction
  admin/blog/
    page.tsx, new/, [id]/          # post CRUD
    categories/, tags/              # simple managers
  (site)/journal/
    page.tsx                        # public listing — search, category, tag filters
    [slug]/page.tsx                  # public detail — Article JSON-LD, related posts
components/admin/
  rich-editor.tsx                # Tiptap
  blog-post-form.tsx              # full form, lazy-loads the editor
  blog-category-form.tsx, tag-form.tsx   # inline create forms
```

### Rich editor

Tiptap (`@tiptap/react` + `starter-kit` + `link`/`image` extensions), stored
as HTML in `BlogPost.content`. The toolbar covers bold/italic/headings
(H2/H3)/lists/blockquote/links, plus an image button that reuses Module 5's
`ImageUploader` — dropping an image uploads it to Cloudinary and inserts it
at the cursor.

**It's loaded lazily**: `blog-post-form.tsx` imports it via
`next/dynamic(..., { ssr: false })` rather than a plain import. Tiptap
initializes against the DOM and isn't needed anywhere outside the post
editor route, so a static or plain `import` would put it in every admin
page's bundle for no reason. See Module 12 for the general lazy-loading
policy this follows.

**Rendering on the public side** is a plain
`dangerouslySetInnerHTML={{ __html: post.content }}` on the journal detail
page — safe here specifically because content only ever comes from the
Tiptap editor behind `BLOG_CREATE`/`BLOG_UPDATE` permission checks, never
from public input. If you ever add public comments or any other
user-submitted HTML, that content needs sanitization (e.g. `sanitize-html`)
before it goes anywhere near `dangerouslySetInnerHTML` — this pattern is not
safe to copy for that case.

### Categories & Tags

`BlogCategory` already existed (Module 1); it just had no admin UI — added
now at `/admin/blog/categories`, a simple list + inline create form (same
shape as Module 4's Category manager, deliberately not full CRUD-with-edit
since a category rename is rare and easy to do as delete-and-recreate at
this scale).

`Tag` is new — many-to-many via `BlogPostTag`. The post form uses a native
multi-select (`<select multiple>`) rather than a tag-input component with
autocomplete/create-on-the-fly; that's a reasonable upgrade if tagging
becomes a frequent, high-volume workflow, but wasn't worth a new dependency
for what's currently a handful of tags.

### SEO

`BlogPost.metaTitle`/`metaDescription` are optional overrides — the journal
detail page's `generateMetadata` uses `post.metaTitle ?? post.title` and
`post.metaDescription ?? post.excerpt`, so most posts need zero SEO-specific
input while still allowing a specific post to override for search intent
that doesn't match its on-page headline. `articleJsonLd()` (Module 7) is
wired on every published post. `generateStaticParams` + `revalidate = 3600`
prebuild every published post at deploy time (see Module 12).

### What's deliberately not built

- **No comments.** Not in scope, and the content-safety note above is
  exactly why: comments would need a moderation queue and HTML sanitization
  neither of which exist here.
- **No draft preview URL** (a `/journal/[slug]?preview=token` that bypasses
  `published: true`). Admins currently preview by using the "Published"
  checkbox itself, or by viewing the rendered content in the editor.
- **No revision history.** `updatedAt` tells you a post changed; it doesn't
  tell you what changed or let you roll back.
- **CRM**: no email/SMS notifications on assignment or new leads — this is
  simply not wired to a mail provider. `submitEnquiry` and
  `assignEnquiryAction` are the two natural hook points if you add one.
