# AGENTS.md

## Build Commands
- `npm run dev` - Start dev server (localhost:4321)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- No test framework configured

## Architecture
- Astro 5 with SSR mode (Node.js adapter), Svelte for interactive components, Tailwind CSS v4
- Content collections in `src/data/` (not `src/content/`) using glob loader in `src/content.config.js`
- Blog posts: `src/data/blog-posts/*.md`, Authors: `src/data/authors/*.md`

## Code Style
- TypeScript with ESNext target, no explicit type annotations required (Astro handles transpilation)
- Imports: External packages first, then local imports; use single quotes
- Tailwind: Use utility classes directly in templates; dark mode via `.dark` class
- Svelte components use `client:load` directive for hydration
- Markdown: Supports GFM, math (KaTeX), syntax highlighting (Nord theme)
- Dynamic routes use `getStaticPaths()` with `prerender: true`
