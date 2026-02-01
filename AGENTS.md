# AGENTS.md

This file provides guidance to agentic coding tools working with this repository.

## Build & Development Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Build production site to ./dist/
npm run preview    # Preview production build locally
npm run start      # Run production server (after build)
```

**Note:** No test or lint commands are configured. Add them to package.json if needed.

## Architecture

This is an Astro 5 blog site (andrewthecoder.com) in SSR mode with Node.js adapter.

**Stack:**
- Astro 5 with SSR (`output: 'server'`)
- Svelte for interactive components
- Tailwind CSS v4 (via Vite plugin)
- MDX for blog posts with remark-gfm, remark-math, and rehype-katex

**Content Collections:**
- Posts: `src/data/blog-posts/*.md`
- Authors: `src/data/authors/*.md`
- Schemas defined in `src/content.config.js`

## Project Structure
```
src/
├── components/      # Reusable Astro & Svelte components
├── layouts/         # Page layout templates
├── pages/           # File-based routes (Astro pages & API routes)
├── data/            # Content collections (blog posts, authors)
└── constants.ts     # Global constants
```

## Code Style Guidelines

### Imports
- Use single quotes for all import paths
- Type imports: `import type { APIRoute } from 'astro'`
- Local imports use relative paths: `import Header from '../components/Header.astro'`
- Group imports: external packages first, then local files
- No unused imports

### Naming Conventions
- Components: PascalCase (BaseHead, Header, CategoryPostList)
- Functions/variables: camelCase (formatDate, navItems)
- Constants: UPPER_SNAKE_CASE (CONTACT_EMAIL)
- API routes: UPPERCASE HTTP methods (GET, POST, etc.)
- Files: kebab-case for folders, PascalCase for components

### Formatting
- Indentation: 2 spaces
- No trailing whitespace
- No explicit linter configured - follow existing patterns

### TypeScript
- Interfaces for component props: `export interface Props { title: string }`
- Type annotations on function parameters when type isn't inferred
- Use `any` sparingly, prefer `unknown` for untyped external data
- Content validation via Zod schemas in `src/content.config.js`
- For external API responses, prefer type guards or runtime validation

### Astro Components
- Frontmatter with `---` delimiters
- Destructure Astro.props: `const { title, description } = Astro.props`
- Props interface defined in frontmatter
- Use `<slot />` for child content
- Inline client-side scripts with `<script is:inline>` for hydration

### Svelte Components
- Use reactive statements: `$: filteredPosts = posts.filter(...)`
- Export props: `export let posts = []`
- Event handlers: `on:click={handleClick}`
- Lifecycle hooks: `import { onMount } from 'svelte'`

### Error Handling
- Try-catch around async operations
- Provide fallback values (see src/pages/api/joke.ts)
- Use console.error for logging errors
- Graceful degradation for external API failures

### Styling
- Tailwind CSS utility classes
- Color variables: terminal-green, terminal-cyan, terminal-dim, terminal-border
- Component-scoped styles in Svelte `<style>` blocks
- Prose styling for blog content via @tailwindcss/typography
- Use `no-underline` class for links and hover state (e.g., `hover:text-terminal-green`)
- CSS variables in Svelte styles: `var(--background)`, `var(--border-color)`, `var(--text-primary)`

### API Routes
- Located in `src/pages/api/`
- Export named functions: `export const GET: APIRoute`
- Return Response objects with proper headers
- Handle errors with fallback responses
- Set timeouts on fetch calls (e.g., 5 seconds for external APIs)

### Content Frontmatter
Required: title, slug, publishDate, description
Optional: categories (default: ["Other"]), tags (default: ["Other"]), comments_enabled (default: true), author (default: "andrew"), featured (default: true), image, github, demo
- Categories and tags are arrays of strings
- Use kebab-case for slug values

### Page Routing
- File-based routing: `src/pages/blog/[slug].astro` creates dynamic routes
- Use `getStaticPaths()` for prerendering dynamic routes
- Use `export const prerender = true;` for static pages
- Export route functions: `export async function getStaticPaths() { ... }`

### Constants
- Global constants in `src/constants.ts`
- Exported as `export const NAME = 'value'`
- Imported via: `import { CONTACT_EMAIL } from '../constants'`

### Files to Reference
- `astro.config.mjs` - Astro config with markdown plugins
- `src/content.config.js` - Content collection schemas
- `src/layouts/BaseLayout.astro` - Main layout pattern
- `src/layouts/BlogLayout.astro` - Blog post layout
- `src/pages/api/joke.ts` - API route pattern
- `src/components/Header.astro` - Component pattern
- `src/pages/index.astro` - Homepage with API integration patterns
- `src/components/CategoryPostList.svelte` - Pagination and data filtering patterns

### Deployment
- Pushes to `main` trigger GitHub Actions
- Workflow rsyncs to server and restarts via PM2
- Site: https://andrewthecoder.com

### Best Practices
- When creating new components, first review existing components to match the pattern
- For blog-related features, check `src/layouts/BlogLayout.astro` and `src/pages/blog/[slug].astro`
- Use Astro's built-in image optimization for new images
- Keep API routes simple and lightweight, move complex logic to separate functions if needed
- Avoid committing secrets or API keys, use environment variables when needed
