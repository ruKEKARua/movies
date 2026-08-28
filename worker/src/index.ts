const allowedOrigins = new Set([
  "https://rukekarua.github.io",
  "http://localhost:5173",
]);
const tmdbApiUrl = "https://api.themoviedb.org/3";

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
  async fetch(request, env: { TMDB_TOKEN: string }): Promise<Response> {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    const url = new URL(request.url);
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

    const isAllowedPath = /^\/(movie\/popular|discover\/movie|movie\/\d+|movie\/\d+\/images)$/.test(tmdbPath);

    if (!isAllowedPath) {
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
