import { useLayoutEffect, useRef, useState } from 'react';

type MovieCardProps = {

    id: number;
    title: string;
    posterPath: string;
    overallRating?: string;
    func: (id: number) => void;

}

const MovieCard = ({id=0, title = '', posterPath = '', overallRating, func}: MovieCardProps) => {
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);

  useLayoutEffect(() => {
    const titleContainer = titleContainerRef.current;
    const titleElement = titleRef.current;

    if (!titleContainer || !titleElement) {
        return;
    }

    const updateTruncation = () => {
        setIsTitleTruncated(titleElement.scrollHeight > titleElement.clientHeight);
    };

    updateTruncation();

    const resizeObserver = new ResizeObserver(updateTruncation);
    resizeObserver.observe(titleContainer);

    return () => resizeObserver.disconnect();
  }, [title]);

  return (
    <div className="movie-card w-60 m-auto gap-5 flex flex-col justify-center items-center bg-slate-800/85 rounded-2xl" key={id} >

        <div className="movie-title-container" ref={titleContainerRef}>
            <p ref={titleRef} className={`movie-title text-white${isTitleTruncated ? ' movie-title-truncated' : ''}`}>
                {title}
            </p>
        </div>

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
        {posterPath ? (
            <img src={posterPath} alt={title} className="movie-poster-image m-auto rounded-2xl"/>
        ) : (
            <div aria-hidden="true" className="movie-poster-image flex items-center justify-center rounded-2xl bg-slate-700 px-4 text-center text-sm text-slate-300">
                Постер отсутствует
            </div>
        )}

        {overallRating && (
            <div className="movie-rating">
                <p className="w-8 h-5" aria-label={`Общая оценка: ${overallRating}`}>
                    {overallRating}
                </p>
            </div>
        )}

        </div>


    </div>
  )
}

export default MovieCard