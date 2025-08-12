import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { AuthService, AuthResult } from '@/services/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setState(prev => ({
          ...prev,
          user,
          loading: false,
          isAuthenticated: !!user,
        }));
      },
      (error) => {
        console.error('Auth state change error:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signIn(email, password);
      
      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Sign in failed' 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: null 
        }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signUp(email, password, displayName);
      
      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Sign up failed' 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: null 
        }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.signOut();
      
      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Sign out failed' 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: null,
          user: null,
          isAuthenticated: false,
        }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await AuthService.resetPassword(email);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.success ? null : (result.error || 'Password reset failed')
      }));
      
      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };
}