import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setPage } from '../../store/pageNumber';
import Button from '../UI/Button';

const SearchBar = () => {

    const dispatch = useDispatch();

    const [input, setInput] = useState<string>('1');

    const setPageFromInput = () => {

        if (Number(input) >= 1 && input != null && input != undefined  && Number(input) === Number(input)) {
            return dispatch(setPage(Number(input)))

        }

        setInput('')

    }

  return (
    <div className="flex justify-center items-center">
        <input type="search" name="pageInput" id="" className="
        flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200
        hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95" 
        value={input} onChange={(event) => setInput(event.target.value)} />
        <Button className="bg-amber-500 text-white h-10 w-20 rounded-4xl" label="Перейти" onClick={setPageFromInput} />
    </div>
  )
}

export default SearchBar