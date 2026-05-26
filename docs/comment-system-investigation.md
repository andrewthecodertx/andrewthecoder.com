# Comment System Investigation — 2025-05-25

## Problem

The blog section of andrewthecoder.com had a comment system that wasn't working.

## Root Cause (3 separate issues)

1. **Dead component**: `Cusdis.astro` existed in `src/components/` but was **never imported or rendered** by any page or layout template. Pure dead code.

2. **No env configuration**: No `.env.local` file existed. The Cusdis component defaulted to `https://cusdis.example.com` as the host and an empty app ID — both placeholder values that could never work.

3. **Schema field unused**: `comments_enabled: z.boolean().default(true)` was defined in `content.config.js` but never consumed by any template or component.

## Original Cusdis Implementation (removed)

The Cusdis component (`src/components/Cusdis.astro`) expected these env vars:

- `PUBLIC_CUSDIS_HOST` — hostname of a self-hosted Cusdis instance
- `PUBLIC_CUSDIS_APP_ID` — app ID from the Cusdis dashboard

Cusdis is a lightweight, self-hosted comment system. It requires running a separate server. Neither env var was configured.

## Replacement: Giscus

### Why Giscus

- Backed by GitHub Discussions — no separate service to host/maintain
- Free, actively maintained
- Supports GitHub login (low friction for dev-oriented audience)
- Theme-aware (dark/light switching)
- Lazy loading built in

### What changed

- **Deleted**: `src/components/Cusdis.astro`
- **Created**: `src/components/Giscus.astro` — renders Giscus embed, handles dark/light theme switching via MutationObserver, uses `is:inline` script to avoid Astro hoisting
- **Modified**: `src/pages/blog/[slug].astro` — imports Giscus, destructures `comments_enabled` from frontmatter, conditionally renders `<Giscus pageId={slug} />` when `comments_enabled !== false`
- **Modified**: `.env.local.example` — added `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID`
- **Modified**: `src/env.d.ts` — added TypeScript declarations for the four GISCUS env vars

### Required env vars (4)

```
PUBLIC_GISCUS_REPO=andrewthecodertx/andrewthecoder.com
PUBLIC_GISCUS_REPO_ID=<from giscus.app config>
PUBLIC_GISCUS_CATEGORY=Comments
PUBLIC_GISCUS_CATEGORY_ID=<from giscus.app config>
```

### Graceful degradation

- If all 4 env vars are not set, the Giscus component does an early `return` in frontmatter and renders nothing — no script, no DOM, no network request.
- If `comments_enabled: false` in a post's frontmatter, the component is never imported for that post.
- Default is `comments_enabled: true` (from the schema).

### Setup steps

1. Go to https://giscus.app
2. Enter the repo: `andrewthecodertx/andrewthecoder.com`
3. Ensure GitHub Discussions are enabled on the repo
4. Choose mapping: **pathname** (already configured in the component)
5. Choose category: **Announcements** (recommended — only maintainers can create, anyone can comment)
6. Copy the 4 values (repo, repoId, category, categoryId) into `.env.local`

### Mapping strategy

`data-mapping="pathname"` — Giscus maps each blog post to its URL pathname (e.g., `/blog/building-enchanter`). This is stable and works well with the static site setup.

### Theme

Uses `dark_tritanopia` / `light_tritanopia` which matches the site's dark aesthetic. Theme auto-switches if the site adds a dark mode toggle.
