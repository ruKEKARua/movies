import './App.css'


import type { RootState } from "./store/store";

import Button from './components/UI/Button'
import { MovieSlider } from './components/MovieSlider'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import BackgroundPosters from './components/BackgroundPosters';

import useGetMovies from './HooksExcelMovies/useGetMovies';
import useSearchMovie from './HooksTMDB/useSearchMovie';
import { setSearchBarValue } from './store/searchBar';
import useSetArrayOfSearchedMovies from './HooksTMDB/useSetArrayOfSearchedMovies';
import MovieEntryPage from './pages/MovieEntryPage';


type PageMode = 'main' | 'entry';

function App() {

    const dispatch = useDispatch();
    const [page, setPage] = useState<PageMode>('main');
    const [isAddMovieRequested, setIsAddMovieRequested] = useState(false);

    const searchBarValue = useSelector((state: RootState) => state.searchBarValue.value);
    const moviesFromExcel = useSelector((state: RootState) => state.setExcelMovies.value)
    const foundMovies = useSelector((state: RootState) => state.foundMovies.value);
    
    const searchValueArray = useSearchMovie(searchBarValue);

    const normalizedSearchValue = searchBarValue.trim().toLowerCase();
    const filteredSliderMovies = normalizedSearchValue
        ? foundMovies.filter((movie) => {
            if (movie.media_type === 'person') {
                return false;
            }

            return [movie.title, movie.original_title].some((title) =>
                title?.toLowerCase().includes(normalizedSearchValue)
            );
        })
        : foundMovies;

    const { login, isAuthorized, isLoading, userName, userPicture, usersRating, participantNames, saveMovie } = useGetMovies();
    useSetArrayOfSearchedMovies(moviesFromExcel);

    const randomNumber = (min:number, max:number) => {

        return Math.floor(min + Math.random() * (max + 1 - min));
        
        
    }
    
    const [sliderPages] = useState(() => ({
        first: randomNumber(1, 3),
        second: randomNumber(4, 7),
        third: randomNumber(8, 11),
        fourth: randomNumber(12, 15),
    }));

    

    useEffect(() => {

        //console.log('moviesArray = ', moviesArray)
        console.log('searchBar = ', searchValueArray)
        console.log('Кино с экселя = ', moviesFromExcel)
        console.log('Тест = ', foundMovies)
        console.log('Оценили: ', usersRating);

    }, [foundMovies, moviesFromExcel, searchValueArray, usersRating])


    if (page === 'entry' || (isAddMovieRequested && isAuthorized)) {
        return (
            <div className='app-entry-screen min-h-screen bg-slate-950 text-white'>
                <div className='flex justify-end p-4'>
                    <Button
                        className='rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700'
                        onClick={() => {
                            setPage('main');
                            setIsAddMovieRequested(false);
                        }}
                        label='Вернуться к каталогу'
                    />
                </div>
                <MovieEntryPage participantNames={participantNames} onSave={saveMovie} />
            </div>
        );
    }

    return (
        <>
            <div className='auth-panel bg-sky-700 z-10 rounded-br-full absolute'>
                {!isAuthorized ? (
                    <Button className='text-amber-50' onClick={login} label='Авторизоваться с помощью Google' />
                ) : (
                    <div className='flex items-center gap-2 text-amber-50 px-4 py-2'>
                        {userPicture && (
                            <img
                                src={userPicture}
                                alt='Аватар пользователя'
                                referrerPolicy='no-referrer'
                                className='w-8 h-8 rounded-full object-cover'
                            />
                        )}
                        <p className='auth-label'>
                            {userName ? (
                                <>
                                    Вы вошли как: <span className='text-amber-400'>{userName}</span>
                                </>
                            ) : 'Вы вошли в аккаунт Google'}
                        </p>
                    </div>
                )}
            </div>

            <div className='top-actions absolute right-4 top-4 z-20 flex gap-2'>
                <Button
                    className='rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400'
                    onClick={() => {
                        if (isAuthorized) {
                            setPage('entry');
                            return;
                        }

                        setIsAddMovieRequested(true);
                        login();
                    }}
                    label={isAuthorized ? 'Добавить фильм' : 'Войти и добавить фильм'}
                />
            </div>

        <div className="background-layer w-screen h-screen overflow-hidden flex items-center justify-center absolute select-none">
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

        <section id="center" className='app-content relative z-1 flex flex-col justify-center items-center w-screen h-screen'>

            <header className='app-header'>
                <div className='search-section text-center justify-center items-center'>
                    <h2>Поиск по названию или имени</h2>
                    <div className='w-full'>
                        <input type="search" name="search" id="search" aria-label="Поиск по названию или имени" onChange={(event) => {
                            dispatch(setSearchBarValue(event.target.value))
                        }} className="search-input m-auto
                            flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200
                            hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95" />
                    </div>
                </div>
            </header>

            <section className='slider-section w-full flex items-center justify-center'>
                
                {
                    searchBarValue.trim() === '' ? <MovieSlider media={foundMovies} ratings={usersRating} isLoading={isLoading}/>
                    : filteredSliderMovies.length > 0 ? <MovieSlider media={filteredSliderMovies} ratings={usersRating}/>
                    : <MovieSlider media={searchValueArray?.results ?? []} ratings={usersRating} />
                }
            
            </section>
                
            {/* <section>
                
                <Button onClick={() => previousPage()} label='предыдущая страница' className='
                rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'/>
                <Button onClick={() => nextPage()} label='следующая страница' className='
                rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'/> 
                
                
            </section> */}
              
         
        </section>
      
      </>
    )
}

export default App
