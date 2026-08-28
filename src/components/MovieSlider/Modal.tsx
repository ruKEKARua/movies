import { useDispatch } from "react-redux";
import { closeModal } from "../../store/openModal";
import Button from "../UI/Button";
import InfiniteSlider from "../MovieSlider/InfiniteImageSlider";

type Modal = {

    isHidden: string;
    title: string;
    description: string;
    image: string;
    movie_ID: number;

}

const Modal = ({isHidden = 'hidden', title, description, image, movie_ID }: Modal) => {
    
    const dispatch = useDispatch();


    const closeModalHandler = () => {
            
        dispatch(closeModal())
        
    }

  return (
  
    <div 
        id="modalWrapper" 
        className={`w-full h-full fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 ${isHidden}`}
    //     onClick={(event) => {
    //       if (event.target === event.currentTarget) {
    //         closeModalHandler();
    //       }
    // }}
    >
    

    <div className="
    max-w-150 max-h-170 rounded-2xl bg-white p-2 shadow-xl transition-all dark:bg-slate-900 absolute left-20 flex justify-center items-center">

        <InfiniteSlider movie_ID={movie_ID} />
        
    </div>

    <div className="w-full max-w-md h-max flex items-center justify-center flex-col rounded-bl-2xl rounded-tl-2xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900">



      <div className="">
        <h2 className="text-lg text-center font-semibold text-slate-900 dark:text-white w-full">
          {title}
        </h2>

          
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 text-center">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-3">          
        <Button label="Закрыть" onClick={closeModalHandler} className="
        rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2" />
      </div>


    </div>

    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900 absolute right-47">


      <img src={image} alt="" className="w-full h-full" />


    </div>

    </div>
  )
}

export default Modal