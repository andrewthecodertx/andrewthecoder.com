# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog and portfolio website built with Astro. It uses server-side rendering (SSR) mode with the Node.js adapter, and integrates Svelte components for interactive UI elements.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Content System

Blog posts and author profiles use Astro's content collections with a **custom loader pattern**:
- Posts are stored in `src/data/blog-posts/` as Markdown files
- Authors are stored in `src/data/authors/` as Markdown files
- Content collections are configured in `src/content.config.js` using the glob loader (not the traditional `src/content/` directory)
- Post frontmatter includes: title, slug, publishDate, description, categories, tags, author, featured, image, github, demo

### Page Structure

- **Dynamic routes**: Blog post pages use `[slug].astro` with `getStaticPaths()` and `prerender: true`
- **Layouts**: `BaseLayout.astro` for general pages, `BlogLayout.astro` for blog posts
- **Components**: Mix of Astro components (`.astro`) and Svelte components (`.svelte`) for interactive features

### Key Features

- **Search**: Implemented via `search.json.js` endpoint and Svelte component
- **RSS Feed**: Generated at `/rss.xml` via `rss.xml.js`
- **Comments**: Uses Giscus (GitHub discussions) for blog post comments
- **Dark Mode**: Theme toggle implemented in Svelte
- **Reading Time**: Calculated using the `reading-time` package
- **Math Support**: Uses remark-math and rehype-katex for mathematical notation
- **External Links**: All external links open in new tabs via rehype-external-links

### Markdown Processing

Configured in `astro.config.mjs`:
- Syntax highlighting: Shiki with Nord theme
- Remark plugins: GFM, smartypants, math
- Rehype plugins: KaTeX, external links

## Deployment

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`):
1. On push to `main`, code is copied to the production server via SCP
2. Dependencies are installed with `npm install`
3. Production build runs with `npm run astro build` (not `npm run build` which is aliased to `astro build`)
4. Site is restarted using PM2

**Note**: The deploy script uses `npm run astro build` directly, not the `npm run build` alias.
