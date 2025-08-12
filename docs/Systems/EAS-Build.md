# EAS Build Configuration Guide

**System**: Expo Application Services Build System  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-08-11

## 🏗️ **Overview**

SmartLedger uses EAS Build for creating Android and iOS development/production builds with proper configuration for React Native New Architecture and Firebase integration.

## 📋 **Build Profiles**

### **EAS Configuration (eas.json)**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal", 
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### **Build Profile Types**

#### **Development Profile**
- **Purpose**: Testing and debugging during development
- **Features**: 
  - Development client enabled for debugging
  - Internal distribution only
  - APK builds for faster iteration
  - iOS simulator support for testing

#### **Preview Profile**  
- **Purpose**: Testing builds for stakeholders/QA
- **Features**:
  - Internal distribution
  - Production-like environment
  - APK builds for easy sharing
  - Firebase production configuration

#### **Production Profile**
- **Purpose**: App store releases
- **Features**:
  - App store distribution
  - AAB format for Android
  - iOS App Store builds
  - Full optimization enabled

## 🛠️ **Build Commands**

### **Package.json Scripts**
```json
{
  "scripts": {
    "eas-dev-build-android": "npx eas build --profile development --platform android",
    "eas-preview-build-android": "npx eas build --profile preview --platform android", 
    "eas-prod-build-android": "npx eas build --profile production --platform android",
    "eas-dev-build-ios": "npx eas build --profile development --platform ios",
    "eas-build-all": "npx eas build --profile development --platform all"
  }
}
```

### **Manual Build Commands**
```bash
# Development builds
npx eas build --profile development --platform android
npx eas build --profile development --platform ios

# Preview builds  
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios

# Production builds
npx eas build --profile production --platform android
npx eas build --profile production --platform ios

# All platforms at once
npx eas build --profile development --platform all
```

## 📱 **Android Configuration**

### **App Configuration (app.json)**
```json
{
  "expo": {
    "name": "SmartLedger",
    "slug": "smartledger", 
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "android": {
      "package": "com.missstaff.smartledger",
      "versionCode": 1,
      "compileSdkVersion": 35,
      "targetSdkVersion": 34,
      "buildToolsVersion": "35.0.0",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### **Critical Android Settings**
- **Package Name**: `com.missstaff.smartledger` (consistent across all files)
- **Target SDK**: Android 14 (API 34) for compatibility
- **Compile SDK**: Android 15 (API 35) for latest features
- **Google Services**: Firebase configuration file included

### **Firebase Integration**
```json
// google-services.json location and validation
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "smartledger-app",
    "storage_bucket": "smartledger-app.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "YOUR_APP_ID",
        "android_client_info": {
          "package_name": "com.missstaff.smartledger"
        }
      }
    }
  ]
}
```

## 🍎 **iOS Configuration**

### **iOS Specific Settings**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.missstaff.smartledger",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "UILaunchStoryboardName": "SplashScreen",
        "UIStatusBarStyle": "UIStatusBarStyleDefault"
      }
    }
  }
}
```

### **iOS Build Requirements**
- **Bundle Identifier**: Must match package name
- **Certificates**: Managed by EAS for development builds
- **Provisioning**: Automatic for development, manual for distribution
- **Tablet Support**: Enabled for iPad compatibility

## 🚀 **Build Process**

### **Development Build Workflow**
```bash
# 1. Ensure EAS CLI is installed and authenticated
npm install -g @expo/eas-cli
eas login

# 2. Configure project (first time only)
eas build:configure

# 3. Run development build
npm run eas-dev-build-android

# 4. Build process steps:
# - Dependencies installed
# - TypeScript compiled  
# - JavaScript bundled
# - Native code compiled
# - APK/IPA generated
# - Upload to EAS servers
```

### **Build Artifacts**
```
Build Output:
├── smartledger-development.apk     # Android development build
├── smartledger-preview.apk         # Android preview build  
├── smartledger-production.aab      # Android production bundle
├── smartledger-development.app     # iOS development build
└── build-logs/                    # Detailed build logs
```

## 🔧 **Build Optimization**

