'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    try {
      const { user } = await authApi.me();
      setState({
        user: user as User,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authApi.login(email, password);
      setState({
        user: user as User,
        isLoading: false,
        isAuthenticated: true,
      });
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer login',
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { user } = await authApi.register(name, email, password);
      setState({
        user: user as User,
        isLoading: false,
        isAuthenticated: true,
      });
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao registrar',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    ...state,
    login,
    register,
    logout,
    refresh: checkAuth,
  };
}
