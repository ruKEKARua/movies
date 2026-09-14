import usePopularMovies from '../HooksTMDB/usePopularMovies';

const BackgroundPosters = ({page, direction}:{page:number, direction?:boolean}) => {

    const popularMoviesArray = usePopularMovies(page);
    const posterSize:string = 'w92';
    const posterURLPlaceholder:string = `https://image.tmdb.org/t/p`;

    const postersURL = popularMoviesArray.map((image) => {
        return `${posterURLPlaceholder}/${posterSize}${image.poster_path}`;
    })

    //const newPostersURL = [...postersURL, ...postersURL]


  return (
    <div className="size-full flex items-center gap-5 mt-2 mb-2"
    style={{
        transform: `translateX(${direction ? 150 : -150}px)`,
    }}>
            

        {postersURL.map((poster, index) => (
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