import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchTmdb } from "../api/tmdb";


type PopularMovieData = {

    id: number;
    backdrop_path: string;
    original_title: string;
    title: string;
    overview: string;
    poster_path: string;

    
}

const usePopularMovies = (page:number) => {
    const dispatch = useDispatch();

    const [data, setData] = useState<PopularMovieData[]>([]);

    useEffect(() => {

        fetchTmdb<{ results: PopularMovieData[] }>(`/movie/popular?language=ru-ru&page=${page}`)
            .then(res => {
                setData(res.results)
            })
            .catch(err => console.error(err));
    

    }, [page, dispatch])

    return (
        data
    )
}

export default usePopularMovies