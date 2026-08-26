import { createSlice } from '@reduxjs/toolkit'

export interface changeModalVisibleState {
  value: boolean
}

const initialState: changeModalVisibleState = {
  value: false
}

export const changeModalVisibleSlice = createSlice({
  name: 'changeModalVisible',
  initialState,
  reducers: {
    openModal: (state) => {
        state.value = true
    },
    closeModal: (state) => {
        state.value = false
    },
  },
})

// Action creators are generated for each case reducer function
export const { openModal, closeModal } = changeModalVisibleSlice.actions

export default changeModalVisibleSlice.reducer