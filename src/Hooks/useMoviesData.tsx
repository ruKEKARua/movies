import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { changeSliderPosition } from "../store/sliderMove";
import { fetchTmdb } from "../api/tmdb";


type MovieData = {

    id: number;
    backdrop_path: string;
    original_title: string;
    title: string;
    overview: string;
    poster_path: string;

    
}

const useMoviesData = (page:number=1) => {
    const dispatch = useDispatch();

    const [data, setData] = useState<MovieData[]>([]);

    useEffect(() => {

        fetchTmdb<{ results: MovieData[] }>(`/discover/movie?include_adult=false&include_video=false&language=ru-ru&page=${page}&sort_by=vote_count.desc`)
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