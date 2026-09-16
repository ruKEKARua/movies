const kinopoiskApiUrl = 'https://kinopoiskapiunofficial.tech/api/v2.1';
const kinopoiskApiKey = import.meta.env.VITE_KINOPOISK_API_KEY
    ?? '5a2a67d9-a49f-4cda-9b4e-ab7c48034246';

export type KinopoiskFilm = {
    filmId: number;
    nameRu?: string;
    nameEn?: string;
    year?: number | string;
    description?: string;
    posterUrl?: string;
    posterUrlPreview?: string;
    rating?: number | string;
    ratingVoteCount?: number;
    genres?: Array<{ genre?: string }>;
};

type KinopoiskFilmResponse = {
    data?: KinopoiskFilm;
};

type KinopoiskSearchResponse = {
    films?: KinopoiskFilm[];
};

const kinopoiskRequestIntervalMs = 250;
let nextKinopoiskRequestAt = 0;
let requestQueue = Promise.resolve();

const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const scheduleKinopoiskRequest = async <T>(request: () => Promise<T>): Promise<T> => {
    const queuedRequest = requestQueue.then(async () => {
        const delay = Math.max(0, nextKinopoiskRequestAt - Date.now());
        if (delay > 0) {
            await wait(delay);
        }

        nextKinopoiskRequestAt = Date.now() + kinopoiskRequestIntervalMs;
        return request();
    });

    requestQueue = queuedRequest.then(() => undefined, () => undefined);
    return queuedRequest;
};

const getKinopoisk = async <T>(url: string): Promise<T> => scheduleKinopoiskRequest(async () => {
    const response = await fetch(url, {
        headers: {
            'X-API-KEY': kinopoiskApiKey,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Kinopoisk request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
});

const searchCache = new Map<string, { expiresAt: number; films: KinopoiskFilm[] }>();
const searchRequests = new Map<string, Promise<KinopoiskFilm[]>>();
const searchCacheLifetimeMs = 10 * 60 * 1000;

export async function fetchKinopoiskSearch(keyword: string): Promise<KinopoiskFilm[]> {
    if (!kinopoiskApiKey) {
        throw new Error('VITE_KINOPOISK_API_KEY is not configured');
    }

    const cacheKey = keyword.trim().toLocaleLowerCase('ru-RU');
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.films;
    }

    const existingRequest = searchRequests.get(cacheKey);
    if (existingRequest) {
        return existingRequest;
    }

    const request = getKinopoisk<KinopoiskSearchResponse>(
        `${kinopoiskApiUrl}/films/search-by-keyword?keyword=${encodeURIComponent(keyword)}&page=1`,
    )
        .then((data) => {
            const films = data.films ?? [];
            searchCache.set(cacheKey, { expiresAt: Date.now() + searchCacheLifetimeMs, films });
            return films;
        })
        .finally(() => searchRequests.delete(cacheKey));

    searchRequests.set(cacheKey, request);
    return request;
}

export async function fetchKinopoiskPopular(page: number): Promise<KinopoiskFilm[]> {
    if (!kinopoiskApiKey) {
        throw new Error('VITE_KINOPOISK_API_KEY is not configured');
    }

    const data = await getKinopoisk<{ films?: KinopoiskFilm[] }>(
        `${kinopoiskApiUrl}/films/top?type=TOP_100_POPULAR_FILMS&page=${page}`,
    );
    return data.films ?? [];
}

export async function fetchKinopoiskFilm(filmId: number): Promise<KinopoiskFilm> {
    if (!kinopoiskApiKey) {
        throw new Error('VITE_KINOPOISK_API_KEY is not configured');
    }

    const data = await getKinopoisk<KinopoiskFilm | KinopoiskFilmResponse>(`${kinopoiskApiUrl}/films/${filmId}`);
    if ('data' in data && data.data) {
        return data.data;
    }

    return data as KinopoiskFilm;
}
