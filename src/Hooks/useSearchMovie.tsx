import { useEffect, useState } from 'react'
import { fetchTmdb } from '../api/tmdb';



type Movie = {

    media_type: 'movie' | 'tv'; // обязательно, что это фильм или сериал
    id: number; // айдишник
    backdrop_path: string; // постер на оригинальном языке
    original_title: string; // название на оригинальном языке (в частности английский)
    title: string; // название на русском
    overview: string; // описание
    poster_path: string; // постер на русском

};

type Person = {

    media_type: 'person'; // обязательно, что это человек
    id: number; // айдишник
    gender: number; // гендер в числовом эквиваленте (what)
    name: string; // имя на русском
    original_name: string; // имя на оригинальном языке (в частности английский)
    known_for: KnownForMovie[]; // массив из фильмов, в которых учавствовал актёр
    profile_path: string; // ссылка на фото актёра
    known_for_department: string // "описание", например "Актёр" (актёрская деятельность)

};

type Media = Movie | Person;


type KnownForMovie = {
  id: number;
};

type MovieSliderProps = {
  media: Media[];
};

const useSearchMovie = (searchValue: string) => {

    const [data, setData] = useState<MovieSliderProps>();


    useEffect(() => {

        fetchTmdb<MovieSliderProps>(`/search/multi?query=${searchValue}&include_adult=false&language=ru-ru&page=1`)
            .then(res => {
                setData(res)
                console.log(res)
            })
            .catch(err => console.error(err));
    

    }, [searchValue])

    return (
        data
    )
}

export default useSearchMovie