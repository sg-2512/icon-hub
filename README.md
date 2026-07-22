# IconSearch (icon-hub)

**Live site:** [https://iconsearch.info](https://iconsearch.info)

IconSearch is a Next.js application for discovering, comparing, and exporting free SVG icon libraries. It combines a large programmatic SEO surface (library guides, comparisons, blog, use cases) with a production icon search engine backed by **354,000+** indexed icons, workspace carts, style presets, ZIP export, and optional Supabase cloud sync for signed-in users.

---

## Table of contents

- [What this project does](#what-this-project-does)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start (local development)](#quick-start-local-development)
- [Environment variables](#environment-variables)
- [Supabase setup (auth + cloud sync)](#supabase-setup-auth--cloud-sync)
- [Icon database pipeline](#icon-database-pipeline)
- [Search API](#search-api)
- [Icon search app features](#icon-search-app-features)
- [Site routes overview](#site-routes-overview)
- [Deployment (Vercel)](#deployment-vercel)
- [Scripts reference](#scripts-reference)
- [Data files](#data-files)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License & attribution](#license--attribution)

---

## What this project does

### Content & SEO layer
- **17 icon library landing pages** (`/icons/lucide-icons`, `/icons/heroicons`, …)
- **136 head-to-head comparison pages** (`/compare/lucide-icons-vs-heroicons`, …)
- **20 technical blog posts** in `content/blog/`
- **10 category pages** and **13 use-case guides**
- Framework-specific landing pages (`/react-icons`, `/nextjs-icons`, `/vue-icons`, …)
- Sitemap, robots.txt, JSON-LD, and `public/llms.txt` for crawlers

### Product layer (`/icon-search`)
- Server-side search across the full canonical icon index
- Filters: library, Iconify set, style, category, legal-safe-only
- Icon customizer (size, stroke, color) with live SVG preview
- Workspace **packs** (multiple carts) and **style presets**
- ZIP export: SVG, PNG, React TSX, Vue SFC, Tailwind/HTML, SVG sprite, metadata JSON
- Optional **Supabase auth** — email/password and OAuth (Google, GitHub) with cloud sync for packs and presets

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Fonts | JetBrains Mono, Inter (via `next/font`) |
| Icon data | Local npm packages + Iconify merge pipeline |
| Search | Custom in-memory API over gzipped JSON |
| Export | JSZip + browser Canvas (PNG rasterization) |
| Auth / persistence | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Analytics | Vercel Analytics, Google Analytics |
| Hosting | Vercel (production domain: `iconsearch.info`) |

---

## Project structure

```
icon-hub/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── icon-search/route.ts  # Main search API (349K+ icons)
│   │   └── blog/[slug]/route.ts  # Blog JSON endpoint
│   ├── icon-search/
│   │   ├── page.tsx              # SSR shell + initial 80 icons for SEO
│   │   └── IconSearchClient.tsx  # Search UI, cart, export, auth sync
│   ├── components/               # Navbar, AuthModal, DynamicHome, …
│   ├── blog/                     # Blog index + [slug] pages
│   ├── icons/                    # Library, category, collection pages
│   ├── compare/                  # Comparison hub + [pair] pages
│   ├── use-cases/                # Use-case guides
│   ├── layout.tsx                # Root layout, footer, analytics
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts
├── content/blog/                 # Markdown blog posts (gray-matter frontmatter)
├── data/
│   ├── canonical-icon-search.json.gz   # Production search index (committed)
│   ├── icon-search.snapshot.json       # Build stats / license breakdown
│   ├── icon-search (1).json            # SSR seed payload for /icon-search
│   ├── categories.ts, usecases.ts, static-pages.ts
│   └── libraries/                      # Per-library detail modules (16 files)
├── lib/
│   ├── icons.ts                  # Library definitions + comparison pairs
│   ├── blog.ts                   # Markdown reader
│   ├── exporter.ts               # ZIP export engine
│   └── supabase.ts               # Browser Supabase client
├── scripts/
│   ├── build-icon-db.mjs         # Extract icons from installed npm packages
│   └── merge-and-canonicalize.js # Merge local + Iconify → canonical .gz
├── public/                       # ads.txt, llms.txt, Google verification
└── scratch/                      # Ad-hoc dev/debug scripts (not in npm)
```

---

## Prerequisites

- **Node.js** 20+
- **npm** (or pnpm/yarn)
- **Supabase account** (optional — app works in local-only mode without it)
- **Vercel account** (for production deploy; already connected for this project)

---

## Quick start (local development)

```bash
# 1. Clone and install
git clone https://github.com/sg-2512/icon-hub.git
cd icon-hub
npm install

# 2. Add environment variables (see section below)
cp .env.local.example .env.local   # if you create an example file
# Or create .env.local manually

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Icon search works out of the box** if `data/canonical-icon-search.json.gz` is present (it is committed to the repo). You do not need to rebuild the icon database for basic local development.

---

## Environment variables

Create `.env.local` in the project root (never commit this file — it is gitignored).

```env
# Supabase public browser configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME

# Server-only extension authentication configuration
SUPABASE_SECRET_KEY=sb_secret_REPLACE_ME
DEVICE_TOKEN_PEPPER=replace-with-at-least-32-random-characters
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth | Project URL from Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For auth | Public `sb_publishable_...` key. Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is temporarily supported |
| `SUPABASE_SECRET_KEY` | Extension auth | Server-only `sb_secret_...` key. Never expose it in website client, VS Code, or Figma code |
| `DEVICE_TOKEN_PEPPER` | Extension auth | Random server-only value of at least 32 characters used to hash device and app tokens |
| `NEXT_PUBLIC_SITE_URL` | Extension auth | `http://localhost:3000` locally and `https://iconsearch.info` in production |

Without valid Supabase keys, the app runs in **local-only mode**: search, cart, and export still work via `localStorage`, but sign-in and cloud sync are disabled.

---

## Supabase setup (auth + cloud sync)

### 1. Create a Supabase project

1. [supabase.com](https://supabase.com) → New project (e.g. `icon-hub`)
2. Copy the **Project URL**, **publishable key**, and server-only **secret key** into `.env.local` and the matching Vercel environment variables

### 2. Run database schema

Run every file in `supabase/migrations/` in filename order in the Supabase SQL
Editor. The first migration creates product counters, atomic first-500 Founder
claims, short-lived device codes, hashed extension sessions, usage tables,
audit events, and row-level-security policies.

If email/password signup shows `Database error saving new user`, apply the
latest migrations again. That error usually means Supabase Auth reached the
`auth.users` insert but the `public.handle_new_user()` profile trigger failed.

The cloud workspace tables are shown below:

```sql
-- Profiles (user plan — reserved for future freemium)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Icon workspace packs
create table if not exists public.packs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Style presets
create table if not exists public.presets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  size integer not null default 24,
  stroke numeric not null default 1.5,
  color text not null default '#ffffff',
  created_at timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, plan) values (new.id, 'free') on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.packs enable row level security;
alter table public.presets enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "packs_select_own" on public.packs for select using (auth.uid() = user_id);
create policy "packs_insert_own" on public.packs for insert with check (auth.uid() = user_id);
create policy "packs_update_own" on public.packs for update using (auth.uid() = user_id);
create policy "packs_delete_own" on public.packs for delete using (auth.uid() = user_id);

create policy "presets_select_own" on public.presets for select using (auth.uid() = user_id);
create policy "presets_insert_own" on public.presets for insert with check (auth.uid() = user_id);
create policy "presets_update_own" on public.presets for update using (auth.uid() = user_id);
create policy "presets_delete_own" on public.presets for delete using (auth.uid() = user_id);

create index if not exists packs_user_id_idx on public.packs(user_id);
create index if not exists presets_user_id_idx on public.presets(user_id);
```

### 3. Configure auth URLs

Supabase → **Authentication → URL Configuration**

| Setting | Value |
|---------|--------|
| Site URL | `https://iconsearch.info` |
| Redirect URLs | `http://localhost:3000/auth/callback`, `https://iconsearch.info/auth/callback`, `https://www.iconsearch.info/auth/callback` |

### 4. OAuth (optional)

Enable **GitHub** and/or **Google** under **Authentication → Providers**. Use the Supabase callback URL shown in each provider’s settings when creating OAuth apps.

### 5. What syncs to the cloud

| Table | Data |
|-------|------|
| `packs` | Named workspace carts and their icon items (JSON) |
| `presets` | Saved size / stroke / color presets |
| `profiles` | User plan (`free` / `pro`) — schema exists; billing not wired yet |
| `products` / `entitlements` | VS Code and Figma free or Founder access |
| `device_codes` | Ten-minute browser approval handshakes |
| `extension_sessions` | Revocable 90-day app sessions stored only as hashes |

---

## Icon database pipeline

The search API reads **`data/canonical-icon-search.json.gz`** — a deduplicated, license-tagged index of all icons.

### Current stats (from `data/icon-search.snapshot.json`)

| Metric | Value |
|--------|-------|
| Total icons | 355,702 |
| Legal-safe icons | 257,891 |
| Compressed index size | ~8.6 MB |

### Pipeline overview

```
npm packages (Lucide, Tabler, …)
        ↓
scripts/build-icon-db.mjs  →  data/icon-search.json
        ↓
Iconify dataset (local, gitignored)
        ↓
scripts/merge-and-canonicalize.js  →  data/canonical-icon-search.json.gz
                                   →  data/icon-search.snapshot.json
```

### Rebuild from scratch

```bash
# Step 1: Extract icons from installed npm packages
npm run build:icons
# Output: data/icon-search.json

# Step 2: Merge with Iconify data (requires local Iconify JSON — see below)
node scripts/merge-and-canonicalize.js
# Output: data/canonical-icon-search.json.gz, updated snapshot
```

**Iconify source files** (gitignored, too large for GitHub):
- `data/iconify-icon-search.json` or
- `data/iconify-icon-search.json.gz`

If you only have the committed canonical `.gz`, you can run the app without rebuilding. Rebuild when adding libraries or refreshing Iconify data.

### Legal-safe licenses (included in default filter)

MIT, Apache-2.0, ISC, BSD-2/3-Clause, CC0-1.0, Unlicense, OFL-1.1

Icons with restrictive licenses (CC-BY-NC, GPL, etc.) remain in the index but are filtered out when **Legal-safe only** is enabled (default).

---

## Search API

**Endpoint:** `GET /api/icon-search`

### Query parameters

| Param | Default | Description |
|-------|---------|-------------|
| `q` | — | Search query (name + tags) |
| `lib` | `all` | Library slug or `iconify` for all Iconify sets |
| `iconifySet` | `all` | Iconify subset when `lib=iconify` |
| `style` | `all` | `stroke`, `solid`, `duotone`, `twotone`, `sharp` |
| `category` | `all` | Category id (`ai`, `arrows`, `security`, …) |
| `legalOnly` | `1` | `0` to include restricted-license icons |
| `sort` | `relevance` | `relevance`, `popular`, or default alphabetical |
| `page` | `1` | Page number |
| `limit` | `80` | Results per page |
| `ids` | — | Comma-separated icon ids (bulk fetch, limit 200) |

### Example

```
GET /api/icon-search?q=home&lib=lucide-icons&page=1&limit=20
```

### Rate limiting

120 requests per minute per IP (in-memory; resets on serverless cold starts).

### Response shape

```json
{
  "icons": [ { "id", "name", "library", "license", "svgUrl", "legalSafe", … } ],
  "total": 1140,
  "page": 1,
  "limit": 20,
  "totalPages": 57,
  "facets": {
    "libraries": ["lucide-icons", "heroicons", …],
    "licenses": ["MIT", "ISC", …],
    "iconifySets": ["mdi", "tabler", …],
    "legalSafeCount": 1140,
    "legalOnlyApplied": true
  }
}
```

---

## Icon search app features

| Feature | Storage | Notes |
|---------|---------|-------|
| Search & filters | API | Server-side pagination |
| Icon customizer | Client state | Size, stroke, color |
| Cart / packs | `localStorage` + Supabase | Multiple named packs |
| Style presets | `localStorage` + Supabase | Reusable customizer settings |
| ZIP export | Client | Fetches SVGs, customizes, bundles |
| Auth | Supabase | Email + OAuth |
| Cloud sync | Supabase `packs`, `presets` | Debounced upsert on change |

Export formats in ZIP: `svg/`, `png/`, `react/`, `vue/`, `tailwind-html/`, `sprite.svg`, `metadata.json`.

---

## Site routes overview

| Route | Purpose |
|-------|---------|
| `/` | Homepage with search, library comparison, stats |
| `/icon-search` | Main icon search engine |
| `/free-svg-icons` | Browse all libraries |
| `/icons/[slug]` | Individual library guide (17 libraries) |
| `/compare` and `/compare/[pair]` | Library comparisons (136 pairs) |
| `/icons/category` and `/icons/category/[slug]` | Icon categories |
| `/icons/collection/[tag]` | Tag-based icon collections |
| `/use-cases` and `/use-cases/[slug]` | Use-case guides |
| `/blog` and `/blog/[slug]` | Technical blog |
| `/react-icons`, `/nextjs-icons`, … | Framework landing pages |
| `/best-for-you` | Recommendation wizard |
| `/stats` | Site statistics |
| `/licenses` | License guide |
| `/directory` | Full site directory |
| `/about`, `/contact`, `/privacy-policy`, `/terms` | Legal & contact |

---

## Deployment (Vercel)

This project is connected to Vercel and deploys from the `main` branch (or your configured branch).

### Production checklist

1. **Environment variables** in Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `DEVICE_TOKEN_PEPPER`
   - `NEXT_PUBLIC_SITE_URL`
2. **Redeploy** after changing env vars
3. **Domain:** `iconsearch.info` (Settings → Domains)
4. **Supabase redirect URLs** include production domain (see [Supabase setup](#supabase-setup-auth--cloud-sync))
5. **Canonical icon DB** is committed — no build-step required for search data

### Build command

```bash
npm run build
```

Vercel runs this automatically. The icon gzip file is included in the deployment bundle and loaded into memory on first API request.

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm run build:icons` | Extract icons from npm packages → `data/icon-search.json` |
| `node scripts/merge-and-canonicalize.js` | Merge local + Iconify → canonical `.gz` (manual) |

---

## Data files

| File | Committed | Purpose |
|------|-----------|---------|
| `data/canonical-icon-search.json.gz` | Yes | Production search index |
| `data/icon-search.snapshot.json` | Yes | Build metadata and license stats |
| `data/icon-search (1).json` | Yes | SSR seed for `/icon-search` (first 80 icons) |
| `data/icon-search.json` | No | Generated by `build:icons` |
| `data/iconify-icon-search.json[.gz]` | No (gitignored) | Raw Iconify ingest input |

---

## Known limitations

- **No automated tests** — manual QA only
- **No CI/CD workflows** in `.github/`
- Supabase migrations are versioned in `supabase/migrations/`
- **Freemium / Stripe not implemented** — all export formats available to everyone
- **Rate limiting is in-memory** — not shared across Vercel serverless instances
- **Full icon index loaded into RAM** on cold start (~tens of MB decompressed)
- **`IconSearchClient.tsx` is large** (~1,800 lines) — candidate for refactor
- **README was boilerplate** until this document replaced it

---

## Roadmap

- [ ] Stripe billing + enforced free/pro limits
- [x] Supabase migrations in repo (`supabase/migrations/`)
- [x] `.env.example` committed for onboarding
- [ ] Wire `merge-and-canonicalize.js` into `package.json` as `build:icons:full`
- [ ] GitHub Actions for weekly icon DB refresh
- [ ] Favicon asset (`favicon.svg` referenced in JSON-LD but missing from repo)
- [ ] Distributed rate limiting (Vercel KV / Upstash)
- [ ] Publish the authenticated Figma and VS Code marketplace builds

---

## License & attribution

**This repository (IconSearch site code):** private project — see repository owner for terms.

**Icon data:** Icons indexed by this project come from many open-source libraries (Lucide, Heroicons, Tabler, Iconify collections, etc.), each under their own license. The app surfaces `license` and `legalSafe` fields per icon. Users are responsible for complying with individual icon licenses, especially for commercial use.

IconSearch is an **independent resource** and is not affiliated with Lucide, Heroicons, Tailwind, Iconify, or any indexed library project.

---

## Contact

- Site: [https://iconsearch.info](https://iconsearch.info)
- Email: [iconsearchinfo@gmail.com](mailto:iconsearchinfo@gmail.com) (see `/contact` and `/about`)

---

## Quick troubleshooting

| Problem | Solution |
|---------|----------|
| Search returns empty results | Ensure `data/canonical-icon-search.json.gz` exists; check Vercel build logs |
| "Local-only mode" on sign-in | Add real Supabase env vars and redeploy |
| Auth redirect fails on production | Add `https://iconsearch.info/icon-search` to Supabase redirect URLs |
| `git push` fails on large files | Iconify raw JSON is gitignored; only commit `canonical-icon-search.json.gz` |
| OAuth provider error | Enable provider in Supabase; match callback URL exactly |
| Pack sync errors | Verify RLS policies and that user is signed in |
