# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build production site to ./dist/
npm run preview  # Preview production build locally
npm run start    # Run production server (after build)
```

## Architecture

This is an Astro blog site (andrewthecoder.com) running in SSR mode with Node.js adapter.

**Stack:**
- Astro 5 with SSR (`output: 'server'`)
- Svelte for interactive components
- Tailwind CSS v4 (via Vite plugin)
- MDX for blog posts with remark-gfm, remark-math, and rehype-katex

**Content Collections:**
- Posts: `src/data/blog-posts/*.md` - Blog posts with frontmatter schema defined in `src/content.config.js`
- Authors: `src/data/authors/*.md`

**Post Frontmatter Schema:**
```yaml
title: string (required)
slug: string (required)
publishDate: string | date (required)
description: string (required)
categories: string[] (default: ["Other"])
tags: string[] (default: ["Other"])
comments_enabled: boolean (default: true)
featured: boolean (default: true)
image: string (default: "")
```

**Key Files:**
- `astro.config.mjs` - Astro config with markdown plugins and Tailwind
- `src/content.config.js` - Content collection schemas
- `src/layouts/BaseLayout.astro` - Main layout wrapper
- `src/layouts/BlogLayout.astro` - Blog post layout
- `ecosystem.config.cjs` - PM2 config for production (port 4321)

**Deployment:**
Pushes to `main` trigger GitHub Actions workflow that rsyncs to server and restarts via PM2.

## About Andrew

Personal and career facts for reference when updating site content:

**Experience:** 25+ years as a professional software engineer/web developer

**Background:** Studied theology and linguistics in college. Started programming at age 10 on a Commodore 64 (BASIC), then learned 6502 Assembly. After college, discovered people would pay him to write programs and has been doing it ever since.

**Languages worked with:**
Ada, C/C++, C#, Python, PHP, Ruby, Rust, Zig, Go, JavaScript/TypeScript, OCaml, Haskell, Assembly (various architectures), Rexx, BASIC, ASP, LISP (various dialects), Cold Fusion, Java, Swift, Kotlin

**Frameworks worked with:**
Symfony, Laravel, Rails, Gin, Flask, Django, Angular, Vue, Flutter, Spring, Netty, Ember, Aeron, Xamarin, Express, Yesod

**Interests:** Game development (studying techniques, not a professional game dev), philosophy, theology
