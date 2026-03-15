# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Filen Mobile is a React Native/Expo mobile client for the Filen encrypted cloud storage service. It supports file management, chat, notes, gallery, music playback, camera upload, and file/share provider extensions.

**Stack:** Expo 55 (SDK 55), React Native 0.83, React 19.2, TypeScript (strict mode).

## Development Environment

This project uses **devenv/Nix** for development tooling. Always run commands inside the devenv shell:

```bash
devenv shell                    # Enter the dev environment (provides node, cmake, rust nightly, cocoapods)
```

See `IOS_DEV_SETUP.md` for full first-time setup and common build error solutions.

## Common Commands

```bash
# Development
devenv shell -- npm run ios              # Build & run on iOS simulator
devenv shell -- npm run ios:device       # Build & run on physical iOS device

# Prebuild (regenerate native projects)
devenv shell -- bash -c "npm run prebuild:clean"    # Full clean rebuild (compiles Rust, runs expo prebuild --clean)
devenv shell -- bash -c "npm run install:prebuilds && npx expo prebuild --platform ios"  # iOS only

# Code quality
npm run typecheck                # TypeScript type checking (tsc --noEmit)
npm run lint                     # ESLint

# Dependencies
npm install --legacy-peer-deps   # Required due to @config-plugins/react-native-blob-util peer dep
npx expo install --fix -- --legacy-peer-deps  # Fix Expo package versions
```

## Architecture

### Routing (Expo Router - file-based)

```
app/
├── _layout.tsx              # Root layout: providers, splash screen, StatusBar
├── index.tsx                # Entry: redirects to auth or app
├── (auth)/                  # Login/register (unauthenticated)
├── (app)/                   # Main app (authenticated, bottom tabs)
│   ├── home/                # Favorites, recents, offline, shared
│   ├── drive/               # File browser
│   ├── notes/               # Notes editor
│   ├── chats/               # Chat list
│   └── photos/              # Photo gallery
├── chat/[uuid].tsx          # Individual chat (modal)
├── transfers/               # Upload/download progress
├── textEditor/, pdfPreview/ # Content viewers
└── +native-intent.ts        # Share intent deep link handler
```

### State Management (3 layers)

1. **Zustand** (`stores/`) — UI state: transfers, drive browser, gallery, chat input, app lifecycle
2. **React Query** (`queries/`) — Server state: all data fetching, persisted to SQLite with 1-year TTL
3. **MMKV** (`lib/mmkv.ts`) — Local key-value: auth tokens, settings, preferences

### Data Flow for Features

```
queries/use*.query.ts  →  services/*.service.ts  →  lib/filenBridge  →  Rust SDK bridge
     (React Query)          (business logic)        (Expo Module)      (filen-sdk-rs)
```

### Rust SDK Bridge (`filen-rs/filen-mobile-sdk-bridge/`)

All SDK operations (encryption, transfers, API calls) run through a Rust native module via uniffi + Expo Module.

- **Expo Module:** `modules/filen-sdk-bridge/` — Swift/Kotlin wrappers exposing Rust functions
- **JS adapter:** `lib/filenBridge/index.ts` — Routes all calls to the Expo Module, manages HTTP server
- **Build plugin:** `plugins/withSdkBridge.ts` — Compiles Rust, generates bindings, creates XCFramework

### Rust Native Module (`filen-rs/` submodule)

Two crates:
- `filen-mobile-native-cache` — Native caching, thumbnails, crypto via uniffi bindings
- `filen-mobile-sdk-bridge` — Full SDK bridge wrapping `filen-sdk-rs` (auth, cloud, chats, notes, transfers, HTTP server)

- iOS: Compiled by `plugins/withFileProvider.ts` + `plugins/withSdkBridge.ts`
- Android: Compiled by `plugins/withAndroidRustBuild.ts` (cargo-ndk + Kotlin JNI)
- Requires: Nightly Rust toolchain with iOS targets, cmake

### Custom Expo Plugins (`plugins/`)

Notable plugins that run during prebuild:
- `withFileProvider.ts` — Compiles Rust for iOS, sets up file provider extension with app groups
- `withSdkBridge.ts` — Builds Rust SDK bridge, generates Swift/Kotlin bindings
- `withAndroidRustBuild.ts` — Compiles Rust for Android via cargo-ndk
- `withAndroidArchitectures.js` — Limits to arm64-v8a, x86_64

### iOS Extensions

- **File Provider** (`filen-ios-file-provider/`) — System files integration
- **Share Extension** (`expo-share-intent`) — Receive shared files from other apps
- Both use app group `group.dev.filen.app` for shared state

## Device Builds (Free Apple Developer Account)

After every `prebuild`, the entitlements must be stripped for physical device builds (free accounts can't provision App Groups/iCloud). Replace each file's contents with an empty `<dict/>`:

- `ios/Filen/Filen.entitlements`
- `ios/FilenShareIntentExtension/ShareExtension.entitlements`
- `ios/FilenFileProvider/FilenFileProvider.entitlements`

Without this, the build fails with "Provisioning profile doesn't include the App Groups capability." The File Provider and Share Extension won't work without App Groups, but the main app is fine.

## Code Conventions

- **Styling:** NativeWind (Tailwind CSS for RN) with `className` props. Global CSS in `global.css`.
- **Path aliases:** `@/` and `~/` both resolve to project root.
- **Imports:** Use double quotes. No unused vars (prefix unused with `_`).
- **React Compiler:** Enabled (`react-compiler/react-compiler` ESLint rule is `"error"`). Components should be compatible with the React compiler — avoid patterns it can't optimize.
- **Components:** Wrap with `memo()`. Use `useCallback`/`useMemo` where the React compiler doesn't auto-optimize.
- **Queries:** Each query hook is a separate file in `queries/` following the `use*Query` pattern with `fetchData` as a named export.
- **Services:** Business logic in `services/`, wrapping filenBridge calls. "Bulk" variants handle batch operations.
- **Patches:** `patch-package` patches in `patches/`. After updating a patched package, regenerate the patch.

## Key Files

| File | Purpose |
|------|---------|
| `app.config.ts` | Expo config: app ID, permissions, all plugins, experiments |
| `devenv.nix` | Nix dev environment: node, rust, cmake, cocoapods, iOS targets |
| `lib/filenBridge/index.ts` | Rust SDK bridge adapter (routes all calls to Expo Module) |
| `modules/filen-sdk-bridge/` | Expo Module wrapping the Rust SDK bridge |
| `queries/client.ts` | React Query client setup, SQLite persistence |
| `services/auth.service.ts` | Auth flow, SDK initialization, biometric setup |
| `lib/paths.ts` | All file system paths (thumbnails, downloads, cache) |
| `lib/constants.ts` | Supported file extensions, mime types |
| `lib/types/global.d.ts` | Ambient type declarations (DriveCloudItem, Transfer, etc.) |
