import { useSelector } from 'react-redux';
import usePopularMovies from '../HooksTMDB/usePopularMovies';
import type { RootState } from '../store/store';

const BackgroundPosters = ({page, direction}:{page:number, direction?:boolean}) => {

    const popularMoviesArray = usePopularMovies(page);
    const isModalOpen = useSelector((state: RootState) => state.openModal.value)


    const posterSize:string = 'w200';
    const posterURLPlaceholder:string = `https://image.tmdb.org/t/p`;

    const postersURL = popularMoviesArray.map((image) => {
        return `${posterURLPlaceholder}/${posterSize}${image.poster_path}`;
    })

    const newPostersURL = [...postersURL, ...postersURL]


  return (
    <div className={`size-full flex items-center will-change-transform gap-5 mt-2 mb-2`}
    style={{
        animation: `${direction ? 'slideMoveRight' : 'slideMoveLeft'} 200s linear infinite`,
        animationPlayState: isModalOpen ? 'paused' : 'running',
    }}>
            

        {newPostersURL.map((poster, index) => (
            <img
                key={index}
                src={poster}
                alt=""
                loading="lazy"
                decoding="async"
                width="200"
                height="300"
                className="h-full w-40 rounded-4xl shrink-0"
            />
        ))}
              
    </div>
  )
}

export default BackgroundPosters