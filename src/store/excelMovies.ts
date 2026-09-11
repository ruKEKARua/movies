import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface excelMoviesState {
  value: string[]
}

const initialState: excelMoviesState = {
  value: []
}

export const excelMoviesSlice = createSlice({
  name: 'excelMoviesSlice',
  initialState,
  reducers: {
    setExcelMovies: (state, action: PayloadAction<string[]>) => {
        state.value = action.payload;
    },
    
  },
})

// Action creators are generated for each case reducer function
export const { setExcelMovies } = excelMoviesSlice.actions

export default excelMoviesSlice.reducer