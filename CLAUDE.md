# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartLedger is a React Native financial management app built with Expo SDK 53, TypeScript, and file-based routing. The app is designed to help users manage their finances through features including electronic check register, budget planning, savings education, and AI-integrated financial guidance.

## Key Technologies & Architecture

- **Runtime**: Expo SDK 53 with New Architecture enabled
- **Language**: TypeScript with strict mode
- **Navigation**: Expo Router (file-based routing) with typed routes
- **UI Framework**: React Native with theme-aware components
- **Styling**: Custom theming system with automatic dark mode support
- **State Management**: React hooks and context (no external state library)
- **Icons**: Expo Symbols with SF Symbols (iOS) and Material Icons (Android/web) fallback

## Development Commands

```bash
# Start development server
npm start

# Platform-specific development
npm run android          # Android device/emulator
npm run ios             # iOS simulator 
npm run web             # Web browser

# Code quality
npm run lint            # ESLint with Expo config
npx tsc --noEmit        # TypeScript type checking

# Project reset (moves current code to app-example/)
npm run reset-project
```

## Architecture Patterns

### File-Based Routing Structure
```
app/
├── _layout.tsx         # Root layout with theme provider
├── +not-found.tsx      # 404 page
└── (tabs)/             # Tab navigation group
    ├── _layout.tsx     # Tab bar configuration
    ├── index.tsx       # Home tab
    └── explore.tsx     # Explore tab
```

### Component System
The app uses a theming system built around:

- **ThemedText**: Text component with automatic dark/light mode colors and predefined typography styles (`default`, `title`, `defaultSemiBold`, `subtitle`, `link`)
- **ThemedView**: View component with automatic background color theming
- **useThemeColor**: Hook for consistent color theming across components
- **useColorScheme**: System color scheme detection

### Theme Configuration
Colors are centrally managed in `constants/Colors.ts` with separate light/dark variants. The theme automatically switches based on system preference via `useColorScheme`.

### Icon System
Icons use platform-specific rendering:
- **iOS**: Native SF Symbols via expo-symbols
- **Android/Web**: Material Icons with manual mapping
- Icon mappings are defined in `components/ui/IconSymbol.tsx`

## Development Conventions

### TypeScript Configuration
- Strict mode enabled in `tsconfig.json`
- Path aliases: `@/*` maps to project root
- Includes Expo's TypeScript base configuration

### Component Naming
- Themed components use `Themed` prefix (e.g., `ThemedText`, `ThemedView`)
- UI components are in `components/ui/` directory
- Custom hooks use `use` prefix and are in `hooks/` directory

### Styling Approach
- Uses React Native StyleSheet API
- Theme-aware styling through `useThemeColor` hook
- Platform-specific styling for iOS blur effects and tab bar positioning

### App Configuration
- App name: "SmartLedger" 
- Package identifier: Uses `smartledger` slug
- Supports both portrait orientation and tablets on iOS
- New Architecture enabled for performance
- Automatic UI style switching (light/dark mode)

## Key Files to Understand

- `app/_layout.tsx`: Root navigation and theme provider setup
- `app/(tabs)/_layout.tsx`: Tab navigation with haptic feedback and blur effects
- `constants/Colors.ts`: Central color palette for light/dark themes
- `hooks/useThemeColor.ts`: Core theming logic
- `components/ui/IconSymbol.tsx`: Cross-platform icon rendering

## Project Reset Capability

The project includes a reset script (`npm run reset-project`) that moves current code to `app-example/` and creates a blank app structure. This is useful for starting fresh development while preserving the example code for reference.

## Performance Considerations

- Uses React Native Reanimated for smooth animations
- Lazy font loading with expo-font (development only)
- Platform-specific optimizations for tab bar blur effects on iOS
- Expo Symbols for native iOS icon performance