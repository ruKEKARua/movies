import { fetchKinopoiskFilm, fetchKinopoiskPopular, fetchKinopoiskSearch, type KinopoiskFilm } from './kinopoisk';
import { fetchTmdb } from './tmdb';

export type MovieSource = 'tmdb' | 'kinopoisk';

export type NormalizedMovie = {
    id: number;
    media_type: 'movie';
    title: string;
    original_title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    source: MovieSource;
    excelTitle?: string;
    release_date?: string;
    vote_average?: number;
    vote_count?: number;
    genres?: { id: number; name: string }[];
};

export type MovieDetails = NormalizedMovie & {
    release_date: string;
    vote_average: number;
    vote_count: number;
    genres: { id: number; name: string }[];
};

export type MovieImage = { file_path: string };

let tmdbAvailability: Promise<boolean> | undefined;

export function detectMovieSource(): Promise<MovieSource> {
    tmdbAvailability ??= fetchTmdb('/configuration')
        .then(() => true)
        .catch(() => false);

    return tmdbAvailability.then((isAvailable) => isAvailable ? 'tmdb' : 'kinopoisk');
}

function normalizeKinopoiskFilm(film: KinopoiskFilm): NormalizedMovie {
    const year = film.year ? String(film.year) : '';
    const rating = Number(film.rating);

    return {
        id: film.filmId,
        media_type: 'movie',
        title: film.nameRu ?? film.nameEn ?? '',
        original_title: film.nameEn ?? film.nameRu ?? '',
        overview: film.description ?? '',
        poster_path: film.posterUrl ?? film.posterUrlPreview ?? '',
        backdrop_path: film.posterUrl ?? film.posterUrlPreview ?? '',
        source: 'kinopoisk',
        release_date: year ? `${year}-01-01` : '',
        vote_average: Number.isFinite(rating) ? rating : 0,
        vote_count: film.ratingVoteCount ?? 0,
        genres: film.genres?.map((genre, index) => ({ id: index, name: genre.genre ?? '' })).filter((genre) => genre.name) ?? [],
    };
}

function normalizeTmdbMovie(movie: Omit<NormalizedMovie, 'source'>): NormalizedMovie {
    return { ...movie, source: 'tmdb' };
}

async function searchTmdbMovies(query: string): Promise<NormalizedMovie[]> {
    const response = await fetchTmdb<{ results: Omit<NormalizedMovie, 'source'>[] }>(
        `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=ru-RU&page=1`,
    );
    return response.results.map(normalizeTmdbMovie);
}

async function searchKinopoiskMovies(query: string): Promise<NormalizedMovie[]> {
    const films = await fetchKinopoiskSearch(query);
    return films.map(normalizeKinopoiskFilm);
}

export async function searchMoviesFromSource(query: string): Promise<NormalizedMovie[]> {
    const results = await Promise.allSettled([searchTmdbMovies(query), searchKinopoiskMovies(query)]);
    const movies = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);

    if (movies.length === 0) {
        throw new Error('Оба источника не вернули фильмы');
    }

    return movies;
}

export async function getPopularMoviesFromSource(page: number): Promise<NormalizedMovie[]> {
    const source = await detectMovieSource();
    if (source === 'tmdb') {
        try {
            const response = await fetchTmdb<{ results: Omit<NormalizedMovie, 'source'>[] }>(`/movie/popular?language=ru-ru&page=${page}`);
            return response.results.map(normalizeTmdbMovie);
        } catch {
            // TMDB can become unavailable after the health-check.
        }
    }
    return (await fetchKinopoiskPopular(page)).map(normalizeKinopoiskFilm);
}

export async function getMovieDetailsFromSource(movieId: number, source?: MovieSource): Promise<MovieDetails> {
    const selectedSource = source ?? await detectMovieSource();
    if (selectedSource === 'tmdb') {
        return await fetchTmdb<MovieDetails>(`/movie/${movieId}?language=ru-ru`);
    }
    const film = await fetchKinopoiskFilm(movieId);
    return normalizeKinopoiskFilm(film) as MovieDetails;
}

export async function getMovieImagesFromSource(movieId: number, source?: MovieSource) {
    const selectedSource = source ?? await detectMovieSource();
    if (selectedSource === 'tmdb') {
        return await fetchTmdb<Record<'posters' | 'backdrops' | 'logos', MovieImage[]>>(`/movie/${movieId}/images`);
    }
    const details = await getMovieDetailsFromSource(movieId, selectedSource);
    const image = details.poster_path ? [{ file_path: details.poster_path }] : [];
    return { posters: image, backdrops: [], logos: [] };
}