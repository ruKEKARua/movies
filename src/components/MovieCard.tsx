type MovieCardProps = {

    id: number;
    title: string;
    posterPath: string;
    func: (id: number) => void;

}

const MovieCard = ({id=0, title = '', posterPath = '', func}: MovieCardProps) => {
  return (
    <div className="movie-card w-60 m-auto gap-5 flex flex-col justify-center items-center" key={id} >

        <p className="movie-title text-white">
            {title}
        </p>

        <div
            className="movie-poster poster-clickable m-auto rounded-2xl"
            role="button"
            tabIndex={0}
            aria-label={`Открыть описание: ${title}`}
            onClick={() => func(id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    func(id);
                }
            }}
        >
        <img src={posterPath} alt={title} className="movie-poster-image m-auto rounded-2xl"/>
        <div className="
            text-[#ffeb3b] text-5xl absolute top-11 right-15
            ">*</div>
        </div>


    </div>
  )
}

export default MovieCard