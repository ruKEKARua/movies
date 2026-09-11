import { fetchTmdb } from '../api/tmdb';

type TmdbMovie = {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

type SearchResponse = {
  results: TmdbMovie[];
};

async function findMovieBySearchTitle(title: string) {
    const titleWithoutEmoji = title.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+|[\p{Emoji}\p{Extended_Pictographic}\s]+$/gu, '');
  // 1. Ищем в TMDB
  const response = await fetchTmdb<SearchResponse>(
    `/search/movie?query=${encodeURIComponent(titleWithoutEmoji)}&include_adult=false&language=ru-RU&page=1`
  );

  // 2. Если фильм найден, возвращаем его (проверяем на undefined/null и длину массива)
  if (response.results && response.results.length > 0) {
    return response.results[0];
  }

  // 3. Если не найден — запросим оригинальное название у Кинопоиска
  let originalName = '';

  try {
    const kpResponse = await fetch(
      `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(titleWithoutEmoji)}&page=1`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': '5a2a67d9-a49f-4cda-9b4e-ab7c48034246',
          'Content-Type': 'application/json',
        },
      }
    );

    const json = await kpResponse.json();
    
    // В v2.1 список лежит в json.films, берем первый элемент
    const firstFilm = json.films?.[0];
    originalName = firstFilm?.nameEn || '';
  } catch (err) {
    console.error('Kinopoisk fetch error:', err);
  }

  // 4. Если нашли оригинальное название, ищем снова в TMDB
  if (originalName) {
    const responseByOriginalName = await fetchTmdb<SearchResponse>(
      `/search/movie?query=${encodeURIComponent(originalName)}&include_adult=false&language=ru-RU&page=1`
    );

    return responseByOriginalName.results?.[0] ?? null;
  }

  return null;
}

export default findMovieBySearchTitle;