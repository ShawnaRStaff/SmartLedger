# Firebase Integration Guide

**System**: Firebase Backend Services  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-11

## 🔥 **Overview**

SmartLedger uses Firebase for authentication, database, and backend services with enterprise security standards.

## 📋 **Services Configured**

### **Firebase Authentication**
- ✅ Email/Password authentication
- ✅ Password reset functionality  
- ✅ Session persistence with AsyncStorage
- ✅ Secure error handling

### **Firestore Database**
- ✅ User-based security rules
- ✅ Offline persistence enabled
- ✅ Real-time synchronization
- ✅ Structured collections for financial data

## 🔧 **Configuration Files**

### **google-services.json**
```
Location: /google-services.json
Purpose: Android Firebase configuration
Security: Included in builds, excluded from git in production
```

### **Firebase SDK Initialization**
```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Configuration from google-services.json
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 🔒 **Security Rules**

### **Firestore Security (firestore.rules)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User accounts (checking, savings, etc.)
      match /accounts/{accountId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User transactions
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User budgets
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### **Security Features**
- User isolation: Each user can only access their own data
- Authentication required: All operations require valid auth
- No cross-user data access possible
- Explicit deny for undefined paths

## 🔐 **Authentication Implementation**

### **Auth Service Structure**
```typescript
// src/services/auth/authService.ts
interface AuthService {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}
```

### **Session Management**
```typescript
// Automatic persistence with AsyncStorage
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth(app);
auth.setPersistence(getReactNativePersistence(AsyncStorage));
```

### **Error Handling**
```typescript
// Never expose internal Firebase errors
const handleAuthError = (error: any): string => {
  switch (error.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Authentication failed. Please try again.';
  }
};
```

## 📊 **Data Structure**

### **User Document Structure**
```typescript
// /users/{userId}
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// /users/{userId}/accounts/{accountId}
interface AccountDocument {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  createdAt: Timestamp;
}

// /users/{userId}/transactions/{transactionId}
interface TransactionDocument {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  category: string;
  date: Timestamp;
  type: 'income' | 'expense' | 'transfer';
}
```

## ⚡ **Performance Features**

### **Offline Persistence**
```typescript
// Automatic offline support
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Data available offline automatically
// Syncs when connection restored
```

### **Real-time Updates**
```typescript
// Live data synchronization
import { onSnapshot } from 'firebase/firestore';

const unsubscribe = onSnapshot(userAccountsQuery, (snapshot) => {
  // Automatic UI updates when data changes
});
```

## 🧪 **Testing & Development**

### **Firebase Emulator (Optional)**
```bash
# For local development
npm install -g firebase-tools
firebase emulators:start --only auth,firestore
```

### **Mock Services for Testing**
```typescript
// src/__tests__/mocks/firebase.ts
export const mockAuth = {
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};
```

## 🚀 **Deployment Considerations**

### **Production Setup**
- Environment-specific Firebase projects
- Security rules deployed with Firebase CLI
- API keys managed through environment variables
- Regular security rule audits

### **Monitoring**
- Firebase Console for usage monitoring
- Authentication logs and metrics
- Database read/write tracking
- Error monitoring and alerting

## 🔄 **Backup & Recovery**

### **Data Export**
```bash
# Export Firestore data
gcloud firestore export gs://bucket-name/folder-name
```

### **Security Rule Backup**
```bash
# Version control for security rules
git add firestore.rules
git commit -m "Update Firestore security rules"
```

## 📚 **Related Documentation**

- [Authentication System](./Authentication-System.md) - UI flows and user management
- [Database Architecture](./Database-Architecture.md) - Collection structure and queries
- [Environment Configuration](./Environment-Config.md) - Development vs production setup

---

**Maintainer**: Backend Team  
**Review**: Security rules reviewed each deployment  
**Support**: Firebase Console for monitoring and debugging