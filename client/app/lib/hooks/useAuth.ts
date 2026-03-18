import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from './redux';
import { loadUser, logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(loadUser());
    }
  }, [token, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const requireAuth = (redirectTo: string = '/login') => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  };

  const requireRole = (roles: string[], redirectTo: string = '/') => {
    if (!isLoading && (!user || !roles.includes(user.role))) {
      router.push(redirectTo);
    }
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    logout: handleLogout,
    requireAuth,
    requireRole,
  };
};