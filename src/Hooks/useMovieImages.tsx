import { useEffect, useState } from "react";
import { fetchTmdb } from "../api/tmdb";


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

        fetchTmdb<{ backdrops: MovieImageData[]; posters: MovieImageData[] }>(`/movie/${movie_id}/images?include_image_language=ru`)
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