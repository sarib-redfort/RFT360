# RFT360

RFT360 — an internal **employer-branding platform** and enterprise website
with a full CMS. Showcases company culture, careers, life at RedFort, events and
a blog, with every piece of front-end content editable from a protected admin.

Built on the standard stack: **Next.js · NestJS · PostgreSQL · Redis ·
Auth.js**. The visual design is ported from the original static site and
corrected to the brand guide (`#DE181B` red, Manrope + Inter).

---

## Architecture

```
rft360/
├── apps/
│   ├── web/     Next.js 15 · React 19 · Tailwind v4 · Auth.js — public site + CMS
│   └── api/     NestJS 11 · Prisma 6 · PostgreSQL · Redis — REST API + business logic
├── packages/
│   ├── shared/  Types, enums and Zod schemas shared by both apps
│   └── config/  Base TypeScript config
├── docker-compose.yml   Postgres 16 + Redis 7 + Mailpit
└── turbo.json           npm workspaces + Turborepo
```

- **One validation source.** Zod schemas in `@rft360/shared` validate both the
  React forms and the API endpoints, so client and server rules never drift.
- **CMS → live site in seconds.** On publish, the API drops its Redis cache and
  calls the web app's `/api/revalidate`, which runs `revalidateTag()` — static
  pages stay fast but update on edit.
- **Auth.** Auth.js Credentials → NestJS (argon2, JWT access/refresh with
  rotation) → RBAC guards (`SUPER_ADMIN · ADMIN · EDITOR · VIEWER`). The token
  lives in the encrypted session cookie and is refreshed transparently.
- **Storage.** Pluggable driver — local disk by default, S3/R2 by env var. Sharp
  generates responsive WebP variants + blur placeholders.

---

## Prerequisites

- Node.js ≥ 20
- PostgreSQL 16 and Redis 7 — the easiest path is Docker (`docker compose up`),
  which provisions both with credentials matching `.env.example`.

---

## Getting started

```bash
# 1. Environment — copy and (for production) replace every secret.
cp .env.example .env
#   Generate real secrets:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# 2. Infrastructure (Postgres + Redis + Mailpit)
docker compose up -d
#   No Docker? Point DATABASE_URL / REDIS_URL at your own instances in .env.

# 3. Install
npm install

# 4. Database — migrate + seed realistic employer-branding content
npm run db:deploy      # applies prisma/migrations (use db:migrate in dev)
npm run db:seed

# 5. Run everything (web :3000 · api :4000)
npm run dev
```

Open:

- Public site — http://localhost:3000
- CMS — http://localhost:3000/admin (sign in with `SEED_ADMIN_EMAIL` /
  `SEED_ADMIN_PASSWORD` from `.env` — **change these before deploying**)
- API docs (Swagger) — http://localhost:4000/api/docs
- Captured dev email (Mailpit) — http://localhost:8025

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run web + api in watch mode |
| `npm run build` | Build all workspaces |
| `npm run typecheck` / `npm run lint` / `npm run test` | Quality gates |
| `npm run db:migrate` | Create + apply a migration (dev) |
| `npm run db:deploy` | Apply committed migrations (prod/CI) |
| `npm run db:seed` | Seed content + first admin |
| `npm run db:studio` | Prisma Studio |
| `npm run docker:up` / `docker:down` | Start/stop infra |

---

## Content model

Everything on the public site is a CMS record. Highlights:

- **Homepage** — the planner's 11-section flow (Hero → Who We Are → Services →
  Why Choose Us → Industries → Case Studies → Testimonials → FAQ → Latest Blogs →
  Contact → Footer), reorderable and toggleable from the CMS.
- **Pages** — the 8 planner routes with editable hero + SEO.
- **Blog** — posts (Tiptap editor), categories, tags, authors.
- **Careers** — jobs, departments, applications (with CV upload + JobPosting
  JSON-LD).
- **Events, Gallery, Testimonials, FAQs, Case Studies, Team, Values, Perks,
  Industries, Services**, and trust elements (logos, certifications, awards,
  statistics).
- **Structure** — site settings, navigation builder, media library, users +
  audit log.

Roles: `SUPER_ADMIN` and `ADMIN` manage everything including users/settings;
`EDITOR` manages content; `VIEWER` is read-only.

---

## Admin routes — where every piece of content is edited

Sign in at `/login`, then everything below lives under `/admin`. **Every string,
image and list on the public site is editable from one of these screens.**

