import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';
import node from '@astrojs/node';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://andrewthecoder.com',
  integrations: [
    mdx(),
    svelte(),
    sitemap({
      // SSR pages aren't auto-discovered by the sitemap integration;
      // list them explicitly so crawlers can find them.
      customPages: [
        'https://andrewthecoder.com/',
        'https://andrewthecoder.com/projects',
      ],
      filter: (page) => !page.includes('/api/') && !page.endsWith('/search'),
    }),
  ],

  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
    remarkPlugins: [remarkGfm, remarkSmartypants, remarkMath],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypeExternalLinks,
        {
          target: '_blank',
        },
      ],
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
