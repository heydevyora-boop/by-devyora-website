# Module 1 — Database & Backend

Backend scaffold for the By Devyora site, generated from the entities visible
across your pages: Products (11 systems), Projects, Blog/Journal, Downloads,
Contact enquiries, Branches, and Manufacturing (steps/standards/certs).

## What's included

```
prisma/
  schema.prisma        # full data model, enums, relations
  seed.ts               # seeds real content pulled from your mock pages
lib/
  prisma.ts             # PrismaClient singleton (hot-reload safe, Prisma 7 driver-adapter)
  validations/          # Zod schemas (one per domain)
    product.ts
    project.ts
    blog.ts
    enquiry.ts
    download.ts
  repositories/         # Repository pattern — all DB access goes through these
    product.repository.ts
    project.repository.ts
    blog.repository.ts
    download.repository.ts
    enquiry.repository.ts
    branch.repository.ts   # also exports ManufacturingRepository
app/actions/             # Next.js Server Actions ("use server")
  enquiry.actions.ts     # public Contact form submission + admin status update
  product.actions.ts     # admin CRUD (role-gated)
  project.actions.ts     # admin CRUD (role-gated)
  blog.actions.ts        # editor/admin CRUD
  download.actions.ts    # admin CRUD
.env.example
```

## Data model summary

| Model | Purpose |
|---|---|
| `User`, `Account`, `Session`, `VerificationToken` | NextAuth (Credentials + bcrypt), admin/editor roles |
| `Product`, `ProductSpec`, `ProductApplication`, `ProductImage` | The 11 architectural systems (GRC, FRP, Terracotta…) |
| `Project`, `ProjectImage`, `ProjectProduct` | Portfolio, with a join table linking projects to the products used |
| `BlogCategory`, `BlogPost` | Journal articles |
| `DownloadFile` | Catalogues / technical sheets / brochures |
| `Branch` | Offices & showrooms (Contact page) |
| `Enquiry` | Contact form submissions (Architect/Dealer/General) |
| `ManufacturingStep`, `FacilityStat`, `Certification` | Manufacturing page content |
| `Asset` | Generic uploadthing-backed file/image record |

Enums: `Role`, `ProjectType`, `EnquiryType`, `EnquiryStatus`,
`DownloadCategory`, `FacilityStatType`.

## Setup

Every dependency this module needs (`pg`, `@prisma/adapter-pg`, `dotenv`,
`tsx`, etc.) is already in the root `package.json` — just:

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and DIRECT_URL
npx prisma migrate dev --name init
npx prisma db seed
```

### Why there's both a `prisma.config.ts` and a driver adapter in `lib/prisma.ts`

Prisma 7 removed `url`/`directUrl` from `schema.prisma`'s `datasource`
block entirely, and removed the old zero-argument `new PrismaClient()` in
favor of an explicit driver adapter. Two separate places now need a
connection string, for two different consumers:

- **`prisma.config.ts`** (project root) — read by the Prisma **CLI**
  (`migrate`, `db seed`, `studio`). Uses `DIRECT_URL`.
- **`lib/prisma.ts`** — the **running app**. Constructs a `PrismaPg` adapter
  from `DATABASE_URL` and passes it to `new PrismaClient({ adapter })`.

This isn't duplication for its own sake — the CLI's migration commands need
a direct (unpooled) connection that PgBouncer can't provide, while the app
at runtime wants the pooled connection so serverless functions don't
exhaust your database's connection limit. Both env vars can point at the
same local Postgres instance in dev; they diverge once you're on Neon (see
`README-deployment-performance.md`).

If you see `PrismaClientConstructorValidationError` or `The datasource
property 'url' is no longer supported in schema files`, you're likely
looking at an older Prisma 6-style setup guide — this project is already
on the Prisma 7 pattern described above.

## `lib/auth.ts` (not included — wire up to your NextAuth config)

The admin-gated actions (`product.actions.ts`, `project.actions.ts`,
`download.actions.ts`, `blog.actions.ts`) import `auth` from `@/lib/auth`,
matching the NextAuth v5 `auth()` helper pattern:

```ts
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const user = await prisma.user.findUnique({ where: { email: creds.email as string } });
        if (!user) return null;
        const valid = await bcrypt.compare(creds.password as string, user.passwordHash);
        return valid ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => { if (user) token.role = user.role; return token; },
    session: ({ session, token }) => { session.user.role = token.role; return session; },
  },
});
```

## Notes / assumptions

- **Database**: PostgreSQL (swap the `provider` in `schema.prisma` if you're using MySQL/SQLite).
- **Product "related systems"** and **Project "related projects"** are computed in the
  repository (order-based wraparound / same-type match) rather than stored — this mirrors
  the behavior already in your `By Devyora - Products.dc.html` and `Projects.dc.html` mocks.
- **File uploads**: the `Asset` model stores `uploadthing` file metadata; wire your
  `uploadthing` core route to call `prisma.asset.create(...)` on upload complete.
- Every server action validates with Zod before touching the database and returns a
  typed `{ ok, data | error }` shape so form components can render field-level errors.
