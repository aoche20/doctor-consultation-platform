import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  profilePicture?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Appointment {
  _id: string;
  patient: User;
  doctor: User;
  date: Date;
  timeSlot: { start: string; end: string };
  status: "pending" | "confirmed" | "completed" | "cancelled";
  type: "video" | "audio" | "chat";
  meetingId?: string;
}

export interface Doctor extends User {
  specialization: string;
  experience: number;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  availableSlots: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

// Initial state
const initialState = {
  auth: {
    user: null,
    token: null,
    isLoading: false,
    error: null
  } as AuthState,
  appointments: {
    list: [] as Appointment[],
    currentAppointment: null as Appointment | null,
    loading: false
  },
  doctors: {
    list: [] as Doctor[],
    selectedDoctor: null as Doctor | null,
    filters: {
      specialization: "",
      rating: 0,
      priceRange: { min: 0, max: 1000 }
    },
    loading: false
  }
};

export type RootState = typeof initialState;

// Store
export const store = configureStore({
  reducer: {
    auth: (state = initialState.auth, action: any) => {
      switch (action.type) {
        default:
          return state;
      }
    },
    appointments: (state = initialState.appointments, action: any) => {
      switch (action.type) {
        default:
          return state;
      }
    },
    doctors: (state = initialState.doctors, action: any) => {
      switch (action.type) {
        default:
          return state;
      }
    }
  },
  devTools: process.env.NODE_ENV !== "production"
});

// Types pour Redux
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;