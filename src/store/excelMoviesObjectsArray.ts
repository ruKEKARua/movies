import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface excelMovesObjectsArrayState {
  value: Movie[]
}

const initialState: excelMovesObjectsArrayState = {
  value: []
}

type Movie = {

    media_type: 'movie' | 'tv'; // обязательно, что это фильм или сериал
    id: number; // айдишник
    backdrop_path: string; // постер на оригинальном языке
    original_title: string; // название на оригинальном языке (в частности английский)
    title: string; // название на русском
    overview: string; // описание
    poster_path: string; // постер на русском

};

export const excelMovesObjectsArraySlice = createSlice({
  name: 'excelMovesObjectsArray',
  initialState,
  reducers: {
    setExcelMovesObjectsArray: (state, action: PayloadAction<Movie>) => {
        state.value.push(action.payload)
    },
    
  },
})

export const { setExcelMovesObjectsArray } = excelMovesObjectsArraySlice.actions

export default excelMovesObjectsArraySlice.reducer