import Button from "./UI/Button"

type MovieCardProps = {

    id: number;
    title: string;
    posterPath: string;
    func: (id: number) => void;

}

const MovieCard = ({id=0, title = '', posterPath = '', func}: MovieCardProps) => {
  return (
    <div className="w-60 h-120 m-auto gap-5 flex flex-col justify-center items-center" key={id} >

        <p className="text-white">
            {title}
        </p>

        <div className="min-w-50 min-h-80 m-auto rounded-2xl"
        style={{boxShadow: `
            7px 16px 26px 25px rgba(0,0,0,0.7)
            `}}>
        <img src={posterPath} className="min-w-50 min-h-80 m-auto rounded-2xl"/>
        <div className="
            text-[#ffeb3b] text-5xl absolute top-11 right-15
            ">*</div>
        </div>
        <Button
            onClick={() => func(id)}
            label="Поробнее"
            className="
            rounded-xl px-10 py-2 text-xl font-medium bg-blue-600 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        />


    </div>
  )
}

export default MovieCard