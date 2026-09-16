import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../store/openModal";
import Button from "./UI/Button";
import useGetMovieInfo from "../HooksTMDB/useGetMovieInfo";
import useGetConfiguration from "../HooksTMDB/useGetConfiguration";
import type { MovieRatings } from "../HooksExcelMovies/useGetMovies";
import { getTmdbImageUrl } from "../api/tmdbImage";
import type { MovieSource } from "../api/movieSource";

type ModalProps = {

    isHidden?: string;
    movie_ID: number;
    source?: MovieSource;
    ratings: MovieRatings[];
    excelMovieTitle?: string;

}

const Modal = ({isHidden = 'hidden', movie_ID, source = 'tmdb', ratings, excelMovieTitle }: ModalProps) => {
    
    const dispatch = useDispatch();
    
    const { data: movieInfo, error: movieError } = useGetMovieInfo(movie_ID, source);
    const { data: configTMDB, error: configError } = useGetConfiguration();
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);
    const isLoading = !movieInfo || !configTMDB;

    useEffect(() => {
        if (!isLoading) {
            return;
        }

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isLoading]);


    const posterSize = 'original';
    const hasError = isLoading && (!isOnline || Boolean(movieError || configError));

    const title = movieInfo?.title
    const description = movieInfo?.overview
    const image = movieInfo?.poster_path
        ? source === 'kinopoisk' ? movieInfo.poster_path : getTmdbImageUrl(posterSize, movieInfo.poster_path)
        : null;
    const voteAverage = movieInfo?.vote_average;
    const excelMovie = excelMovieTitle
        ? ratings.find((movie) => movie.movie.trim().toLowerCase() === excelMovieTitle.trim().toLowerCase())
        : undefined;
    const excelRatings = excelMovie?.ratings ?? [];
    const overallRating = excelRatings[0]?.scores[1];
    const watchDate = excelMovie?.date ? formatDateFromExcel(excelMovie.date) : '';

    const closeModalHandler = () => {
            
        dispatch(closeModal())
        
    }

    function voteColor(voteAverage:number) {
        // Ограничиваем значение в диапазоне от 0 до 10
        const clampedValue = Math.max(0, Math.min(10, voteAverage));
          
        // Рассчитываем оттенок (Hue): 0 -> 0 (красный), 5 -> 60 (жёлтый), 10 -> 120 (зелёный)
        const hue = (clampedValue / 10) * 120;
          
        // Возвращаем HSL строку (насыщенность 100%, яркость 45% для насыщенности цвета)
        return `hsl(${hue}, 100%, 45%)`;
    }

    function formatDate(date: string): string {
        const [year, month, day] = date.split("-");

        const months = [
            "января", "февраля", "марта", "апреля",
            "мая", "июня", "июля", "августа",
            "сентября", "октября", "ноября", "декабря",
        ];

        return `${day} ${months[Number(month) - 1]} ${year}`;
    }

    function formatDateFromExcel(date: string): string {
        const normalizedDate = date.trim();
        const match = normalizedDate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/)
            || normalizedDate.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);

        if (!match) {
            return normalizedDate;
        }

        const [, first, second, third] = match;
        const day = Number(first.length === 4 ? third : first);
        const month = Number(first.length === 4 ? second : second);
        const year = Number(first.length === 4 ? first : third);

        const months = [
            "января", "февраля", "марта", "апреля",
            "мая", "июня", "июля", "августа",
            "сентября", "октября", "ноября", "декабря",
        ];

        return `${day} ${months[month - 1]} ${year}`;
    }

    if (isLoading) {
        return (
            <div
                id="modalWrapper"
                className={`w-full h-full fixed select-text inset-0 z-50 flex items-center justify-center bg-black/50 ${isHidden}`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeModalHandler();
                    }
                }}
            >
                <div
                    className="modal-loading flex h-48 w-full max-w-md flex-col items-center justify-center gap-5 rounded-2xl bg-white p-6 text-lg font-semibold text-slate-900 shadow-xl dark:bg-slate-900 dark:text-white"
                >
                    <div role="status" aria-live="polite" className="flex items-center justify-center">
                        {hasError
                            ? (isOnline
                                ? "Не удалось загрузить данные. Попробуйте перезагрузить страницу."
                                : "Нет подключения к интернету. Проверьте соединение.")
                            : <div className="flex justify-center items-center gap-5 flex-col"> Загрузка
                                <div
                                    aria-label="Загрузка"
                                    className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
                                />
                            </div>}
                    </div>
                    <Button
                        label="Закрыть"
                        onClick={closeModalHandler}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                    />
                </div>
            </div>
        );
    }

    return (
  
    <div 
        id="modalWrapper" 
        className={`w-full h-full fixed select-text inset-0 z-50 flex items-center justify-center gap-16 bg-black/50 ${isHidden}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeModalHandler();
          }
    }}>

        <div className="modal-info w-full max-w-120 h-full max-h-170 flex flex-col items-center justify-evenly rounded-bl-2xl rounded-xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900">

            <div className="w-full h-full max-h-30 flex flex-col items-center justify-center rounded-2xl bg-white transition-all dark:bg-slate-800">
                
                        <h4 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Жанр
                </h4>
                
                <div className="w-full flex justify-evenly text-slate-200 text-center overflow-y-auto mb-2 flex-wrap">
                    
                    {movieInfo?.genres.map(element => {
                    
                        return (
                            <div className="w-full max-w-30 bg-slate-500 m-2 rounded-tr-2xl rounded-bl-2xl shadow-amber-500">
                                <p className="p-0.5">{element.name}</p>
                            </div>
                            
                        )
                        
                    })}
                    
                </div>

            </div>

            <div className="w-full h-max p-2 flex flex-col items-center justify-center rounded-2xl bg-white transition-all dark:bg-slate-800">
                
                <h4 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Оценка {source === 'kinopoisk' ? 'Кинопоиска' : 'TMDB'}
                </h4>
                
                <div className="w-full flex flex-col justify-center text-slate-200 text-center">
                    
                    <div className="flex justify-center gap-2">
                        <p> <span
                              style={{
                                color: voteColor(Number(voteAverage)),
                              }}
                            >{voteAverage?.toFixed(2)}</span> / 10</p>
                        
                        <svg width="25" height="25" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="yellow" stroke="gold" stroke-width="2"/>
                        </svg>
                    </div>
                    <div>

                        <p>Всего людей оценило: {movieInfo?.vote_count}</p>

                    </div>

                </div>

            </div>

            {excelRatings.length > 0 && (
                <div className="flex h-full w-full max-h-80 flex-col rounded-2xl bg-white p-3 text-slate-900 transition-all dark:bg-slate-800 dark:text-white">
                    <h4 className="mb-2 shrink-0 text-center text-lg font-semibold">Оценки Киноклуба</h4>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-3 text-sm">
                            {excelRatings.map((rating, index) => (
                                <p key={`${rating.userName}-${index}`} className="flex items-center justify-evenly">
                                    <span className="w-2/5 text-left text-lg">{rating.userName}</span>
                                    <span className="w-1/5 text-right">{rating.scores[0] ?? '—'}</span>
                                </p>
                            ))}
                        </div>
                    </div>
                    {overallRating && (
                        <p className="mt-1 flex h-8 items-center justify-center border-t border-slate-300 text-center font-semibold leading-5 dark:border-slate-600">
                            Средняя оценка: {overallRating}
                        </p>
                    )}
                </div>
            )}

            <div className="w-full h-max flex flex-col items-center justify-center rounded-2xl bg-white p-1 transition-all dark:bg-slate-800">
                
                <h3 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Год выпуска — {formatDate(String(movieInfo?.release_date))}
                </h3>

            </div>

            <div className="w-full h-max flex flex-col items-center justify-center rounded-2xl bg-white p-1 transition-all dark:bg-slate-800">
                
                <h4 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Дата просмотра — {watchDate}
                </h4>

            </div>

        </div>

        <div className="size-max flex items-center justify-center rounded-bl-2xl rounded-tl-2xl shadow-xl transition-all">


            <div className="modal-description w-130 max-w-150 h-max flex items-center justify-center flex-col rounded-bl-2xl rounded-tl-2xl dark:bg-slate-900">
                
                <div className="m-5">

                    <h2 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    {title}
                    </h2>

                </div>

                <p className="w-full h-full max-h-80 p-5 text-justify text-sm leading-relaxed overflow-y-auto text-white dark:text-slate-300">

                    {description}
                    
                </p>
                <div className="mt-6 flex justify-end gap-3 m-3">          
                    <Button label="Закрыть" onClick={closeModalHandler} className="
                    rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2" />
                </div>

            </div>

            <div className="w-full max-w-md rounded-2xl bg-white p-3 shadow-xl transition-all dark:bg-slate-900">

                <img src={image ?? ''} alt={title} className="w-full h-full max-w-110 max-h-200" />


            </div>

        </div>


    </div>
  )
}

export default Modal