### **Performance Settings**
```json
// eas.json - Build optimizations
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      },
      "cache": {
        "disabled": false
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Bundle Size Optimization**
- **Metro bundler**: Tree shaking for unused code
- **Image optimization**: Compressed assets
- **Font subsetting**: Only required characters
- **Code splitting**: Lazy loading for routes

### **Build Caching**
```json
// Enable build caching for faster builds
{
  "build": {
    "development": {
      "cache": {
        "disabled": false,
        "cacheDefaultPaths": true,
        "customPaths": [
          "node_modules"
        ]
      }
    }
  }
}
```

## 📊 **Build Monitoring**

### **Build Status Tracking**
```bash
# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]

# Download build artifacts
eas build:download [BUILD_ID]

# Cancel running build
eas build:cancel [BUILD_ID]
```

### **Build Analytics**
- **Build Duration**: Track build time trends
- **Success Rate**: Monitor build failure rate
- **Bundle Size**: Track app size over time
- **Error Analysis**: Common build failure patterns

## 🐛 **Troubleshooting**

### **Common Build Issues**

#### **Package Name Inconsistency**
```bash
# Error: Package name mismatch
# Solution: Ensure consistency across:
# - app.json (android.package)  
# - google-services.json (package_name)
# - eas.json configuration
```

#### **Firebase Configuration**
```bash
# Error: Google services file not found
# Solution: 
1. Verify google-services.json in project root
2. Check googleServicesFile path in app.json
3. Ensure Firebase project is properly configured
```

#### **Memory Issues**
```bash
# Error: Out of memory during build
# Solution: Increase build machine resources
{
  "build": {
    "production": {
      "resourceClass": "large"
    }
  }
}
```

#### **Dependency Conflicts**
```bash
# Error: Dependency resolution failed
# Solution:
1. Clear npm cache: npm cache clean --force
2. Delete node_modules and package-lock.json
3. Reinstall: npm install
4. Retry build
```

### **Debug Build Issues**
```bash
# Enable verbose logging
eas build --profile development --platform android --verbose

# Check build logs
eas build:view [BUILD_ID] --logs

# Local debug build (development only)
npx expo run:android
```

## 🔐 **Security Configuration**

### **Environment Variables**
```bash
# Set production secrets
eas secret:create --scope project --name FIREBASE_API_KEY --value "your-api-key"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "your-domain"

# Use in app.json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "$FIREBASE_API_KEY",
      "firebaseAuthDomain": "$FIREBASE_AUTH_DOMAIN"
    }
  }
}
```

### **Signing & Certificates**
```bash
# Development builds (automatic)
# EAS manages certificates automatically

# Production builds (manual control)
eas credentials:configure --platform android
eas credentials:configure --platform ios
```

## 📈 **Performance Metrics**

### **Build Time Optimization**
- **Development builds**: ~5-10 minutes
- **Preview builds**: ~10-15 minutes  
- **Production builds**: ~15-25 minutes
- **Cached builds**: 30-50% faster

### **Bundle Size Targets**
- **Android APK**: <50MB target
- **iOS IPA**: <50MB target
- **JavaScript bundle**: <10MB target
- **Assets**: <20MB target

## 🔄 **CI/CD Integration**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/build.yml
name: EAS Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup EAS CLI
      run: npm install -g @expo/eas-cli
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build development
      run: npx eas build --profile development --platform android --non-interactive
      env:
        EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### **Automated Distribution**
```yaml
# Automatic distribution after successful build
- name: Distribute to TestFlight
  if: github.ref == 'refs/heads/main'
  run: npx eas submit --platform ios --latest
```

## 📋 **Build Checklist**

### **Pre-Build Verification**
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] ESLint validation passed (`npx expo lint`) 
- [ ] All tests passing (`npm test`)
- [ ] Firebase configuration valid
- [ ] Package names consistent across files
- [ ] Expo CLI authenticated (`eas whoami`)

### **Post-Build Verification**
- [ ] Build completed successfully
- [ ] APK/IPA downloaded and tested
- [ ] App launches without crashes
- [ ] Firebase authentication working
- [ ] Core functionality verified
- [ ] Performance acceptable

## 📚 **Related Documentation**

- [Firebase Integration](./Firebase-Integration.md) - Backend configuration
- [Environment Configuration](./Environment-Config.md) - Development vs production
- [CI/CD Pipeline](./CI-CD-Pipeline.md) - Automated build workflows

---

**Maintainer**: DevOps Team  
**Review**: Build configuration reviewed each release  
**Support**: EAS documentation and Expo Discord for build issues