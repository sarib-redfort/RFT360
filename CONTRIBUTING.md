# Contributing to RFT360

Conventions for working in this repo. Read alongside `README.md`.

## What this is

RFT360 is an **internal employer-branding platform** (not a client-services
site) with a full CMS. The site presents itself purely as RFT360 — never as a
parent/group brand. Turborepo monorepo:

- `apps/api` — NestJS REST API, the system of record and trust boundary.
- `apps/web` — Next.js public site + `/admin` CMS.
- `packages/shared` — the contract between them: enums, Zod schemas, constants.

## Golden rules

1. **`packages/shared` is the single source of truth.** Enums here mirror the
   Prisma schema; Zod schemas here validate BOTH the API and the web forms.
   Change a validation rule in one place only — here. Rebuild it
   (`npm run build --workspace=@rft360/shared`) after edits; the API imports its
   compiled output.
2. **The API is the trust boundary.** All rich text is re-sanitised server-side
   (`common/utils/sanitize.ts`) before persistence, regardless of the editor.
   Never trust client input.
3. **Public endpoints return PUBLISHED only.** `BaseCrudService` enforces this;
   admin endpoints (guarded by `@Roles`) see all statuses.
4. **Enum ↔ Prisma sync.** If you add a value to a Prisma enum, mirror it in
   `packages/shared/src/enums.ts` (and vice-versa).

## API conventions (`apps/api`)

- **Feature module = folder** under `src/modules/*`, wired into
  `modules/content.module.ts`. Global infra (Prisma, Redis, Storage, Mail,
  Audit, Revalidation) is provided by `@Global()` modules.
- **CRUD is inherited, not repeated.** A publishable entity's service extends
  `PublishableCrudService` (create/update/publish/reorder + slug + revalidate +
  audit); its controllers extend `AbstractAdminCrudController` /
  `AbstractPublicCrudController` and only supply the path, role and Zod schemas.
  To add an entity: Prisma model → shared schema → a small service → thin
  controllers → register the module. Mirror an existing one (e.g. `events`).
- **Validation** uses `ZodValidationPipe` / the `@ZodBody(schema)` decorator with
  a `@rft360/shared` schema. The global `AllExceptionsFilter` maps Zod/Prisma
  errors to the stable `ApiErrorBody` shape.
- **Rich text** columns are stored as `<field>Json` + sanitised `<field>Html`;
  services map the editor's `{ json, html }` via `mapRichText`.
- **Auth**: `JwtAuthGuard` is global (routes are private by default; mark public
  reads with `@Public()`). `@Roles(Role.X)` + `RolesGuard` for authorization —
  rank-based, so `@Roles('ADMIN')` also admits `SUPER_ADMIN`.
- **Injection-token files** live apart from their module (see
  `redis/redis.constants.ts`) to avoid import cycles that leave `@Inject()`
  tokens undefined. There is a DI-graph test (`test/app-bootstrap.spec.ts`) that
  catches this class of bug — run the API tests after wiring changes.

## Web conventions (`apps/web`)

- **Server Components fetch via `lib/api.ts`** (`apiGet`/`apiList`) with cache
  tags from `CACHE_TAGS`; the API's revalidation webhook (`/api/revalidate`)
  invalidates them.
- **Admin reads** use `lib/admin-api.ts` (server, Bearer token attached,
  `cache: 'no-store'`); **admin mutations** are server actions in
  `app/admin/actions.ts`; **client-side admin calls** go through the
  authenticated proxy (`/api/admin-proxy/*` → `lib/admin-client.ts`) so the token
  never reaches the browser.
- **The CMS is config-driven.** `lib/admin-resources.ts` describes each simple
  entity; the generic `[resource]` list/new/edit/reorder routes render them.
  Complex areas (homepage, pages, media, gallery, navigation, settings, users,
  inboxes) have bespoke pages. To expose a new entity in the CMS, add a
  `ResourceConfig` — no new routes needed unless it's bespoke.
- **Design tokens** live in `src/styles/globals.css` as CSS custom properties for
  both themes; Tailwind v4 maps them via `@theme inline`. Components read
  `var(--…)`. Dark is default; `data-theme="light"` overrides. Fonts: Manrope
  (headings), Inter (body) via `lib/fonts.ts`.
- **Homepage** is fully data-driven: `SectionRenderer` switches on section
  `type`. Add a section type = one case + an API data resolver in
  `HomepageService.resolveSectionData`.

## Design fidelity

The look is ported from the original static site (`rft360 - Copy/`), with two
deliberate brand corrections: accent red `#e60021 → #DE181B`, fonts
`Outfit/JetBrains → Manrope/Inter`. Preserve the glow orbs, reveal animations,
card hover lift and gradient headings when adding UI. `/styleguide` is the
reference.

## Before you commit

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

## Default content

`apps/api/prisma/seed-data.ts` holds the site's **default content** — the copy a
fresh install starts with. Everything in it is editable afterwards in the CMS.

`npm run db:seed` is create-only: it fills in missing rows and leaves existing
ones alone, so editor changes are never clobbered. When you change the shipped
copy and want it applied to a database that already has content, run
`npm run db:seed:refresh` — that mode overwrites existing rows and prunes
services/industries no longer in the data file.

Commit the Prisma migration when you change `schema.prisma`
(`npm run db:migrate -- --name your_change`).
