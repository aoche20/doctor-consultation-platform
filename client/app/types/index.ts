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

export interface Review {
  _id: string;
  patient: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  doctor: string;
  appointment: string;
  rating: number;
  comment: string;
  tags: string[];
  isAnonymous: boolean;
  isVerified: boolean;
  likes: string[];
  replies: Array<{
    doctor: string;
    message: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilters {
  specialization?: string;
  minRating?: number;
  minFee?: number;
  maxFee?: number;
  searchTerm?: string;
  availableDay?: string;
  language?: string;
  insurance?: string;
  sortBy?: 'rating' | 'fee_asc' | 'fee_desc' | 'experience' | 'reviews';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchResponse {
  success: boolean;
  doctors: User[];
  pagination: Pagination;
}

export interface Appointment {
  _id: string;
  patient: User | string;  // Peut être l'objet User ou juste l'ID
  doctor: User | string;    // Peut être l'objet User ou juste l'ID
  date: string;
  timeSlot: TimeSlot;
  status: AppointmentStatus;
  type: ConsultationType;
  symptoms?: string;
  notes?: string;
  prescription?: Prescription;
  paymentIntentId?: string;
  meetingId?: string;
  meetingLink?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  reminders?: Reminder[];
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentAmount: number;
  paymentMethod?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type ConsultationType = 'video' | 'audio' | 'chat' | 'in-person';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Prescription {
  medicines: Medicine[];
  additionalNotes?: string;
  followUpDate?: string;
  issuedAt?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface Reminder {
  type: 'email' | 'sms' | 'push';
  sentAt: string;
  status: string;
}