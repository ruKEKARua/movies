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

type MovieImagesResponse = {
  backdrops: MovieImageData[];
  logos: MovieImageData[];
  posters: MovieImageData[];
};


type MovieImagesProps = {

    movie_id: number; 
    postersType: string;

}

const useMovieImages = ({ movie_id, postersType }: MovieImagesProps) => {
  const [data, setData] = useState<MovieImageData[]>([]);

    useEffect(() => {

      fetchTmdb<MovieImagesResponse>(`/movie/${movie_id}/images`)

            .then((res) => {

                setData(res[postersType]);

            })
            
            .catch((err) => console.error(err));

    }, [movie_id, postersType]);

    return data;

};

export default useMovieImages