import { useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import * as authService from '../services/authService';

export interface UseAuthReturn {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
  };

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout,
  };
}
