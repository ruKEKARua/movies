const tmdbProxyUrl = import.meta.env.VITE_TMDB_PROXY_URL;

export function getTmdbImageUrl(size: string, path: string | null): string {
    if (!path) {
        return '';
    }

    if (path.startsWith('http')) {
        return path;
    }

    const imageProxyUrl = tmdbProxyUrl.replace(/\/tmdb\/?$/, '/image');
    return `${imageProxyUrl}/${size}${path}`;
}