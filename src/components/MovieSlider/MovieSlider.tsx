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

    id: number;
    backdrop_path: string;
    original_title: string;
    title: string;
    overview: string;
    poster_path: string;


};

type MovieSliderProps = {
  movies: Movie[];
};


// Как мы укажем тип MovieSliderProps для пропсов функции?
export function MovieSlider({ movies }: MovieSliderProps ) {
    
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
        <div className="select-none">

            <h1>Номер страницы: {page}</h1>

            <SearchBar/> <br></br>


            <div className="relative flex items-center justify-center w-300 h-120 rounded-3xl shadow-[inset-20] select-auto   page-enter" key={page}>


                <Swiper

                    modules={[Navigation, FreeMode]}
                    slidesPerView={3.25}
                    slidesPerGroup={1}

                    
                    speed={1000}
                    
                    freeMode={{momentum:false, enabled:false}}
                    navigation={{enabled:true, nextEl:'.nextButton', prevEl:'.prevButton'}}
                    loop={true}
                   

                    className="rounded-3xl bg-gray-600/10"
                >

                    {
                        movies.map((movie, key) => {

                            const posterURL = `${posterURLPlaceholder}/${posterSize}/${movie.poster_path}`;
                            const russian_title = movie.title;
                            const original_title = movie.original_title;
                            const overview = movie.overview;
                            const movieID = movie.id;

                            return(
                            
                                <SwiperSlide key={key} className="p-5">
                                
                                    <div className="w-60 h-120 m-auto gap-5 flex flex-col justify-center items-center" key={movie.id} >
                                        <p className="text-white">
                                            {russian_title ? russian_title : original_title}
                                        </p>
                                    
                                        <div className="min-w-50 min-h-80 m-auto rounded-2xl"
                                        style={{boxShadow: `
                                                    7px 16px 26px 25px rgba(0,0,0,0.7)
                                                    `}}>
                                            <img src={posterURL} className="min-w-50 min-h-80 m-auto rounded-2xl"/>
                                            <div className="
                                            text-[#ffeb3b] text-5xl absolute top-11 right-15
                                            ">*</div>
                                        </div>
                                        <Button
                                            onClick={() => openDescription(russian_title, overview, posterURL, movieID)}
                                            label="Поробнее"
                                            className="
                                            rounded-xl px-10 py-2 text-xl font-medium bg-blue-600 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        />


                                    </div>

                                </SwiperSlide>
                            )
                        })
                    }

                </Swiper>

                <div
                  className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
                  style={{boxShadow: `
                  inset 00px 0px 16px -8px rgba(0,0,0,0.6), inset -100px 0px 16px -16px rgba(0,0,0,0.6)
                  `}}
                />

                <div className="absolute z-20 w-340 h-10 flex justify-between">
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
    );
}