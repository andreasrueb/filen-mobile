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

# Node worker
npm run buildNodeThread          # Bundle the Node.js worker thread code

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
queries/use*.query.ts  →  services/*.service.ts  →  lib/nodeWorker  →  @filen/sdk
     (React Query)          (business logic)        (IPC bridge)      (Filen API)
```

### Node Worker Thread

CPU-intensive work (encryption, transfers, API calls) runs in a separate Node.js thread via `nodejs-mobile-react-native`.

- **Main thread side:** `lib/nodeWorker/index.ts` — Promise-based RPC with message IDs
- **Worker side:** `nodejs-assets/nodejs-project/src/` — Handlers for cloud, transfers, auth, chats, notes
- **Build:** `npm run buildNodeThread` bundles with esbuild to `nodejs-assets/nodejs-project/bundle.js`

### Rust Native Module (`filen-rs/` submodule)

`filen-mobile-native-cache` — Native caching, thumbnails, crypto via uniffi bindings.

- iOS: Compiled by `plugins/withFileProvider.ts` (static lib + XCFramework)
- Android: Compiled by `plugins/withAndroidRustBuild.ts` (cargo-ndk + Kotlin JNI)
- Requires: Nightly Rust toolchain with iOS targets, cmake

### Custom Expo Plugins (`plugins/`)

Notable plugins that run during prebuild:
- `withFileProvider.ts` — Compiles Rust for iOS, sets up file provider extension with app groups
- `withAndroidRustBuild.ts` — Compiles Rust for Android via cargo-ndk
- `withAndroidArchitectures.js` — Limits to arm64-v8a, x86_64

### iOS Extensions

- **File Provider** (`filen-ios-file-provider/`) — System files integration
- **Share Extension** (`expo-share-intent`) — Receive shared files from other apps
- Both use app group `group.dev.filen.app` for shared state

## Code Conventions

- **Styling:** NativeWind (Tailwind CSS for RN) with `className` props. Global CSS in `global.css`.
- **Path aliases:** `@/` and `~/` both resolve to project root. `nodeWorker` alias for the Node worker entry.
- **Imports:** Use double quotes. No unused vars (prefix unused with `_`).
- **React Compiler:** Enabled (`react-compiler/react-compiler` ESLint rule is `"error"`). Components should be compatible with the React compiler — avoid patterns it can't optimize.
- **Components:** Wrap with `memo()`. Use `useCallback`/`useMemo` where the React compiler doesn't auto-optimize.
- **Queries:** Each query hook is a separate file in `queries/` following the `use*Query` pattern with `fetchData` as a named export.
- **Services:** Business logic in `services/`, wrapping nodeWorker calls. "Bulk" variants handle batch operations.
- **Patches:** `patch-package` patches in `patches/`. After updating a patched package, regenerate the patch.

## Key Files

| File | Purpose |
|------|---------|
| `app.config.ts` | Expo config: app ID, permissions, all plugins, experiments |
| `devenv.nix` | Nix dev environment: node, rust, cmake, cocoapods, iOS targets |
| `lib/nodeWorker/index.ts` | Node worker IPC bridge (main thread side) |
| `queries/client.ts` | React Query client setup, SQLite persistence |
| `services/auth.service.ts` | Auth flow, SDK initialization, biometric setup |
| `lib/paths.ts` | All file system paths (thumbnails, downloads, cache) |
| `lib/constants.ts` | Supported file extensions, mime types |
