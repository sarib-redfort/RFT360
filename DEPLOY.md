# Deploying RFT360

Free-tier deployment, end to end. Budget ~60–90 minutes for the first run.

| Piece | Service | Free tier | Why this one |
| --- | --- | --- | --- |
| Web (Next.js) | **Render** Free web service | 750 h/mo, sleeps after 15 min idle | One platform, one blueprint; `next start` needs no adapter |
| API (NestJS) | **Render** Free web service | shares the same 750 h/mo | Runs a persistent Node process without a card |
| Database | **Neon** Free | 0.5 GB, always-on | Render's own free Postgres **expires after 30 days** — Neon's doesn't |
| Cache | **Upstash** Redis Free | 10k commands/day | Optional. The API degrades gracefully without it |
| Media | **Supabase** Storage Free | 1 GB, S3-compatible | **Required** — see below. No card needed |

**Nothing in this stack asks for a credit card.** That is why media sits on
Supabase rather than Cloudflare R2: R2's free tier is bigger (10 GB, zero egress)
but Cloudflare requires a payment method on file before it will let you enable
R2 at all. Supabase Storage is S3-compatible, so if you later want R2's headroom
it is an env-var change with no code change — see "Switching to Cloudflare R2".

> **Object storage is not optional.** Render wipes the container filesystem on
> every deploy. With `STORAGE_DRIVER=local`, every image uploaded through the CMS
> disappears the next time you push. The API logs a warning about this at boot;
> treat it as an error.
>
> Budget roughly 600 KB per photo — the upload pipeline keeps the original plus
> thumbnail/medium/large WebP variants — so 1 GB is about 1,500 images.

**Free-tier reality check:** both Render services sleep after 15 minutes of
inactivity. A cold visit wakes the web service (~30 s), which then calls the API
and wakes that too, so the first page load after a quiet spell can take up to a
minute. There is no CDN tier in front to soften it — the Node server itself is
asleep. Render's Starter plan (~$7/mo per service) removes the sleep; nothing
else changes. Waking the API alone is enough for most visits, since pages are
cached once rendered.

---

## Before you start

Generate four secrets and keep them somewhere safe — you'll paste them in
several times:

```bash
# Run four times: JWT_SECRET, JWT_REFRESH_SECRET, REVALIDATE_SECRET, AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Also decide the CMS admin login now: a real email address and a strong password.
**The API refuses to boot in production** if secrets still contain `change-me`
or if the admin password is still `ChangeMe123!` — that guard is deliberate.

---

## Step 1 — Database (Neon)

1. Sign up at [neon.tech](https://neon.tech) → **Create project** → name `rft360`,
   pick the region closest to your users.
2. Copy the **pooled** connection string from the dashboard. It looks like:
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Save it as `DATABASE_URL`.

Use the **pooled** string (the host contains `-pooler`). Render's free instance
opens and closes connections as it sleeps and wakes; the direct endpoint runs
out of connections.

## Step 2 — Cache (Upstash) — optional

1. Sign up at [upstash.com](https://upstash.com) → **Create Redis database**.
2. Copy the `rediss://` URL (note the double `s` — it's TLS).
3. Save it as `REDIS_URL`.

Skipping this is fine. Redis is treated as an optimisation, never a dependency:
with it unreachable the API logs one warning and serves everything uncached.

## Step 3 — Media storage (Supabase Storage)

No payment method required.

