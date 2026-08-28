
import './App.css'


import type { RootState } from "./store/store";

import Button from './components/UI/Button'
import useMoviesData from './Hooks/useMoviesData';
import { MovieSlider } from './components/MovieSlider/MovieSlider'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setPage } from './store/pageNumber';
import BackgroundPosters from './components/Background/BackgroundPosters';
// import useGetMovieInfo from './Hooks/useGetMovieInfo';
import { setSearchBarValue } from './store/searchBar';
import useSearchMovie from './Hooks/useSearchMovie';


function App() {

    const dispatch = useDispatch();

    const page = useSelector((state: RootState) => state.numberOfPageInSlider.value);
    const searchBarValue = useSelector((state: RootState) => state.searchBarValue.value);
    
    
    const moviesArray = useMoviesData(page);
    // const movieData = useGetMovieInfo(19995);

    const nextPage = () => {

        /* если открыта последняя страница, то она устанавливается на самую первую */
        const currentPage = page === 500 ? 1 : page + 1;
        dispatch(setPage(currentPage))
    }

    const previousPage = () => {
        /* если открыта первая страница, то она устанавливается на самую посленюю */
        const currentPage = page === 1 ? 500 : page - 1;
        dispatch(setPage(currentPage))
    }

    const randomNumber = (min:number, max:number) => {

        return Math.floor(min + Math.random() * (max + 1 - min));
        
        
    }
    
    const [sliderPages] = useState(() => ({
      first: randomNumber(1, 3),
      second: randomNumber(4, 7),
      third: randomNumber(8, 11),
      fourth: randomNumber(12, 15),
    }));

    const searchValueArray = useSearchMovie(searchBarValue);

    useEffect(() => {
        

        //console.log('moviesArray = ', moviesArray)
        // console.log(movieData)
        // console.log(searchBarValue)
    })

    

    
    return (
        <>
        
        <div className=" w-screen h-screen overflow-hidden flex items-center justify-center absolute select-none">
            <section className="
                absolute left-1/2 top-1/2 
                flex w-[160%] h-size
                -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] 
                flex-col items-center justify-center select-none opacity-25">
                
                <BackgroundPosters page={sliderPages.first} direction={false} />
                <BackgroundPosters page={sliderPages.second} direction />
                <BackgroundPosters page={sliderPages.third} direction={false} />
                <BackgroundPosters page={sliderPages.fourth} direction />

            </section>
        </div>

        <section id="center" className='relative z-1 flex flex-col justify-center items-center w-screen h-screen'>

            <div>
                <input type="search" name="search" id="search" onChange={(event) => {
                    dispatch(setSearchBarValue(event.target.value))
                }} className="
                    flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200
                    hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95" />
                    
            </div>
            <section>
                
                {
                    searchBarValue == '' ? <MovieSlider media={moviesArray}/>
                    : <MovieSlider media={searchValueArray?.results ?? []} />
                }
            
            </section>
                
            <section>
                
                <Button onClick={() => previousPage()} label='предыдущая страница' className='
                rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'/>
                <Button onClick={() => nextPage()} label='следующая страница' className='
                rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'/> 
                
                
            </section>
              
         
        </section>
      
      </>
    )
}

export default App
