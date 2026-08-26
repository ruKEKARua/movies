import useMovieImages from "../../Hooks/useMovieImages";

const getSliderImages = () => {

    


    return (
        <div className="w-full h-full max-w-md overflow-hidden rounded-2xl bg-white  dark:bg-slate-900">
            <div className="animate-marquee flex flex-col gap-4">
                {doubledImages.map((src, index) => (
                    <div key={index} className="h-150 w-full flex shrink-0 overflow-hidden rounded-lg">
                        <img 
                            src={src} 
                            alt={`Slide ${index}`} 
                            className="h-full w-full object-cover" 
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default getSliderImages