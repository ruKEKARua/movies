import { useEffect, useState } from "react";


type MovieImageData = {
    
    aspect_ratio?: number;
    file_path: string;
    height?: number;
    iso_639_1?:  string;
    iso_3166_1?:  string;
    vote_average?: number;
    vote_count?: number;
    width?: number;
    
    
}

const useMovieImages = (movie_id: number) => {


    const [data, setData] = useState<MovieImageData[]>([]);
    

    useEffect(() => {

        //TMDB
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',     
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMGNkYzg4ZmMzYmFhMWY1OGY0YWVlMmJhNjc1ODVmMCIsIm5iZiI6MTc2Nzk5NzYyNS44NDE5OTk4LCJzdWIiOiI2OTYxODBiOTBmN2YxZTExYmZiZDMyN2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.b7jGWGbG_wwjO-NAAQY0cvT5opshPJHLLRo6AYfb6kY'}
        };
        
        fetch(`https://api.themoviedb.org/3/movie/${movie_id}/images?include_image_language=ru`, options)
            .then(res => res.json())
            .then(res => {
                //const data1 = res.logos;
                const data2 = res.backdrops;
                const data3 = res.posters;
                const result = [...data2, ...data3]
                setData(result)
            })
            .catch(err => console.error(err));

        
        

    }, [movie_id])

    return (
        data
    )
}

export default useMovieImages