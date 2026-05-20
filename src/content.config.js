import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/data/blog-posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishDate: z.union([z.string(), z.date()]),
    description: z.string(),
    categories: z.array(z.string()).default(['Other']),
    tags: z.array(z.string()).default(['Other']),
    comments_enabled: z.boolean().default(true),
    author: z.string().default('andrew'),
    featured: z.boolean().default(true),
    hidden: z.boolean().default(false),
    image: z.string().default(''),
    github: z.string().default(''),
    demo: z.string().default(''),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/data/authors' }),
  schema: z.object({
    name: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = { posts, authors };
