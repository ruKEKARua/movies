import { useState } from "react";
import Button from "../UI/Button";
import { useDispatch, useSelector } from "react-redux";

import { openModal } from "../../store/openModal";
import Modal from "./Modal";
import type { RootState } from "../../store/store";

// import Swiper styles
import 'swiper/css';
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import SearchBar from "../SearchBar/SearchBar";


type Movie = {

    media_type: 'movie' | 'tv'; // обязательно, что это фильм или сериал
    id: number; // айдишник
    backdrop_path: string; // постер на оригинальном языке
    original_title: string; // название на оригинальном языке (в частности английский)
    title: string; // название на русском
    overview: string; // описание
    poster_path: string; // постер на русском

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
};


// Как мы укажем тип MovieSliderProps для пропсов функции?
export function MovieSlider({ media }: MovieSliderProps ) {
    
    const dispatch = useDispatch();
    
    // приходит в переменню true или false
    const isModalOpen = useSelector((state: RootState) => state.openModal.value)
    const page = useSelector((state: RootState) => state.numberOfPageInSlider.value)
    
    
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [image, setImage] = useState<string>('');
    const [movie_ID, setMovie_ID] = useState<number | null>(null);        

    const posterSize = 'w780';
    const posterURLPlaceholder = `https://image.tmdb.org/t/p`;

    const openDescription = (movieTitle:string, movieDescription:string, movieImage:string, movieID:number) => {
        
        setMovie_ID(movieID)
        setTitle(movieTitle)
        setDescription(movieDescription)
        setImage(movieImage)
        
        
        dispatch(openModal())

    }


    return (
        media.length > 0 ? <div className="select-none">

            <h1>Номер страницы: {page}</h1>

            <SearchBar/> <br></br>


            <div className="relative flex items-center justify-center w-300 h-120 rounded-3xl shadow-[inset-20] select-auto page-enter" key={page}>


                <Swiper

                    modules={[Navigation, FreeMode]}
                    slidesPerView={media.length > 3 ? 3.25 : media.length}
                    slidesPerGroup={1}
                    
                    freeMode={{momentum:false, enabled:false}}
                    navigation={{enabled:true, nextEl:'.nextButton', prevEl:'.prevButton'}}
                    loop={true}
                   

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

                                return (

                                    
                                    <SwiperSlide key={key} className="p-5">
                                    
                                        <div className="w-60 h-120 m-auto gap-5 flex flex-col justify-center items-center" key={media.id} >

                                            <p className="text-white">
                                                {movieVariables.title ? movieVariables.title : movieVariables.original_title}
                                            </p>

                                            <div className="min-w-50 min-h-80 m-auto rounded-2xl"
                                            style={{boxShadow: `
                                                7px 16px 26px 25px rgba(0,0,0,0.7)
                                                `}}>
                                            <img src={movieVariables.poster_path} className="min-w-50 min-h-80 m-auto rounded-2xl"/>
                                            <div className="
                                                text-[#ffeb3b] text-5xl absolute top-11 right-15
                                                ">*</div>
                                            </div>
                                            <Button
                                                onClick={() => openDescription(
                                                    movieVariables.title, movieVariables.overview,
                                                    movieVariables.poster_path, movieVariables.id)}
                                                label="Поробнее"
                                                className="
                                                rounded-xl px-10 py-2 text-xl font-medium bg-blue-600 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                            />


                                        </div>

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
                            const description = personVariables.known_for_department;
                            const image = personVariables.profile_path;
                            const movieId = personVariables.known_for[0]?.id;

                            return(
                                <SwiperSlide key={key} className="p-5">

                                    <div className="w-60 h-120 m-auto gap-5 flex flex-col justify-center items-center" key={media.id} >

                                        <p className="text-white">
                                            {personVariables.original_name ? personVariables.name : personVariables.original_name}
                                        </p>

                                        <div className="min-w-50 min-h-80 m-auto rounded-2xl"
                                        style={{boxShadow: `
                                            7px 16px 26px 25px rgba(0,0,0,0.7)
                                            `}}>
                                        <img src={personVariables.profile_path} className="min-w-50 min-h-80 m-auto rounded-2xl"/>
                                        <div className="
                                            text-[#ffeb3b] text-5xl absolute top-11 right-15
                                            ">*</div>
                                        </div>
                                        {movieId !== undefined && (
                                        <Button
                                            onClick={() =>
                                            openDescription(
                                                russianName,
                                                description,
                                                image,
                                                movieId
                                            )
                                            }
                                            label="Подробнее"
                                            className="rounded-xl px-10 py-2 text-xl font-medium bg-blue-600"
                                        />
                                        )}


                                    </div>

                                </SwiperSlide>
                            )
                        })
                    }

                </Swiper>

                <div
                    className={`pointer-events-none absolute inset-0 z-10 rounded-3xl h-140 -top-5
                        ${media.length < 4 ? 'opacity-0' : ''}
                        `}
                    style={{boxShadow: `
                        inset 00px 0px 16px -8px rgba(0,0,0,0.6), inset -100px 0px 16px -16px rgba(0,0,0,0.6)
                        `}}
                />

                <div className="pointer-events-auto absolute -z-1 w-340 h-10 flex justify-between">
                    <Button className="
                        w-10 h-10 bg-green-100 text-white rounded-full flex items-center justify-center z-1 rotate-180 prevButton"
                        children={
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5L15 12L8 19" 
                                    stroke="#61b28a" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    />
                            </svg>} />

                    <Button className="
                        w-10 h-10 bg-green-100 text-white rounded-full flex items-center justify-center z-1 nextButton"
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
                    title={title}
                    description={description}
                    image={image}
                    movie_ID={movie_ID}
                  />
                )}
            </div>
        </div>  
        : <h1>Ничего не найдено</h1>
    );
}