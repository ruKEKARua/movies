import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface NumberOfPageInSliderState {
  value: number
}

const initialState: NumberOfPageInSliderState = {
  value: 1
}

export const numberOfPageInSliderSlice = createSlice({
  name: 'setNumberOfPageInSlider',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
        state.value = action.payload
    },

  },
})

// Action creators are generated for each case reducer function
export const { setPage } = numberOfPageInSliderSlice.actions

export default numberOfPageInSliderSlice.reducer