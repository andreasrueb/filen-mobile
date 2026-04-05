# SDK Bridge: uniffi → Nitro Modules Migration

## What Changed

### Architecture (before → after)

```
BEFORE: JS → JSON.stringify → Expo Module (Swift) → uniffi → Rust SDK
        JS ← JSON.parse    ← Expo Module (Swift) ← uniffi ←

AFTER:  JS → JSI (typed) → Nitro C++ HybridObject → extern "C" → Rust SDK
        JS ← JSI         ←                         ← extern "C" ←
```

### Boundary crossings: 4 → 2
### JSON serialization layers: 2 (JS+Swift) → 0 on JS↔C++ boundary
  - JSON still used on C++↔Rust boundary (serde structs unchanged)

## Files Changed

### Rust (`filen-rs/filen-mobile-sdk-bridge/`)
- **Removed:** uniffi dependency, `#[derive(uniffi::Object)]`, `#[uniffi::export]`, `uniffi::setup_scaffolding!()`, `#[filen_macros::create_uniffi_wrapper]` from all modules
- **Added:** `src/ffi.rs` — 119+ `extern "C"` functions via `ffi_fn_string!`/`ffi_fn_void!` macros
- **Added:** `cbindgen.toml` — C header generation config
- **Changed:** `state.rs` — `new()` returns `Self` instead of `Arc<Self>`

### Nitro Module (`modules/filen-sdk-bridge/`)
- **Added:** `cpp/HybridFilenSdkBridge.hpp` — C++ HybridObject with manual method registration
- **Added:** `ios/FilenSdkBridgeAutolinking.mm` — ObjC++ `+load` registration
- **Changed:** `ios/FilenSdkBridge.podspec` — depends on `NitroModules` instead of `ExpoModulesCore`
- **Changed:** `index.ts` — uses `NitroModules.createHybridObject` instead of `requireNativeModule`
- **Removed:** `expo-module.config.json`, `FilenSdkBridgeModule.swift` (705 lines), `filen_mobile_sdk_bridge.swift` (4,020 lines uniffi bindings), `src/FilenSdkBridgeModule.ts`

### Build Plugin (`plugins/withSdkBridge.ts`)
- iOS: replaced `uniffi-bindgen-swift` + xcframework step with `cbindgen` for C header generation
- Android: unchanged (still uses uniffi — out of scope for this migration)

### JS Adapter (`lib/filenBridge/index.ts`)
- Removed `initialized` state and `initialize()` calls (Nitro HybridObject auto-initializes)
- Added `nativeNameMap` for JS→native name mapping (`register` �� `register_`)
- `ready` getter always returns `true`

## How It Works

1. **Build time:** `cargo build` compiles Rust static library. `cbindgen` generates `filen_mobile_sdk_bridge_ffi.h` C header.
2. **Pod install:** `FilenSdkBridge.podspec` compiles C++ HybridObject, links Rust `.a`, registers via `+load`.
3. **Runtime:** JS calls `NitroModules.createHybridObject("FilenSdkBridge")` → C++ constructor calls `filen_bridge_new()`.
4. **Each call:** JS → JSI → C++ method → `Promise::async` → `filen_bridge_<name>()` (blocks on Tokio) → FfiResult → resolve/reject.

## Unaffected
- `filen-mobile-native-cache` — still uses uniffi independently
- Android build — unchanged, still uses uniffi (separate migration needed)
- All JS callers (`services/`, `queries/`) — no changes needed, `proxy()` API preserved
