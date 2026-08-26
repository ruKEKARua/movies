import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SliderMoveState {
  value: number
}

const initialState: SliderMoveState = {
  value: 0
}

export const sliderMoveSlice = createSlice({
  name: 'sliderMove',
  initialState,
  reducers: {
    changeSliderPosition: (state, action: PayloadAction<number>) => {
        state.value = action.payload;
    },

  },
})

// Action creators are generated for each case reducer function
export const { changeSliderPosition } = sliderMoveSlice.actions

export default sliderMoveSlice.reducer