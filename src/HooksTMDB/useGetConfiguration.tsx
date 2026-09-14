import { useEffect, useState } from 'react'
import { fetchTmdb } from '../api/tmdb';

type ConfigAPI = {

    change_keys: string[];
    images: ImagesConfig;

}

type ImagesConfig = {

    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];

}

const useGetConfiguration = () => {

    const [data, setData] = useState<ConfigAPI | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setError(null);

        fetchTmdb<ConfigAPI>(`/configuration`)
            .then(res => {
                setData(res)
            })
            .catch(err => {
                console.error(err);
                setError(err instanceof Error ? err : new Error('Не удалось загрузить конфигурацию'));
            });
    

    }, [])

    return { data, error };
}

export default useGetConfiguration