1. Sign up at [supabase.com](https://supabase.com) → **New project**. Name it
   `rft360`, set a database password (you won't need it — Postgres lives on Neon),
   and pick a region.
2. **Storage** → **New bucket** → name `media` → toggle **Public bucket ON**.
   This matters: the site links images directly, so a private bucket renders
   every image as a broken icon.
3. **Project Settings → Storage → S3 access keys** → **New access key**. Copy the
   Access Key ID and Secret Access Key — **the secret is shown once**.
4. On that same S3 configuration page, copy the **endpoint** and **region**.

That gives you:

| Variable | Value |
| --- | --- |
| `S3_ENDPOINT` | `https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3` |
| `S3_BUCKET` | `media` |
| `S3_REGION` | your project's region, e.g. `us-east-1` — **copy it exactly** |
| `S3_ACCESS_KEY_ID` | from step 3 |
| `S3_SECRET_ACCESS_KEY` | from step 3 |
| `S3_PUBLIC_URL` | `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/media` |
| `S3_FORCE_PATH_STYLE` | `true` |

Three of these are easy to get subtly wrong:

- **`S3_FORCE_PATH_STYLE` must be `true`.** Supabase does not serve buckets as
  subdomains; with the default `false` every upload fails to resolve.
- **`S3_REGION` must match the project's actual region.** Requests are signed
  with AWS Signature V4, which includes the region — a mismatch is rejected as a
  signature error, not as a helpful "wrong region" message.
- **`S3_ENDPOINT` and `S3_PUBLIC_URL` use different hosts.** The S3 API lives on
  `<ref>.storage.supabase.co`; public reads are served from
  `<ref>.supabase.co/storage/v1/object/public/<bucket>`. Copying one into the
  other uploads fine and then serves nothing.

### Switching to Cloudflare R2 later

If you outgrow 1 GB and are willing to put a card on Cloudflare, no code changes
are needed — [s3.driver.ts](apps/api/src/modules/storage/drivers/s3.driver.ts)
sets no ACLs and reads everything from env. Create an R2 bucket, enable its
`r2.dev` subdomain, mint an Object Read & Write token, then swap to
`S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `S3_REGION=auto`,
`S3_FORCE_PATH_STYLE=false`, and `S3_PUBLIC_URL=https://pub-xxxx.r2.dev`.
Update `NEXT_PUBLIC_MEDIA_URL` on `rft360-web` to match and redeploy both.
Existing images stay on Supabase, so copy the bucket across before you retire it.

## Step 4 — API (Render)

1. Sign up at [render.com](https://render.com) with GitHub and grant access to
   the `RFT360` repo.
2. **New → Blueprint** → select the repo. Render reads [render.yaml](render.yaml)
   and prompts for every value marked `sync: false`.
3. It creates **both** services and prompts only for these:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled string (step 1) |
   | `REDIS_URL` | Upstash `rediss://` URL, or leave blank |
   | `REVALIDATE_SECRET` | any generated secret — the web service inherits it automatically |
   | `S3_*` (6 fields) | from step 3 |
   | `SMTP_*`, `MAIL_*` | see "Email" below; blank SMTP is safe |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | the CMS login you are creating |
   | `NEXT_PUBLIC_MEDIA_URL` | same string as `S3_PUBLIC_URL` |

   Everything else is set in the blueprint: `JWT_SECRET`, `JWT_REFRESH_SECRET`
   and `AUTH_SECRET` are generated by Render, and the cross-service URLs
   (`WEB_URL`, `CORS_ORIGINS`, `API_URL`, `NEXT_PUBLIC_API_URL`,
   `NEXT_PUBLIC_SITE_URL`) are fixed, because both services are on Render and
   their hostnames are deterministic.
4. **Apply**. The first build takes 5–8 minutes.
5. When it goes live, confirm: `https://rft360-api.onrender.com/health` returns
   `{"status":"ok"}`.

### Seed the database — once, and only once

The build already ran `prisma migrate deploy` (schema only — no content).
Now load the initial content and create your admin user.

Render's **Shell** tab is a paid feature, so run this from your own machine
against the production database. All three variables are required: without the
admin ones the script falls back to your local `.env` and creates an
`admin@redfort360.com` / `ChangeMe123!` account instead of yours.

```powershell
$env:DATABASE_URL        = '<your Neon connection string>'
$env:SEED_ADMIN_EMAIL    = '<your CMS login email>'
$env:SEED_ADMIN_PASSWORD = '<your CMS password>'

npm run db:seed --workspace=@rft360/api
```

Afterwards close that shell (or clear `$env:DATABASE_URL`), or your next local
`npm run dev` will point at production.

This is idempotent, but re-running it **resets homepage section copy, site
branding, page hero text and FAQ answers to the shipped defaults** — so any
edits you make in the CMS to those specific fields would be overwritten. Run it
now, then never again.

Every future deploy runs migrations automatically and leaves your content alone.

## Step 5 — Web (same blueprint)

Nothing to do. [render.yaml](render.yaml) declares **two** services, so the
Blueprint that created `rft360-api` also creates `rft360-web`. It prompts for a
single extra value:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_MEDIA_URL` | the same string you gave the API as `S3_PUBLIC_URL` |

Everything else is wired for you, because both services are on Render and their
URLs are therefore deterministic:

- `NEXT_PUBLIC_API_URL` / `API_INTERNAL_URL` → `https://rft360-api.onrender.com/api/v1`
- `NEXT_PUBLIC_SITE_URL` → `https://rft360-web.onrender.com`
- `AUTH_SECRET` → generated by Render
- `REVALIDATE_SECRET` → pulled from the API service via `fromService`, so the two
  can never drift. That was previously the single easiest thing to get wrong:
  a mismatch makes CMS publishes save happily and silently never reach the site.

On the API side, `WEB_URL` and `CORS_ORIGINS` are likewise pinned to
`https://rft360-web.onrender.com` — the old "put a placeholder in and fix it
later" dance is gone.

**If Render appends a suffix** because a service name was taken, the real URLs
will differ. Fix `WEB_URL`, `CORS_ORIGINS` and `NEXT_PUBLIC_SITE_URL` in the
dashboard and redeploy.

### The free-tier trade-off

Both services sleep after 15 minutes idle. A first visit after a quiet spell
wakes the web service (~30 s), which then calls the API and wakes that too — so
a cold visit can take up to a minute. Unlike a CDN-hosted front end, there are
no statically served pages to soften it, because the Node server itself is
asleep. Upgrading either service to Starter (~$7/mo) removes its sleep.

---

## Verify it works

1. `https://<vercel-url>` — homepage renders with images and styling.
2. `https://<vercel-url>/admin` — redirects to login.
3. Log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
   (First load may take ~30 s while Render wakes.)
4. **Media → Upload** an image. It succeeds and previews.
   → Confirms the storage credentials, CORS and the CSP.
5. **Homepage → Hero → edit the heading → Publish.** Reload the public homepage;
   the new text is there within seconds.
   → Confirms `WEB_URL` and the shared `REVALIDATE_SECRET`.
6. **Blog → New post**, add a cover image, publish. It appears on `/blogs`.
7. Submit the contact form; check it lands in **Admin → Inboxes**.

If step 5 fails but step 4 works, the problem is `WEB_URL` or a
`REVALIDATE_SECRET` mismatch — those are the only two things in that path.

---

## Email

Contact-form and job-application notifications need real SMTP. Cheapest working
options:

- **Gmail**: enable 2FA → create an [App Password](https://myaccount.google.com/apppasswords).
  `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`,
  `SMTP_USER=you@gmail.com`, `SMTP_PASSWORD=<app password>`.
- **Resend** (3,000 emails/mo free): `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=587`,
  `SMTP_USER=resend`, `SMTP_PASSWORD=<api key>`.
- **Brevo** (300/day free): `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`.

Set `MAIL_FROM` to an address on a domain you control and `MAIL_NOTIFY_TO` to
wherever applications should land. The rest of the site works without this — only
notification emails are affected.

---

## Custom domain

1. **Render** → `rft360-web` → **Settings → Custom Domains** → add `rft360.com`
   (and `www`). Point the DNS records Render shows you at it.
2. Update `NEXT_PUBLIC_SITE_URL` on `rft360-web` to `https://rft360.com` and
   redeploy — canonical URLs, OG tags and the sitemap are prerendered from it,
   so it must be right at build time.
3. Update `WEB_URL` and `CORS_ORIGINS` on `rft360-api` to the new domain.

Keep the `.onrender.com` URL in `CORS_ORIGINS` too (comma-separated) if you want
it to keep working alongside the custom domain.

---

## Day-two operations

**Deploying changes.** Push to `main`. Both platforms rebuild automatically;
Render applies pending migrations as the last step of its build. (Migrations run
in the build rather than as a `preDeployCommand` because pre-deploy commands
require a paid instance type — on the free plan they are silently ignored.)

**Schema changes.** Create the migration locally (`npm run db:migrate -- --name
your_change`) and commit `apps/api/prisma/migrations/`. Never run `migrate dev`
against production — it can drop data. The deploy runs `migrate deploy`, which
only applies what's pending.

**Backups.** Neon's free tier keeps ~24 h of history. For anything you'd hate to
lose, take a periodic dump:

```bash
pg_dump "$DATABASE_URL" -Fc -f rft360-$(date +%F).dump
```

**Rotating a secret.** `REVALIDATE_SECRET` is defined once on `rft360-api` and
inherited by `rft360-web` through `fromService`, so changing it in one place is
enough — the two cannot drift. Redeploy the web service afterwards so it picks
up the new value.

---

## Known limitations

Carried over from the build, so nothing surprises you after launch:

- **Seeded imagery is hotlinked from Unsplash**, not uploaded. Replace it in
  **Admin → Media** with real RFT360 photography before you announce the site.
- **Some inner-page section headings are still hardcoded** — e.g. Careers'
  "Current openings", About Culture's "What we stand for", Life at RFT360's
  "What you get", "Related reading", "Upcoming"/"Past events". Page heroes, body
  content and every listed item *are* CMS-driven; only these fixed section
  labels need a code change. Ask and I'll make them editable.
- **Render free-tier sleep** — see the reality check at the top.
- **`npm run db:seed` is a one-time step.** Re-running it resets homepage
  section copy, branding, page hero text and FAQ answers to shipped defaults.
