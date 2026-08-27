const tmdbProxyUrl = import.meta.env.VITE_TMDB_PROXY_URL;

export async function fetchTmdb<T>(path: string): Promise<T> {
  if (!tmdbProxyUrl) {
    throw new Error("VITE_TMDB_PROXY_URL is not configured");
  }

  const response = await fetch(`${tmdbProxyUrl}${path}`);

  if (!response.ok) {
    throw new Error(`TMDB proxy request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
