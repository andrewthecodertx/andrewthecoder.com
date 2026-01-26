import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const res = await fetch('https://dadjokes.developersandbox.xyz/api/v2/random');
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      joke_text: 'Why do programmers prefer dark mode? Because light attracts bugs.',
      author: 'anonymous'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
