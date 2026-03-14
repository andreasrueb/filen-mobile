# iOS Development Setup

## Prerequisites

- macOS on Apple Silicon
- Xcode (with iOS Simulator runtimes installed)
- devenv / direnv

## First-time setup

```bash
# 1. Enter the devenv shell (or let direnv do it automatically)
devenv shell

# 2. Initialize git submodules (filen-rs, file providers)
git submodule update --init --recursive

# 3. Install root project dependencies
npm install --legacy-peer-deps

# 4. Install nodejs-project (node worker) dependencies
cd nodejs-assets/nodejs-project && npm install --legacy-peer-deps && cd ../..

# 5. Prebuild for iOS (compiles Rust native module + generates ios/ directory + pod install)
npm run install:prebuilds && npx expo prebuild --platform ios

# 6. Build and run on simulator
npm run ios
```

## Day-to-day development

After the first-time setup, you typically only need:

```bash
npm run ios
```

If the `ios/` directory was deleted or native config changed, re-run step 5.

## How the devenv works

The `devenv.nix` provides: node, watchman, cocoapods, cmake, and a nightly Rust toolchain with iOS cross-compilation targets.

### The Nix vs Xcode toolchain problem

Nix's `languages.rust` module brings in its own clang/ld wrappers that inject macOS-specific flags (like `-mmacos-version-min`). These break iOS cross-compilation and Xcode builds. The devenv handles this with three mechanisms:

1. **PATH symlinks** (`.devenv/bin/`): System `cc`, `clang`, `clang++`, `ld`, `find` are symlinked to take priority over Nix's wrapped versions. This is needed because:
   - Nix's clang wrapper injects `-mmacos-version-min` which conflicts with iOS target flags
   - Nix's GNU `find` doesn't support `-E` (BSD flag used by nodejs-mobile build scripts)
   - Nix's `ld` wrapper mangles linker flags that Xcode generates

2. **Target-specific CC/CXX env vars**: `CC_aarch64_apple_ios`, `CC_aarch64_apple_ios_sim`, etc. point to `/usr/bin/clang`. These are read by Rust's `cc` crate during `cargo build` for cross-compilation, without affecting xcodebuild (which would misinterpret a global `CC` as a build setting override).

3. **Unset NIX_\* variables**: Variables like `NIX_LDFLAGS`, `NIX_CFLAGS_COMPILE`, `NIX_CC` are unset in `enterShell`. If left set, they cause xcodebuild to link against Nix store libraries (built for macOS, not iOS) and use the wrong compiler flags.

### `.cargo/config.toml`

Sets the linker for iOS targets to `/usr/bin/clang`, preventing Rust from using the Nix-wrapped linker (which would inject macOS library paths into the iOS link step).

### ReactNativeDependencies header fix

The `enterShell` creates symlinks inside `ios/Pods/Headers/Public/ReactNativeDependencies/` to flatten the nested `Headers/` subdirectory. Without this, `#include <folly/dynamic.h>` fails because the header search path doesn't account for the extra `Headers/` level.

## Common build errors and fixes

### `find: unknown predicate '-E'`
Nix's GNU `find` is on PATH instead of macOS BSD `find`. The `.devenv/bin/find` symlink should fix this. If it reappears, verify the symlink exists: `ls -la .devenv/bin/find`

### `clang: error: invalid argument '-mmacos-version-min=...' not allowed with '-miphoneos-version-min=...'`
Nix's clang wrapper is being used for iOS cross-compilation. Check that `.devenv/bin/clang` symlinks to `/usr/bin/clang` and the `CC_aarch64_apple_ios*` env vars are set.

### `ld: building for iOS Simulator, but linking in dylib built for macOS`
The Rust linker is finding Nix store libraries. Check that `.cargo/config.toml` sets `linker = "/usr/bin/clang"` for both `aarch64-apple-ios` and `aarch64-apple-ios-sim` targets.

### `ld: -objc_abi_version '-Xlinker' not supported`
Nix build variables are leaking into xcodebuild. The `NIX_*` variables must be unset in `enterShell`. Check with: `env | grep NIX_LDFLAGS` (should be empty in the devenv shell).

### `'folly/dynamic.h' file not found`
The ReactNativeDependencies header symlinks are missing. Re-enter the devenv shell (the `enterShell` script creates them), or manually run:
```bash
rnd_dir="ios/Pods/Headers/Public/ReactNativeDependencies"
for dir in "$rnd_dir/Headers"/*/; do
  ln -sfn "Headers/$(basename "$dir")" "$rnd_dir/$(basename "$dir")"
done
```

### `sed: can't read .../argon2/package.json: No such file or directory`
The nodejs worker dependencies aren't installed. Run:
```bash
cd nodejs-assets/nodejs-project && npm install --legacy-peer-deps && cd ../..
npm run install:prebuilds
```

### `cargo: command not found` or `error: could not find Cargo.toml in filen-rs`
Either the devenv shell isn't active, or git submodules aren't initialized:
```bash
devenv shell
git submodule update --init --recursive
```

### `error: the option 'Z' is only accepted on the nightly compiler`
The Rust channel must be `nightly` (the crate uses `-Zhigher-ranked-assumptions`). Check `devenv.nix` has `channel = "nightly"`.

### `is 'cmake' not installed?`
The `cmake` package is needed for the heif-decoder build. It should be in `devenv.nix` packages. Verify with `which cmake`.

## Device builds (code signing)

The `ios/` directory is gitignored, so signing config stays local. But `app.config.ts` contains the Apple Team ID and bundle identifier that Expo uses during `prebuild`.

### Free Apple Developer account

A free account doesn't support App Groups or iCloud entitlements. To build on a physical device:

1. **Change identifiers in `app.config.ts`:**
   - `APPLE_TEAM_ID` → your team ID (find it in Xcode → Settings → Accounts → your Apple ID)
   - `IDENTIFIER` → a unique bundle ID (e.g., `dev.filen.app`)
   - `IOS_APP_GROUP_ID` → matching group ID (e.g., `group.dev.filen.app`)

2. **Update the hardcoded app group in `lib/paths.ts`** (search for `group.io.filen.app`)

3. **Strip entitlements** from all three targets — free accounts can't provision App Groups or iCloud:
   - `ios/Filen/Filen.entitlements`
   - `ios/FilenShareIntentExtension/ShareExtension.entitlements`
   - `ios/FilenFileProvider/FilenFileProvider.entitlements`

   Replace each file's contents with an empty dict:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
     <dict/>
   </plist>
   ```

4. **Re-run prebuild** to regenerate the `ios/` directory with your identifiers:
   ```bash
   npm run install:prebuilds && npx expo prebuild --platform ios
   ```

5. **Build:**
   ```bash
   npx expo run:ios --device
   ```

**Note:** Without App Groups, the File Provider and Share Extension can't communicate with the main app (e.g., sharing auth state). The main app will still work.

### Paid Apple Developer account

With a paid account you can keep App Groups and iCloud. Follow the same steps above but skip step 3 — instead, update the entitlements files to reference your new group/container IDs and register them in the Apple Developer portal.

## Nuclear option: full clean rebuild

```bash
rm -rf ios android filen-rs/target
rm -rf ~/Library/Developer/Xcode/DerivedData/Filen-*
npm run install:prebuilds && npx expo prebuild --platform ios
npm run ios
```
