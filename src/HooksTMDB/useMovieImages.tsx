import { useEffect, useState } from "react";
import { getMovieImagesFromSource } from "../api/movieSource";
import type { MovieSource } from "../api/movieSource";


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

type MovieImagesType = keyof MovieImagesResponse;   

type MovieImagesProps = {

    movie_id: number; 
    postersType: MovieImagesType;
    source?: MovieSource;

}

const useMovieImages = ({ movie_id, postersType, source }: MovieImagesProps) => {
  const [data, setData] = useState<MovieImageData[]>([]);

    useEffect(() => {

      getMovieImagesFromSource(movie_id, source)

            .then((res) => {

                setData(res[postersType]);

            })
            
            .catch((err) => console.error(err));

    }, [movie_id, postersType, source]);

    return data;

};

export default useMovieImages