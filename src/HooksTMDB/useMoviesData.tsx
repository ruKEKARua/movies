import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { changeSliderPosition } from "../store/sliderMove";
import { fetchTmdb } from "../api/tmdb";


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


type KnownForMovie = {
  id: number;
};

const useMoviesData = (page:number=1) => {
    const dispatch = useDispatch();

    const [data, setData] = useState<Movie[]|Person[]>([]);

    useEffect(() => {

        fetchTmdb<{ results: Movie[]|Person[] }>(`/discover/movie?include_adult=false&include_video=false&language=ru-ru&page=${page}&sort_by=vote_count.desc`)
            .then(res => {
                setData(res.results)
            })
            .catch(err => console.error(err));

        dispatch(changeSliderPosition(0));
        

    }, [page, dispatch])

    return (
        data
    )
}

export default useMoviesData