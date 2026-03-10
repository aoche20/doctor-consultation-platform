export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profilePicture?: string;
  specialization?: string;
  consultationFee?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  specialization?: string;
  consultationFee?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  token?: string;
  user?: User;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  certificate?: string;
}

export interface AvailableSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  
  // Champs docteur
  specialization?: string;
  qualifications?: Qualification[];
  experience?: number;
  consultationFee?: number;
  availableSlots?: AvailableSlot[];
  rating?: number;
  totalReviews?: number;
  isVerified?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  consultationFee?: number;
  experience?: number;
}