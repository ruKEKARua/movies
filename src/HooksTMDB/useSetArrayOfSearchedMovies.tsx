import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setFoundMovies } from '../store/foundMovies';
import findMovieBySearchTitle from './useGetMovieBySearchName';


const useSetArrayOfSearchedMovies = (titles: string[]) => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(titles.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      setIsLoaded(false);

      if (titles.length === 0) {
        dispatch(setFoundMovies([]));
        setIsLoaded(true);
        return;
      }

      const responses = await Promise.allSettled(
        titles.map((title) => findMovieBySearchTitle(title))
      );

      if (cancelled) return;

      const movies = responses.map((response, index) => {
        if (response.status === 'fulfilled' && response.value) {
          return {
            ...response.value,
            poster_path: response.value.poster_path ?? '',
            backdrop_path: response.value.backdrop_path ?? '',
          };
        }

        const title = titles[index];
        return {
          id: -(index + 1),
          media_type: 'movie' as const,
          title,
          original_title: title,
          overview: '',
          poster_path: '',
          backdrop_path: '',
          source: 'tmdb' as const,
          excelTitle: title,
          isExcelFallback: true,
        };
      });

      dispatch(setFoundMovies(movies));
      setIsLoaded(true);
    }

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [titles, dispatch]);

  return isLoaded;
};

export default useSetArrayOfSearchedMovies;