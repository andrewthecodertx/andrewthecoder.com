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
        joke_text:
          'Why do programmers prefer dark mode? Because light attracts bugs.',
        author: 'anonymous',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
