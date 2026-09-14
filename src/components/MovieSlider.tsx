import { useRef, useState } from "react";
import Button from "./UI/Button";
import { useDispatch, useSelector } from "react-redux";

import { openModal } from "../store/openModal";
import Modal from "./Modal";
import type { RootState } from "../store/store";

// import Swiper styles
import 'swiper/css';
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import MovieCard from "./MovieCard";
import type { MovieRatings } from "../HooksExcelMovies/useGetMovies";


type Movie = {

    media_type: 'movie' | 'tv'; // обязательно, что это фильм или сериал
    id: number; // айдишник
    backdrop_path: string; // постер на оригинальном языке
    original_title: string; // название на оригинальном языке (в частности английский)
    title: string; // название на русском
    overview: string; // описание
    poster_path: string; // постер на русском
    excelTitle?: string;

};

type Person = {

    media_type: 'person'; // обязательно, что это человек
    id: number; // айдишник
    gender: number; // гендер в числовом эквиваленте (what)
    name: string; // имя на русском
    original_name: string; // имя на оригинальном языке (в частности английский)
    known_for: KnownForMovie[]; // массив из фильмов, в которых учавствовал актёр
    profile_path: string; // ссылка на фото актёра
    known_for_department: string // "описание", например "Актёр" (актёрская деятельность)

};

type Media = Movie | Person;


type KnownForMovie = {
  id: number;
};

type MovieSliderProps = {
  media: Media[];
    ratings: MovieRatings[];
};


export function MovieSlider({ media, ratings }: MovieSliderProps ) {
    
    const dispatch = useDispatch();
    
    const isModalOpen = useSelector((state: RootState) => state.openModal.value)
    const page = useSelector((state: RootState) => state.numberOfPageInSlider.value)
    

    const [movie_ID, setMovie_ID] = useState<number | null>(null);
    const [excelMovieTitle, setExcelMovieTitle] = useState<string | undefined>();
    const swiperRef = useRef<{ slidePrev: () => void; slideNext: () => void } | null>(null);

    const posterSize = 'w780';
    const posterURLPlaceholder = `https://image.tmdb.org/t/p`;

    const openDescription = (movieID:number, sourceTitle?: string) => {
        
        setMovie_ID(movieID)
        setExcelMovieTitle(sourceTitle)
        
        
        dispatch(openModal())

    }


    return (
        media.length > 0 ? <div className="movie-slider">

            {/* <div>
                <h1 className="">Номер страницы: {page}</h1>

                <SearchBar/> <br></br>
            </div>         */}
                <div className="movie-slider-frame relative flex items-center justify-center rounded-3xl shadow-[inset-20] select-auto page-enter" key={page}>


                    <Swiper

                        modules={[Navigation, FreeMode]}
                        slidesPerView={1}
                        slidesPerGroup={1}
                        breakpoints={{
                            560: { slidesPerView: 2 },
                            900: { slidesPerView: media.length > 3 ? 3.25 : media.length },
                        }}
                        
                        pagination={true}

                        freeMode={{momentum:false, enabled:false}}
                        loop={true}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                    

                        className="rounded-3xl bg-gray-600/10"
                    >

                        {
                            media.map((media, key) => {

                                if (media.media_type != 'person') {
                                    
                                    const movieVariables: Movie = {
                                        
                                        media_type: media.media_type,
                                        poster_path: `${posterURLPlaceholder}/${posterSize}/${media.poster_path}`,
                                        title: media.title,
                                        original_title: media.original_title,
                                        overview: media.overview,
                                        id: media.id,
                                        backdrop_path: media.backdrop_path,
                                    }

                                    const title = movieVariables.title ? movieVariables.title : movieVariables.original_title;
                                    const id = movieVariables.id;
                                    const posterPath = movieVariables.poster_path;

                                    return (

                                        
                                        <SwiperSlide key={key} className="movie-slide p-5">
                                        
                                            <MovieCard
                                                id={id}
                                                title={title}
                                                posterPath={posterPath}
                                                func={(movieID) => openDescription(movieID, media.excelTitle)}
                                            />

                                        </SwiperSlide>

                                    )

                                }

                                const personVariables: Person = {

                                    media_type: 'person',
                                    id: media.id,
                                    gender: media.gender,
                                    name: media.name,
                                    original_name: media.original_name,
                                    known_for: media.known_for,
                                    profile_path: `${posterURLPlaceholder}/${posterSize}/${media.profile_path}`,
                                    known_for_department: media.known_for_department

                                }

                                const russianName = personVariables.name;
                                const originalName = personVariables.original_name;
                                //const knownFor = personVariables.known_for_department;
                                const image = personVariables.profile_path;
                                const movieId = personVariables.known_for[0]?.id;

                                const placeholderImage = `https://placehold.co/780x1170?text=${russianName}`;

                                return(
                                    <SwiperSlide key={key} className="movie-slide p-5">

                                        <div className="movie-card w-60 m-auto gap-5 flex flex-col justify-center items-center" key={media.id} >

                                            <p className="movie-title text-white">
                                                {russianName ? russianName : originalName}
                                            </p>

                                            <div
                                            className={`movie-poster poster-clickable m-auto rounded-2xl ${movieId === undefined ? 'poster-disabled' : ''}`}
                                            role={movieId !== undefined ? 'button' : undefined}
                                            tabIndex={movieId !== undefined ? 0 : undefined}
                                            aria-label={movieId !== undefined ? `Открыть описание: ${russianName || originalName}` : undefined}
                                            onClick={() => movieId !== undefined && openDescription(movieId)}
                                            onKeyDown={(event) => {
                                                if (movieId !== undefined && (event.key === 'Enter' || event.key === ' ')) {
                                                    event.preventDefault();
                                                    openDescription(movieId);
                                                }
                                            }}
                                            >
                                                <img src={personVariables.profile_path == 'https://image.tmdb.org/t/p/w780/null' ? placeholderImage : image} alt={russianName || originalName} className="movie-poster-image m-auto rounded-2xl"/>
                                            
                                            </div>

                                        </div>

                                    </SwiperSlide>
                                )
                            })
                        }

                    </Swiper>

                    <div
                        className={`slider-edge-shadow pointer-events-none absolute inset-0 z-10 rounded-3xl
                            ${media.length < 4 ? 'opacity-0' : ''}
                            `}
                    />

                    <div className="slider-controls pointer-events-none absolute z-20 flex justify-between">
                        <Button
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="
                            pointer-events-auto w-10 h-10 bg-green-100 text-white rounded-full flex items-center justify-center rotate-180 prevButton"
                            children={
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5L15 12L8 19" 
                                        stroke="#61b28a" 
                                        strokeWidth="3" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        />
                                </svg>} />

                        <Button
                            onClick={() => swiperRef.current?.slideNext()}
                            className="
                            pointer-events-auto w-10 h-10 bg-green-100 text-white rounded-full flex items-center justify-center nextButton"
                            children={
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5L15 12L8 19" 
                                        stroke="#61b28a" 
                                        strokeWidth="3" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        />
                                </svg>} />
                    </div>


                    {/* если true, то класс hidden снимается, иначе происходит отображение модального окна */}
                    {isModalOpen && movie_ID !== null && (
                    <Modal
                        isHidden=""
                        movie_ID={movie_ID}
                        ratings={ratings}
                        excelMovieTitle={excelMovieTitle}
                    />
                    )}
                </div>
            </div>  

        :   <div className="empty-slider flex items-center justify-center">
                <h1>Ничего не найдено</h1>
            </div>
    );
}