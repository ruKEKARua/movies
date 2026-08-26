import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { changeSliderPosition } from "../store/sliderMove";


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

        //TMDB
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',     
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMGNkYzg4ZmMzYmFhMWY1OGY0YWVlMmJhNjc1ODVmMCIsIm5iZiI6MTc2Nzk5NzYyNS44NDE5OTk4LCJzdWIiOiI2OTYxODBiOTBmN2YxZTExYmZiZDMyN2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.b7jGWGbG_wwjO-NAAQY0cvT5opshPJHLLRo6AYfb6kY'}
        };
        
        fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=ru-ru&page=${page}&sort_by=vote_count.desc`, options)
            .then(res => res.json())
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