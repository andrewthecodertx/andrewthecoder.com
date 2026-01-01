# AGENTS.md

Guidelines for AI agents working in this Astro blog codebase.

## Build/Run Commands

```bash
npm run dev        # Start dev server on localhost:4321
npm run build      # Production build (output to dist/)
npm run preview    # Preview production build locally
npm run start      # Run production server (after build)
```

## Testing

No test framework is configured. To verify changes:
1. Run `npm run build` to check for build errors
2. Use `npm run dev` and manually verify in browser
3. Check console for TypeScript/runtime errors

## Deployment

- Automated via GitHub Actions on push to `main` (see `.github/workflows/deploy.yml`)
- Uses PM2 for process management (see `ecosystem.config.cjs`)
- Production runs on port 4321 with Node.js adapter in SSR mode

---

## Architecture Overview

### Stack
- **Astro 5** - SSR mode with Node.js adapter
- **Svelte** - Interactive components (hydrated with `client:load`)
- **Tailwind CSS v4** - Styling via Vite plugin
- **TypeScript** - ESNext target, no explicit emit

### Directory Structure
```
src/
├── components/     # .astro and .svelte components
├── data/           # Content collections (NOT src/content/)
│   ├── blog-posts/ # Markdown blog posts
│   └── authors/    # Author profiles
├── layouts/        # Page layouts (BaseLayout, BlogLayout)
├── pages/          # File-based routing
│   └── blog/       # Blog routes with dynamic [slug], [page], etc.
├── styles/         # Global CSS and fonts
└── content.config.js  # Content collection schemas
```

### Content Collections

Collections defined in `src/content.config.js` using glob loader:

```javascript
// Blog posts: src/data/blog-posts/*.md
const posts = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/data/blog-posts" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishDate: z.union([z.string(), z.date()]),
    description: z.string(),
    categories: z.array(z.string()).default(["Other"]),
    tags: z.array(z.string()).default(["Other"]),
    author: z.string().default("andrew"),
    featured: z.boolean().default(true),
    image: z.string().default(""),
    github: z.string().default(""),
    demo: z.string().default(""),
  }),
});

// Authors: src/data/authors/*.md
const authors = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/data/authors" }),
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
  }),
});
```

---

## Code Style Guidelines

### Imports
- External packages first, then local imports
- Use single quotes for strings
- Astro imports from `astro:content`, `astro:transitions`

```javascript
// Good
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro';

// Bad - mixed quotes, wrong order
import BaseLayout from "../layouts/BaseLayout.astro"
import { getCollection } from "astro:content"
```

### TypeScript
- ESNext target with node module resolution
- No explicit type annotations required (Astro handles transpilation)
- Use interfaces for component props in frontmatter

```astro
---
export interface Props {
  title: string;
  description: string;
  permalink: string;
  current?: string;
  image?: string;
}
const { title, description, permalink, current, image } = Astro.props;
---
```

### Tailwind CSS
- Use utility classes directly in templates
- Dark mode via `.dark` class (configured with `@custom-variant`)
- Typography plugin for prose content (`prose`, `prose-lg`, `dark:prose-invert`)
- Prefer responsive utilities: `sm:`, `md:`, `lg:`

```html
<!-- Dark mode pattern -->
<div class="bg-amber-50 text-black dark:bg-gray-800 dark:text-amber-50">

<!-- Responsive pattern -->
<h1 class="text-4xl lg:text-5xl font-bold">
```

### Svelte Components
- Use `client:load` directive for hydration
- Handle SSR by checking `typeof document !== "undefined"`
- Store theme preference in localStorage

```astro
<ThemeToggleButton client:load />
```

### Dynamic Routes
- Use `getStaticPaths()` for dynamic routes
- Set `export const prerender = true;` for static generation

```astro
---
export const prerender = true;
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(p => ({
    params: { slug: p.data.slug },
    props: { post: p },
  }));
}
---
```

### Markdown/MDX
- Supports GFM (GitHub Flavored Markdown)
- Math expressions via remark-math + rehype-katex
- Syntax highlighting with Shiki (Nord theme)
- Smart quotes via remark-smartypants
- External links open in new tab

---

## Component Patterns

### Layouts
- `BaseLayout.astro` - Main wrapper with header/footer
- `BlogLayout.astro` - Blog post specific layout
- Both use `BaseHead.astro` for meta tags and theme script

### Error Handling
- Use try/catch for async operations (e.g., API calls)
- Provide fallback values for failed fetches

```javascript
let dadJoke = { joke_text: "Default joke", author: "Anonymous" };
try {
  const response = await fetch('https://api.example.com');
  if (response.ok) dadJoke = await response.json();
} catch (error) {
  console.error('Failed to fetch:', error);
}
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ThemeToggleButton.svelte` |
| Pages | kebab-case or [param] | `[slug].astro`, `index.astro` |
| CSS classes | Tailwind utilities | `text-gray-900 dark:text-amber-50` |
| Content files | kebab-case | `building-a-neural-network.md` |
| Variables | camelCase | `allPosts`, `currentAuthor` |

---

## Adding New Content

### Blog Post
Create `src/data/blog-posts/your-post-slug.md`:

```markdown
---
title: "Post Title"
slug: your-post-slug
publishDate: "2025-01-01"
description: "Brief description"
categories: ["Category"]
tags: ["tag1", "tag2"]
author: andrew
featured: true
image: "/assets/blog/image.webp"
github: "https://github.com/..."
demo: "https://demo.example.com"
---

Post content here...
```

### Author
Create `src/data/authors/name.md`:

```markdown
---
name: Full Name
bio: Short biography
image: /assets/authors/name.jpg
---
```

---

## Static Assets

- Place in `public/assets/`
- Reference with absolute paths: `/assets/blog/image.webp`
- Prefer `.webp` format for images
