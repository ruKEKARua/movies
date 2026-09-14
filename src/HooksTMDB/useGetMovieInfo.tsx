import { useEffect, useState } from 'react'
import { fetchTmdb } from '../api/tmdb';

type MovieData = {
    adult: boolean;
    backdrop_path:string;
    budget: number;
    genres: Genres[];
    homepage: string;
    id: number;
    imdb_id: string;
    origin_country: string[];
    original_language: string;
    original_title: string;
    overview:string;
    popularity: number;
    poster_path: string;
    production_companies: ProductionCompanies[];
    production_countries: ProductionCountries[];
    release_date: string;
    revenue: number;
    runtime: number;
    spoken_languages: Spokenlanguages[];
    status: string;
    tagline: string;
    title: string;
    vote_average: number;
    vote_count: number;
}

type Genres = {
    id: number;
    name: string;
}

type ProductionCompanies = {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
}

type ProductionCountries = {
    iso_3166_1: string;
    name: string;
}

type Spokenlanguages = {
    english_name: string;
    iso_639_1: string;
    name: string;
}


const useGetMovieInfo = (movieId: number) => {

    const [data, setData] = useState<MovieData | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setData(null);
        setError(null);

        fetchTmdb<MovieData>(`/movie/${movieId}?language=ru-ru`)
            .then(res => {
                setData(res)
            })
            .catch(err => {
                console.error(err);
                setError(err instanceof Error ? err : new Error('Не удалось загрузить информацию о фильме'));
            });
    

    }, [movieId])

    return { data, error };
}

export default useGetMovieInfo