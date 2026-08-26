import { Swiper, SwiperSlide } from "swiper/react";
import Button from "../UI/Button";
import { Autoplay, FreeMode, Navigation } from "swiper/modules";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";

type MovieImage = {
  file_path: string;
};

type InfiniteSliderProps = {
  posters: MovieImage[];
};

export default function InfiniteSlider({posters}:InfiniteSliderProps) {

    const isModalOpen = useSelector((state: RootState) => state.openModal.value)


    const movieImages = posters;
    const posterSize:string = 'w400';
    const posterURLPlaceholder:string = `https://image.tmdb.org/t/p`;

    const backdropsURLs = movieImages.slice(0,21).map((image) => {
        return `${posterURLPlaceholder}/${posterSize}${image.file_path}`;
    })
    

    // Дублируем массив, чтобы гарантировать бесшовность
    //const doubledImages = [...images, ...images];

    

    return (
        <div className="
        w-full h-full max-w-md rounded-2xl bg-white overflow-hidden scrollbar-none dark:bg-slate-900 flex justify-center items-center">


            <Swiper
                modules={[Navigation, Autoplay, FreeMode]}
                slidesPerView={1}
                slidesPerGroup={1}
                spaceBetween={0}
                navigation={{enabled:true, nextEl:'.nextButton2', prevEl:'.prevButton2'}}
                rewind={true}

                enabled={isModalOpen}

                freeMode={{momentum:false, enabled:true}}
                autoplay={{enabled:false, delay:100}}

                grabCursor={true}

                className="flex justify-center items-center"
            >

                {
                    backdropsURLs.map((poster, index) => {

                        return(
                        
                            <SwiperSlide key={index} virtualIndex={index}>
                            
                                
                                <img src={poster} loading="lazy" decoding="async" className="w-full h-full m-auto object-fill" />


                            </SwiperSlide>
                        )
                    })
                }

            </Swiper>

                
            <div className="absolute right-45 -top-25 flex justify-between flex-col gap-20 w-20 h-35 rotate-270">
                <Button

                    children={
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5L15 12L8 19" 
                                stroke="#61b28a" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                />
                        </svg>}
                    className="
                        rotate-270
                        rounded-full w-20 h-10 
                        flex justify-center items-center 
                        text-xl font-medium bg-blue-600 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 prevButton2"
                    />
                <Button
                    children={
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5L15 12L8 19" 
                                stroke="#61b28a" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                />
                        </svg>}
                    className="
                        rotate-90
                        rounded-full w-20 h-10 
                        flex justify-center items-center 
                        text-xl font-medium bg-blue-600 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 nextButton2"
                    />
            </div>

            {/* здесь можно вывести список из картинок по 1 штуке */}
            {/* <div className="w-55 h-55 animate-marquee flex flex-col gap-4">
                {backdropsURLs.map((src, index) => (
                    <div key={index} className="h-full w-full flex shrink-0 overflow-hidden rounded-lg">
                        <img 
                          src={src} 
                          alt={`Slide ${index}`} 
                          className="h-full w-full object-cover" 
                        />
                    </div>
                ))}
            </div> */}

        {/* здесь можно вывести список из картинок по 3 штуки */}
        {/* {(() => {
            const groups = [];

            // Идем по массиву с шагом 3 и режем его на куски
            for (let i = 0; i < backdropsURLs.length; i += howMuchNeedBlocksForOneSlide) {
              const chunk = backdropsURLs.slice(i, i + howMuchNeedBlocksForOneSlide);
            
              groups.push(
                <div className={`flex flex-col gap-4`} key={i}>
                  {chunk.map((element) => {
                    const posterSize = 'w780';
                    const posterURLPlaceholder = `https://image.tmdb.org/t/p`;
                    const posterURL = `${posterURLPlaceholder}/${posterSize}${element}`;
                
                    return (

                        <img src={posterURL} className="min-w-50 min-h-80 m-auto" />

                    );
                  })}
                </div>
              );
            }

            return groups;
        })()}  */}
        
        </div>
    );
}