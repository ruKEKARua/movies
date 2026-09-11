import { useDispatch } from "react-redux";
import { closeModal } from "../store/openModal";
import Button from "./UI/Button";
import useGetMovieInfo from "../HooksTMDB/useGetMovieInfo";
import useGetConfiguration from "../HooksTMDB/useGetConfiguration";

type ModalProps = {

    isHidden?: string;
    movie_ID: number;

}

const Modal = ({isHidden = 'hidden', movie_ID }: ModalProps) => {
    
    const dispatch = useDispatch();
    
    const movieInfo = useGetMovieInfo(movie_ID);
    const configTMDB = useGetConfiguration();


    const posterSize = 'original';
    const posterURLPlaceholder = configTMDB?.images.base_url;

    const title = movieInfo?.title
    const description = movieInfo?.overview
    const image = `${posterURLPlaceholder}/${posterSize}/${movieInfo?.poster_path}`
    const voteAverage = movieInfo?.vote_average;

    const closeModalHandler = () => {
            
        dispatch(closeModal())
        
    }

    function voteColor(voteAverage:number) {
        // Ограничиваем значение в диапазоне от 0 до 10
        const clampedValue = Math.max(0, Math.min(10, voteAverage));
          
        // Рассчитываем оттенок (Hue): 0 -> 0 (красный), 5 -> 60 (жёлтый), 10 -> 120 (зелёный)
        const hue = (clampedValue / 10) * 120;
          
        // Возвращаем HSL строку (насыщенность 100%, яркость 45% для насыщенности цвета)
        return `hsl(${hue}, 100%, 45%)`;
    }

    function formatDate(date: string): string {
        const [year, month, day] = date.split("-");

        const months = [
            "января", "февраля", "марта", "апреля",
            "мая", "июня", "июля", "августа",
            "сентября", "октября", "ноября", "декабря",
        ];

        return `${day} ${months[Number(month) - 1]} ${year}`;
    }

  return (
  
    <div 
        id="modalWrapper" 
        className={`w-full h-full fixed select-text inset-0 z-50 flex items-center justify-evenly bg-black/50 ${isHidden}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeModalHandler();
          }
    }}>

        <div className="w-full max-w-120 h-full max-h-170 flex flex-col items-center justify-evenly rounded-bl-2xl rounded-xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900">

            <div className="w-full h-full max-h-30 flex flex-col items-center justify-center rounded-2xl bg-white transition-all dark:bg-slate-800">
                
                <h4 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Жанр
                </h4>
                
                <div className="w-full flex justify-evenly text-slate-200 text-center overflow-y-auto mb-2 flex-wrap">
                    
                    {movieInfo?.genres.map(element => {
                    
                        return (
                            <div className="w-full max-w-30 bg-slate-500 m-2 rounded-tr-2xl rounded-bl-2xl shadow-amber-500">
                                <p className="p-0.5">{element.name}</p>
                            </div>
                            
                        )
                        
                    })}
                    
                </div>

            </div>

            <div className="w-full h-max p-2 flex flex-col items-center justify-center rounded-2xl bg-white transition-all dark:bg-slate-800">
                
                <h4 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Оценка
                </h4>
                
                <div className="w-full flex flex-col justify-center text-slate-200 text-center">
                    
                    <div className="flex justify-center gap-2">
                        <p> <span
                              style={{
                                color: voteColor(Number(voteAverage)),
                              }}
                            >{voteAverage?.toFixed(2)}</span> / 10</p>
                        
                        <svg width="25" height="25" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="yellow" stroke="gold" stroke-width="2"/>
                        </svg>
                    </div>
                    <div>

                        <p>Всего людей оценило: {movieInfo?.vote_count}</p>

                    </div>

                </div>

            </div>

            <div className="w-full h-max flex flex-col items-center justify-center rounded-2xl bg-white transition-all dark:bg-slate-800">
                
                <h4 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    Год выпуска — {formatDate(String(movieInfo?.release_date))}
                </h4>

            </div>

        </div>

        <div className="size-max flex items-center justify-center rounded-bl-2xl rounded-tl-2xl shadow-xl transition-all">


            <div className="w-130 max-w-150 h-max flex items-center justify-center flex-col rounded-bl-2xl rounded-tl-2xl dark:bg-slate-900">
                
                <div className="m-5">

                    <h2 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
                    {title}
                    </h2>

                </div>

                <p className="w-full h-full max-h-80 p-5 text-justify text-sm leading-relaxed overflow-y-auto text-white dark:text-slate-300">

                    {description}
                    
                </p>
                <div className="mt-6 flex justify-end gap-3 m-3">          
                    <Button label="Закрыть" onClick={closeModalHandler} className="
                    rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2" />
                </div>

            </div>

            <div className="w-full max-w-md rounded-2xl bg-white p-3 shadow-xl transition-all dark:bg-slate-900">


                <img src={image} alt="" className="w-full h-full max-w-110 max-h-200" />


            </div>

        </div>


    </div>
  )
}

export default Modal