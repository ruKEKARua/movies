import { configureStore } from '@reduxjs/toolkit'
import changeModalVisibleReducer from './openModal'
import sliderMoveReducer from './sliderMove'
import NumberOfPageInSliderReducer from './pageNumber'
import searchBarReducer from './searchBar'

export const store = configureStore({
  reducer: {

    openModal: changeModalVisibleReducer,
    sliderMove: sliderMoveReducer,
    numberOfPageInSlider: NumberOfPageInSliderReducer,
    searchBarValue: searchBarReducer,

  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch