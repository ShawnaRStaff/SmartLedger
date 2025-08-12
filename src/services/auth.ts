import { auth } from '@/config/firebase';
import type { Auth } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  /**
   * Get the currently authenticated user
   */
  static getCurrentUser(): User | null {
    return (auth as Auth).currentUser;
  }

  /**
   * Create a new user account with email and password
   */
  static async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth as Auth,
        email,
        password
      );

      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth as Auth,
        email,
        password
      );

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<AuthResult> {
    try {
      await signOut(auth as Auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      if (!email) {
        return { success: false, error: 'Email address is required' };
      }

      if (!this.validateEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      await sendPasswordResetEmail(auth as Auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  /**
   * Validate email format
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle Firebase authentication errors with user-friendly messages
   */
  private static handleAuthError(error: any): string {
    console.error('Auth error:', error);

    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to complete this action.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
}