| Route | What it controls | Min role |
|---|---|---|
| `/admin` | Dashboard — counts + recent activity | VIEWER |
| `/admin/homepage` | **Homepage sections** — drag to reorder, toggle visibility, edit each section's eyebrow / heading / accent / subheading / item count | EDITOR |
| `/admin/pages` → `/admin/pages/[id]` | The 8 site pages — hero eyebrow/heading/subheading, rich-text body, per-page SEO | EDITOR |
| `/admin/media` | **Media library** — drag-drop upload, alt text, delete (replace the seeded placeholder photos here) | EDITOR |
| `/admin/navigation` | Header + footer menus — add/edit/remove/reorder links | EDITOR |
| `/admin/settings` | Site name, tagline, logos, contact details, address, office hours, socials, footer text, copyright, SEO defaults, analytics IDs, maintenance mode | ADMIN |
| `/admin/users` | CMS accounts — invite, change role, reset password, deactivate | ADMIN |
| `/admin/submissions` | Contact-form inbox + CSV export | EDITOR |
| `/admin/applications` | Job applications inbox — status pipeline, CV download | EDITOR |
| `/admin/gallery` | Photo albums and their images | EDITOR |

### Config-driven content types

These all share the same list / create / edit / reorder screens:

| Route | Content |
|---|---|
| `/admin/posts` | Blog posts (Tiptap editor, cover image, category, tags, author) |
| `/admin/services` | "What Our Teams Do" cards |
| `/admin/industries` | "Domains We Work In" tiles |
| `/admin/case-studies` | Employee success stories |
| `/admin/testimonials` | Employee testimonials |
| `/admin/faqs` | FAQ entries |
| `/admin/events` | Events |
| `/admin/jobs` | Job openings |
| `/admin/departments` | Departments |
| `/admin/team` | Team members / leadership |
| `/admin/culture-values` | Culture values |
| `/admin/perks` | Perks & benefits |
| `/admin/statistics` | Headline stats (hero + stats band) |
| `/admin/certifications` | Certifications |
| `/admin/awards` | Awards |
| `/admin/client-logos` | Client / partner logos |

Each supports: `…` list · `…/new` create · `…/[id]` edit · `…/reorder` drag-order
(where ordering applies). Publish / unpublish / archive are row actions on the
list, and publishing triggers instant revalidation of the public site.

> **Placeholder imagery:** the seed attaches royalty-free Unsplash photos so the
> site looks complete out of the box. Replace them with real photography in
> **Admin → Media**; every reference updates automatically.

---

## Where uploaded images live (read before deploying)

This decides whether your media survives a deploy.

| `STORAGE_DRIVER` | Where files go | Survives redeploy? |
|---|---|---|
| `local` (default) | `apps/api/uploads` on the API server's disk | **Only** with a persistent volume mounted there |
| `s3` | S3 / Cloudflare R2 / MinIO bucket | Yes, always |

**Containers, Vercel, Heroku, Fly, App Runner and most PaaS have ephemeral
filesystems** — with `local`, every image an editor uploads is deleted on the
next deploy. For those, set:

```bash
STORAGE_DRIVER=s3
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ACCESS_KEY_ID=…
S3_SECRET_ACCESS_KEY=…
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com   # omit for AWS S3
S3_PUBLIC_URL=https://cdn.yourdomain.com                 # public base for the bucket
```

Nothing else changes — the app talks to a `StorageDriver` interface, so swapping
the env var is the whole migration. The API refuses to start with
`STORAGE_DRIVER=s3` unless the bucket and credentials are present, and warns at
boot if you run `local` in production.

`local` is fine for a VM/VPS where you mount a volume at `STORAGE_LOCAL_PATH`.

> The seeded placeholder photos are **hotlinked Unsplash URLs**, not uploads.
> They render anywhere but depend on Unsplash. Replace them with real uploads in
> **Admin → Media** before launch.

---

## Deployment notes

Pre-launch checklist:

- [ ] **Secrets** — generate real `JWT_SECRET`, `JWT_REFRESH_SECRET`,
      `AUTH_SECRET`, `REVALIDATE_SECRET`. The API *refuses to boot* in
      production while these still contain `change-me`.
      `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
- [ ] **Admin password** — change it in the CMS (or set a real
      `SEED_ADMIN_PASSWORD`; the default is rejected in production).
- [ ] **Storage** — see the section above. `s3` for ephemeral hosts.
- [ ] **URLs** — `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`,
      `API_INTERNAL_URL`, `WEB_URL` and `CORS_ORIGINS` must all point at the
      deployed hostnames. `WEB_URL` is what the API calls for revalidation; if
      it's wrong, CMS edits won't appear on the live site.
- [ ] **Redis** — optional but recommended. The app degrades to uncached reads
      when it's unavailable (it fails fast rather than blocking requests), but
      you lose response caching and rate-limit durability.
- [ ] **Migrations** — run `npm run db:deploy` on release. Run `db:seed` only on
      first deploy: re-seeding resets homepage section copy, site branding and
      FAQ text to the shipped defaults.
- [ ] **Email** — point `SMTP_*` at a real provider, or contact-form and
      job-application notifications silently no-op.
- [ ] **Replace placeholder imagery** in Admin → Media.

CI (`.github/workflows/ci.yml`) runs typecheck · lint · test · build against a
throwaway Postgres + Redis.

See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture conventions and where things live.
