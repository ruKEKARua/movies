import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";


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

        //TMDB
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',     
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMGNkYzg4ZmMzYmFhMWY1OGY0YWVlMmJhNjc1ODVmMCIsIm5iZiI6MTc2Nzk5NzYyNS44NDE5OTk4LCJzdWIiOiI2OTYxODBiOTBmN2YxZTExYmZiZDMyN2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.b7jGWGbG_wwjO-NAAQY0cvT5opshPJHLLRo6AYfb6kY'}
        };
        
        fetch(`https://api.themoviedb.org/3/movie/popular?language=ru-ru&page=${page}`, options)
            .then(res => res.json())
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