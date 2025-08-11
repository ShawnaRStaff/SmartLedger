import React, { useState } from 'react';
import { SignInScreen, SignUpScreen, PasswordResetScreen } from '@/screens/auth';

export type AuthScreen = 'signIn' | 'signUp' | 'passwordReset';

export interface AuthNavigatorProps {
  onAuthSuccess: () => void;
}

export function AuthNavigator({ onAuthSuccess }: AuthNavigatorProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('signIn');

  const navigateToSignIn = () => setCurrentScreen('signIn');
  const navigateToSignUp = () => setCurrentScreen('signUp');
  const navigateToPasswordReset = () => setCurrentScreen('passwordReset');

  switch (currentScreen) {
    case 'signIn':
      return (
        <SignInScreen
          onNavigateToSignUp={navigateToSignUp}
          onNavigateToForgotPassword={navigateToPasswordReset}
          onSignInSuccess={onAuthSuccess}
        />
      );
    
    case 'signUp':
      return (
        <SignUpScreen
          onNavigateToSignIn={navigateToSignIn}
          onSignUpSuccess={onAuthSuccess}
        />
      );
    
    case 'passwordReset':
      return (
        <PasswordResetScreen
          onNavigateBack={navigateToSignIn}
        />
      );
    
    default:
      return (
        <SignInScreen
          onNavigateToSignUp={navigateToSignUp}
          onNavigateToForgotPassword={navigateToPasswordReset}
          onSignInSuccess={onAuthSuccess}
        />
      );
  }
}