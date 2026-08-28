import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SearchBar {
  value: string
}

const initialState: SearchBar = {
  value: ''
}

export const searchBarSlice = createSlice({
  name: 'searchBarSlice',
  initialState,
  reducers: {
    setSearchBarValue: (state, action: PayloadAction<string>) => {
        state.value = action.payload
    },

  },
})

// Action creators are generated for each case reducer function
export const { setSearchBarValue } = searchBarSlice.actions

export default searchBarSlice.reducer