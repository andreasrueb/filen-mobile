# Plan: Replace Node.js Worker with Rust SDK via uniffi + Expo Module

## Context

The app runs a `nodejs-mobile-react-native` worker thread to execute `@filen/sdk` (TypeScript) for all cloud operations (98 handler functions). This embeds a full Node.js runtime (~15MB), breaks hot reload (the native Node thread doesn't restart on JS reload), and adds startup latency. The Rust SDK (`filen-sdk-rs`) is feature-complete and already integrated for caching via uniffi. This plan expands that integration to replace the Node worker entirely.

## Architecture

```
Current:  RN JS  --[message IPC]--> nodejs-mobile --> @filen/sdk (TS) + Express HTTP server

Target:   RN JS  --[Expo Module]--> Swift/Kotlin (uniffi-generated) --> filen-mobile-sdk-bridge (Rust)
                                                                            |
                                                                      filen-sdk-rs + axum HTTP server
```

## Components

### 1. New Rust Crate: `filen-rs/filen-mobile-sdk-bridge/`

A new uniffi crate wrapping `filen-sdk-rs` for the React Native main app (separate from the existing `filen-mobile-native-cache` which serves the File Provider extension).

```
filen-mobile-sdk-bridge/
  Cargo.toml
  src/
    lib.rs              # uniffi::setup_scaffolding!, module declarations
    env.rs              # Tokio runtime (reuse pattern from filen-mobile-native-cache)
    error.rs            # BridgeError enum (#[uniffi::Error])
    state.rs            # FilenMobileSdkBridge (#[uniffi::Object]) -- main entry point
    auth.rs             # 5 handlers: login, register, reinitSDK, resendConfirmation, forgotPassword
    cloud.rs            # 38 handlers: all cloud/file operations
    transfers.rs        # Transfer management: upload/download with progress, pause/resume/abort
    chats.rs            # 20 handlers: chat operations
    notes.rs            # 25 handlers: note operations
    contacts.rs         # 10 handlers: contact operations
    user.rs             # 18 handlers: account/user operations
    crypto.rs           # 2 handlers: decryptChatMessage, decryptDirectoryPublicLinkKey
    fs_ops.rs           # 2 handlers: readFileAsString, writeFileAsString
    http_server.rs      # Axum-based localhost streaming server (replaces Express)
    types.rs            # FFI record types for complex return values
    callbacks.rs        # Foreign callback traits (ProgressCallback, TransferStateCallback)
```

**Main state object:**
```rust
#[derive(uniffi::Object)]
pub struct FilenMobileSdkBridge {
    client: tokio::sync::RwLock<Option<filen_sdk_rs::auth::Client>>,
    http_server: tokio::sync::Mutex<Option<HttpServerHandle>>,
    transfer_manager: Arc<TransferManager>,
}
```

**Key patterns to follow from existing crate:**
- `filen-mobile-native-cache/src/ffi/mod.rs` -- uniffi type definitions
- `filen-mobile-native-cache/src/remote.rs` -- `#[filen_macros::create_uniffi_wrapper]` for async functions
- `filen-mobile-native-cache/src/traits.rs` -- `ProgressCallback` foreign trait

**Serialization strategy:** Complex params/returns as JSON strings across FFI boundary. This avoids defining hundreds of uniffi Record types upfront. Simple types (strings, numbers, booleans) passed natively.

### 2. Expo Module: `modules/filen-sdk-bridge/`

A local Expo Module wrapping the uniffi-generated Swift/Kotlin classes.

```
modules/filen-sdk-bridge/
  expo-module.config.json
  src/
    FilenSdkBridgeModule.ts          # JS module definition
  ios/
    FilenSdkBridgeModule.swift       # Swift: imports uniffi module, exposes AsyncFunctions
  android/
    src/main/java/.../FilenSdkBridgeModule.kt
```

**Swift side:** Each handler becomes an `AsyncFunction` that calls the uniffi-generated class:
```swift
AsyncFunction("login") { (configJson: String) -> String in
    try await self.bridge!.login(configJson: configJson)
}
```

**Events** for push-based communication (replaces Node bridge messages):
- `onTransferUpdate` -- transfer state (progress, speed, remaining)
- `onHttpServerReady` -- port + auth token when streaming server starts

### 3. JS API Layer: `lib/filenBridge/`

Drop-in replacement for `lib/nodeWorker/index.ts` with the same `proxy()` interface.

```
lib/filenBridge/
  index.ts        # FilenBridge class
  types.ts        # Type definitions
```

**Incremental migration adapter:** During migration, delegates to Expo Module for migrated functions, falls back to Node worker for the rest:
```typescript
async proxy(functionName, params) {
    if (MIGRATED_FUNCTIONS.has(functionName)) {
        return JSON.parse(await FilenSdkBridgeModule[functionName](JSON.stringify(params)))
    }
    return nodeWorker.proxy(functionName, params)
}
```

### 4. HTTP Streaming Server (in Rust)

Axum server running on the existing Tokio runtime, replacing Express:
- Binds to `127.0.0.1` on a free port
- Auth token in Authorization header or query param
- Streams decrypted file content with HTTP range request support (206)
- Uses `filen-sdk-rs` async readers piped into `axum::body::Body::from_stream()`
- Start/stop/restart exposed via uniffi

### 5. Build Pipeline

New Expo config plugin `plugins/withSdkBridge.ts` (or extend existing):

**iOS:**
1. `cargo build --lib --release --target aarch64-apple-ios,aarch64-apple-ios-sim -p filen-mobile-sdk-bridge`
2. `uniffi-bindgen-swift` -> generates Swift bindings
3. `xcodebuild -create-xcframework` -> linked into main app target (not File Provider)

**Android:**
1. `cargo ndk -t arm64-v8a -t x86_64 build --release -p filen-mobile-sdk-bridge`
2. `uniffi-bindgen generate --language kotlin` -> Kotlin bindings
3. `.so` -> `jniLibs/`, Kotlin -> main app source set

## Migration Phases

### Phase 0: Foundation (2-3 weeks)
- [ ] Create `filen-mobile-sdk-bridge` crate scaffold (lib.rs, env.rs, error.rs, state.rs)
- [ ] Implement 5 auth handlers: `login`, `register`, `reinitSDK`, `resendConfirmation`, `forgotPassword`
- [ ] Create build plugin `withSdkBridge.ts`
- [ ] Create Expo Module scaffold with `initialize` + auth functions
- [ ] Create `lib/filenBridge/` with adapter pattern
- [ ] Wire `auth.service.ts` to use filenBridge for auth
- [ ] **Verify:** Login/register works via Rust path

### Phase 1: Simple Cloud Operations (2-3 weeks)
- [ ] 38 cloud handlers -- most are thin wrappers: `sdk.cloud().method(params)`
- [ ] Includes: rename, move, trash, delete, restore, favorite, create, exists, search, public links, sharing
- [ ] **Verify:** File browser operations work (rename, move, trash, share, etc.)

### Phase 2: Chats, Notes, Contacts, User (2 weeks)
- [ ] 20 chat handlers
- [ ] 25 note handlers
- [ ] 10 contact handlers
- [ ] 18 user/account handlers
- [ ] 2 crypto handlers, 2 fs handlers
- [ ] **Verify:** Chat, notes, contacts, settings screens work

### Phase 3: Transfers (2-3 weeks)
- [ ] `TransferManager` in Rust with abort/pause/resume via tokio channels
- [ ] `uploadFile`, `downloadFile`, `uploadDirectory`, `downloadDirectory`
- [ ] `transferAction` (stop/pause/resume), `fetchTransfers`
- [ ] `TransferStateCallback` -> Expo Module events -> Zustand store
- [ ] `shareItems`, `toggleItemPublicLink` with progress
- [ ] **Verify:** Uploads, downloads, transfer controls work

### Phase 4: HTTP Streaming Server (1-2 weeks)
- [ ] Axum server in `http_server.rs`
- [ ] `startHttpServer`, `stopHttpServer`, `restartHTTPServer`, `httpStatus`
- [ ] Byte-range support (HTTP 206) for seeking
- [ ] App lifecycle handling (pause/resume server)
- [ ] **Verify:** Video/audio playback with seeking works

### Phase 5: Remove Node Worker (1 week)
- [ ] Remove `nodejs-mobile-react-native` from dependencies
- [ ] Remove `nodejs-assets/nodejs-project/`
- [ ] Remove `buildNodeThread` script and related patches
- [ ] Remove adapter pattern fallback in `lib/filenBridge/`
- [ ] Remove `nodejs-mobile-react-native` patch from `patches/`
- [ ] **Verify:** Full app works, hot reload works, app size reduced

## Key Files

| File | Role |
|---|---|
| `lib/nodeWorker/index.ts` | Current interface to replace (all call sites use `nodeWorker.proxy()`) |
| `nodejs-assets/nodejs-project/src/handlers/index.ts` | All 98 handler exports to replicate |
| `nodejs-assets/nodejs-project/src/lib/http.ts` | Express streaming server to replace with axum |
| `filen-rs/filen-mobile-native-cache/src/remote.rs` | Pattern for async uniffi wrappers |
| `filen-rs/filen-mobile-native-cache/src/ffi/mod.rs` | Pattern for uniffi type definitions |
| `filen-rs/filen-mobile-native-cache/src/traits.rs` | ProgressCallback foreign trait to reuse |
| `plugins/withFileProvider.ts` | Build pipeline to clone for new crate |
| `services/auth.service.ts` | First consumer to migrate (Phase 0) |

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Type mismatch between TS and Rust SDK return types | JSON serialization at FFI boundary; gradually add native uniffi types |
| Build time increase (two Rust crates) | Shared workspace, cargo caching, single-target dev builds |
| Transfer progress callback latency | Throttle to 10 updates/sec in Rust, batch into single JSON event |
| HTTP server lifecycle on iOS background | Expo Module listens for app state changes, stops/starts server |
| `fetchCloudItems` has complex JS-side logic (type switching, field augmentation) | Implement in Rust -- SDK has all underlying methods |
| Running both Node + Rust during migration | Adapter pattern delegates per-function; both init from same SDK config |

## Verification

After each phase:
1. Run TypeScript type checker: `npm run typecheck`
2. Test affected features on device
3. Compare behavior with Node worker (keep it as fallback until Phase 5)
4. After Phase 5: verify hot reload works, measure app binary size reduction, test full app flow
