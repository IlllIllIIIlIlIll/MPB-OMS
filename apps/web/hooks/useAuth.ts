import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { getFromStorage, setToStorage, removeFromStorage } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'PLATFORM_GUARD' | 'OPERATOR';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = getFromStorage<string | null>('auth_token', null);
    const user = getFromStorage<User | null>('auth_user', null);
    
    if (token && user) {
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.login(username, password);
      
      const { user, token } = response.data as LoginResponse;
      
      // Store in localStorage
      setToStorage('auth_token', token);
      setToStorage('auth_user', user);
      
      // Update state
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if we have a token
      if (authState.token) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      removeFromStorage('auth_token');
      removeFromStorage('auth_user');
      
      // Reset state
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [authState.token]);

  const refreshUser = useCallback(async () => {
    if (!authState.token) return;
    
    try {
      const response = await apiClient.getCurrentUser();
      const user = response.data as User;
      
      // Update localStorage and state
      setToStorage('auth_user', user);
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout the user
      await logout();
    }
  }, [authState.token, logout]);

  const hasRole = useCallback((role: User['role']) => {
    return authState.user?.role === role;
  }, [authState.user]);

  const hasAnyRole = useCallback((roles: User['role'][]) => {
    return authState.user ? roles.includes(authState.user.role) : false;
  }, [authState.user]);

  return {
    ...authState,
    login,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };
}; 