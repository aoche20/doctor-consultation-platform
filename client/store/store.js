import { configureStore } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  auth: {
    user: null,
    token: null,
    isLoading: false,
    error: null
  },
  appointments: {
    list: [],
    currentAppointment: null,
    loading: false
  },
  doctors: {
    list: [],
    selectedDoctor: null,
    filters: {
      specialization: '',
      rating: 0,
      priceRange: { min: 0, max: 1000 }
    },
    loading: false
  }
};

// Root reducer
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});