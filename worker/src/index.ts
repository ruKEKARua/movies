const allowedOrigins = new Set([
  "https://rukekarua.github.io",
  "http://localhost:5173",
]);
const tmdbApiUrl = "https://api.themoviedb.org/3";
const tmdbImageUrl = "https://image.tmdb.org/t/p";

function corsHeaders(origin: string | null): HeadersInit {
  const responseOrigin = origin && allowedOrigins.has(origin)
    ? origin
    : "https://rukekarua.github.io";

  return {
    "Access-Control-Allow-Origin": responseOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request: Request, env: { TMDB_TOKEN: string }): Promise<Response> {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    const url = new URL(request.url);

    if (url.pathname.startsWith("/image/")) {
      const imagePath = url.pathname.replace(/^\/image/, "");
      const imageResponse = await fetch(`${tmdbImageUrl}${imagePath}${url.search}`);

      return new Response(imageResponse.body, {
        status: imageResponse.status,
        headers: {
          ...headers,
          "Content-Type": imageResponse.headers.get("Content-Type") ?? "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const tmdbPath = url.pathname.replace(/^\/tmdb/, "");

    if (url.pathname === "/" || url.pathname === "/tmdb" || url.pathname === "/tmdb/") {
      return new Response(JSON.stringify({ status: "ok", service: "movies-tmdb-proxy" }), {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      });
    }

    if (!tmdbPath.startsWith("/") || tmdbPath === "/") {
      return new Response("Not found", { status: 404, headers });
    }

    const tmdbUrl = new URL(`${tmdbApiUrl}${tmdbPath}`);
    tmdbUrl.search = url.search;

    const response = await fetch(tmdbUrl, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${env.TMDB_TOKEN}`,
      },
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });
  },
};
