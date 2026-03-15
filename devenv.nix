{ pkgs, lib, config, inputs, ... }:

let
  pkgs-unstable = import inputs.nixpkgs-unstable { system = pkgs.stdenv.system; };
in {
    # Use a stdenv without C compiler, using cc from xcode command line tools
    stdenv = pkgs.stdenvNoCC;
    apple.sdk = null;

    packages = [
        # Core runtime
        pkgs.nodejs_22
        pkgs.watchman
        # iOS development
        pkgs.ios-deploy
        pkgs.ruby
        pkgs.bundler
        pkgs.cocoapods
        pkgs.cmake
        # Maestro UI testing (requires JDK)
        pkgs.temurin-bin-21
    ];

    languages.rust = {
        enable = true;
        channel = "nightly";
        targets = [ "aarch64-apple-ios" "aarch64-apple-ios-sim" ];
    };

    # Use Xcode's clang for Rust iOS cross-compilation (target-specific, won't affect xcodebuild)
    env.CC_aarch64_apple_ios = "/usr/bin/clang";
    env.CC_aarch64_apple_ios_sim = "/usr/bin/clang";
    env.CXX_aarch64_apple_ios = "/usr/bin/clang++";
    env.CXX_aarch64_apple_ios_sim = "/usr/bin/clang++";
    env.AR_aarch64_apple_ios = "/usr/bin/ar";
    env.AR_aarch64_apple_ios_sim = "/usr/bin/ar";

    # Ensure system clang/ld are found first on PATH (cmake resolves bare "clang" from PATH)
    # Unset Nix build variables that conflict with Xcode builds
    enterShell = ''
      mkdir -p "$DEVENV_ROOT/.devenv/bin"
      ln -sf /usr/bin/clang "$DEVENV_ROOT/.devenv/bin/cc"
      ln -sf /usr/bin/clang "$DEVENV_ROOT/.devenv/bin/clang"
      ln -sf /usr/bin/clang++ "$DEVENV_ROOT/.devenv/bin/clang++"
      ln -sf /usr/bin/ld "$DEVENV_ROOT/.devenv/bin/ld"
      ln -sf /usr/bin/find "$DEVENV_ROOT/.devenv/bin/find"
      export PATH="$DEVENV_ROOT/.devenv/bin:$HOME/.maestro/bin:$PATH"

      unset CC CXX AR
      unset LD LD_FOR_BUILD
      unset NIX_CC NIX_CC_FOR_BUILD
      unset NIX_BINTOOLS NIX_BINTOOLS_FOR_BUILD
      unset NIX_CFLAGS_COMPILE NIX_CFLAGS_COMPILE_FOR_BUILD
      unset NIX_LDFLAGS NIX_LDFLAGS_FOR_BUILD
      unset NIX_HARDENING_ENABLE
      unset NIX_ENFORCE_NO_NATIVE
      unset NIX_IGNORE_LD_THROUGH_GCC
      unset NIX_DONT_SET_RPATH NIX_DONT_SET_RPATH_FOR_BUILD
      unset NIX_NO_SELF_RPATH
      unset NIX_BINTOOLS_WRAPPER_TARGET_BUILD_arm64_apple_darwin
      unset NIX_BINTOOLS_WRAPPER_TARGET_HOST_arm64_apple_darwin
      unset NIX_CC_WRAPPER_TARGET_BUILD_arm64_apple_darwin
      unset NIX_CC_WRAPPER_TARGET_HOST_arm64_apple_darwin
      unset NIX_PKG_CONFIG_WRAPPER_TARGET_HOST_arm64_apple_darwin
      unset NIXPKGS_CMAKE_PREFIX_PATH
      unset cmakeFlags configureFlags mesonFlags

      # Fix ReactNativeDependencies header symlinks (headers are nested under Headers/)
      rnd_dir="$DEVENV_ROOT/ios/Pods/Headers/Public/ReactNativeDependencies"
      if [ -d "$rnd_dir/Headers" ]; then
        for dir in "$rnd_dir/Headers"/*/; do
          [ -d "$dir" ] && ln -sfn "Headers/$(basename "$dir")" "$rnd_dir/$(basename "$dir")"
        done
      fi
    '';

    dotenv.enable = true;
}
