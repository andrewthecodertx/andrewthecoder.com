import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('posts');
  const searchIndex = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    slug: post.data.slug,
    categories: post.data.categories,
    tags: post.data.tags,
    content: post.body.substring(0, 200), // Truncate content for search index
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}