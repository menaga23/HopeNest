import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to safely grab global Auth session metrics.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook must be declared inside an <AuthProvider> wrapper tree.');
  }
  return context;
};
