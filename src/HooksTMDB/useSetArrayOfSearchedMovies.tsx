import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFoundMovies } from '../store/foundMovies';
import findMovieBySearchTitle from './useGetMovieBySearchName';


const useSetArrayOfSearchedMovies = (titles: string[]) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (titles.length === 0) {
      dispatch(setFoundMovies([]));
      return;
    }

    let cancelled = false;

    async function loadMovies() {
      const responses = await Promise.allSettled(
        titles.map((title) => findMovieBySearchTitle(title))
      );

      if (cancelled) return;

      const movies = responses
        .filter(
          (response): response is PromiseFulfilledResult<Awaited<ReturnType<typeof findMovieBySearchTitle>>> =>
            response.status === 'fulfilled'
        )
        .map((response) => response.value)
        .filter((movie): movie is NonNullable<typeof movie> => movie !== null)
        .map((movie) => ({
          ...movie,
          poster_path: movie.poster_path ?? '',
          backdrop_path: movie.backdrop_path ?? '',
        }));

      dispatch(setFoundMovies(movies));
    }

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [titles, dispatch]);
};

export default useSetArrayOfSearchedMovies;