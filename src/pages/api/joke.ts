import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      'https://andrewthecoder.com/api/v2/randomjoke',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        joke_text: 'this is not funny... but there was an error: {e.message}',
        author: 'anonymous',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
