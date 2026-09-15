const tmdbProxyUrl = import.meta.env.VITE_TMDB_PROXY_URL;
const tmdbRequestTimeoutMs = 7000;

export async function fetchTmdb<T>(path: string): Promise<T> {
  if (!tmdbProxyUrl) {
    throw new Error("VITE_TMDB_PROXY_URL is not configured");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), tmdbRequestTimeoutMs);

  try {
    const response = await fetch(`${tmdbProxyUrl}${path}`, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`TMDB proxy request failed: ${response.status}`);
    }

    return await response.json() as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
