# Authentication System Guide

**System**: User Authentication & Management  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-12

## 🔐 **Overview**

SmartLedger implements a secure, user-friendly authentication system with Firebase Auth, featuring email/password login, persistent sessions, and comprehensive error handling.

## 🏗️ **Architecture**

### **Authentication Flow**
```
User Input → Validation → Firebase Auth → Session Storage → Navigation
     ↓            ↓              ↓              ↓              ↓
   Errors    Input Errors   Auth Errors   Persistence    Protected Routes
```

### **Component Structure**
```
app/(auth)/                 # Authentication screens
├── sign-in.tsx            # Login screen
├── sign-up.tsx            # Registration screen  
├── forgot-password.tsx    # Password reset
└── _layout.tsx           # Auth navigation stack

src/hooks/auth/           # Authentication logic
├── useAuth.ts           # Main auth hook
└── useAuthState.ts      # Auth state management

src/services/auth/       # Firebase integration
├── authService.ts       # Auth service layer
└── sessionManager.ts    # Session persistence
```

## 🔑 **Authentication Features**

### **Sign In Flow**
```typescript
// User login with email/password
interface SignInFlow {
  1. User enters email and password
  2. Client-side validation (email format, password length)
  3. Firebase authentication attempt
  4. Success: Store session → Navigate to app
  5. Failure: Display user-friendly error message
}
```

### **Sign Up Flow**
```typescript
// New user registration
interface SignUpFlow {
  1. User enters name, email, password
  2. Client-side validation
  3. Password strength check (min 6 characters)
  4. Create Firebase auth account
  5. Create Firestore user document
  6. Auto-login after registration
  7. Navigate to onboarding/dashboard
}
```

### **Password Reset Flow**
```typescript
// Password recovery via email
interface PasswordResetFlow {
  1. User enters email address
  2. Validate email exists in system
  3. Send password reset email via Firebase
  4. User clicks email link
  5. User sets new password
  6. Auto-login with new credentials
}
```

## 💾 **Session Management**

### **Persistence Strategy**
```typescript
// AsyncStorage for session persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

// Configure Firebase Auth persistence
const auth = getAuth(app);
auth.setPersistence(getReactNativePersistence(AsyncStorage));

// Session data structure
interface Session {
  user: {
    uid: string;
    email: string;
    displayName: string;
  };
  token: string;
  expiresAt: number;
}
```

### **Auto-Login Implementation**
```typescript
// Check for existing session on app start
const checkAuthState = async () => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // Valid session exists
      router.replace('/(tabs)/');
    } else {
      // No session, show auth screen
      router.replace('/(auth)/sign-in');
    }
  });
  
  return unsubscribe;
};
```

## 🎨 **UI Components**

### **Sign In Screen**
```typescript
// app/(auth)/sign-in.tsx
export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignIn = async () => {
    // Validation
    if (!email || !password) {
      setErrors({ 
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : ''
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/');
    } catch (error) {
      setErrors({ general: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h4">Welcome Back</Typography>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={errors.email}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      
      <Button 
        onPress={handleSignIn}
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>
      
      <Link href="/(auth)/forgot-password">
        <Typography variant="body2" color="primary">
          Forgot Password?
        </Typography>
      </Link>
    </SafeAreaView>
  );
}
```

### **Form Validation**
```typescript
// Input validation utilities
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return null;
};
```

## 🛡️ **Security Measures**

### **Error Handling**
```typescript
// Never expose internal errors to users
const getErrorMessage = (error: any): string => {
  if (error.code) {
    switch (error.code) {
      // Auth errors - sanitized messages
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      
      case 'auth/invalid-email':
        return 'Invalid email address';
      
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      
      default:
        return 'Authentication failed. Please try again.';
    }
  }
  return 'An unexpected error occurred';
};
```

### **Rate Limiting**
```typescript
// Implement client-side rate limiting
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface RateLimiter {
  attempts: number;
  lockedUntil: number | null;
}

const checkRateLimit = (limiter: RateLimiter): boolean => {
  if (limiter.lockedUntil && Date.now() < limiter.lockedUntil) {
    throw new Error('Too many attempts. Please try again later.');
  }
  
  if (limiter.attempts >= MAX_ATTEMPTS) {
    limiter.lockedUntil = Date.now() + LOCKOUT_DURATION;
    limiter.attempts = 0;
    throw new Error('Account temporarily locked. Try again in 15 minutes.');
  }
  
  return true;
};
```

### **Input Sanitization**
```typescript
// Sanitize user inputs
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script.*?>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Apply to all inputs
const sanitizedEmail = sanitizeInput(email);
const sanitizedPassword = password; // Don't modify passwords
```

## 🔄 **State Management**

### **useAuth Hook**
```typescript
// src/hooks/auth/useAuth.ts
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null
      });
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
    isAuthenticated: !!authState.user
  };
}
```

## 🎯 **Protected Routes**

### **Route Protection**
```typescript
// app/_layout.tsx - Protected route wrapper
export default function RootLayout() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      {user ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
```

### **Navigation Guards**
```typescript
// Redirect unauthenticated users
const requireAuth = (Component: React.FC) => {
  return (props: any) => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.replace('/(auth)/sign-in');
      }
    }, [user]);

    if (!user) {
      return <LoadingScreen />;
    }

    return <Component {...props} />;
  };
};
```

## 🧪 **Testing Authentication**

### **Unit Tests**
```typescript
// __tests__/auth/authService.test.ts
describe('Authentication Service', () => {
  it('should handle successful login', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

    const result = await authService.signIn('test@example.com', 'password');
    
    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
  });

  it('should handle login errors', async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/wrong-password'
    });

    const result = await authService.signIn('test@example.com', 'wrong');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
  });
});
```

### **Integration Tests**
```typescript
// __tests__/auth/sign-in.test.tsx
describe('Sign In Screen', () => {
  it('should show validation errors for empty fields', async () => {
    const { getByText } = render(<SignInScreen />);
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });
});
```

## 📊 **Monitoring & Analytics**

### **Authentication Metrics**
- Sign in success rate
- Sign up conversion rate
- Password reset requests
- Session duration
- Authentication errors by type

### **Firebase Analytics Integration**
```typescript
import { logEvent } from 'firebase/analytics';

// Track auth events
logEvent(analytics, 'login', {
  method: 'email'
});

logEvent(analytics, 'sign_up', {
  method: 'email'
});

logEvent(analytics, 'password_reset_request');
```

## 🚀 **Future Enhancements**

### **Planned Features**
- [ ] Social authentication (Google, Apple)
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Two-factor authentication (2FA)
- [ ] Remember me functionality
- [ ] Account deletion workflow
- [ ] Email verification requirement

## 📚 **Related Documentation**

- [Firebase Integration](./Firebase-Integration.md) - Backend authentication setup
- [Design System](./Design-System.md) - Authentication UI components
- [Testing Framework](./Testing-Framework.md) - Auth testing strategies

---

**Maintainer**: Security Team  
**Review**: Authentication flow reviewed each security audit  
**Support**: Firebase Console for auth monitoring and user management