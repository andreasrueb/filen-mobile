Pod::Spec.new do |s|
  s.name           = 'FilenSdkBridge'
  s.version        = '0.1.0'
  s.summary        = 'Filen SDK Bridge Expo Module'
  s.description    = 'Expo Module wrapping the Filen Rust SDK via uniffi bindings'
  s.author         = 'FilenCloudDienste'
  s.homepage       = 'https://filen.io'
  s.license        = { type: 'AGPL-3.0' }
  s.platforms      = { :ios => '16.0' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,swift}'
  s.swift_version = '5.0'

  staging_dir = '$(PODS_TARGET_SRCROOT)/../../../filen-rs/target/uniffi-xcframework-staging-sdk-bridge'

  # Pod target: modulemap for Swift compilation
  s.pod_target_xcconfig = {
    'SWIFT_INCLUDE_PATHS' => staging_dir,
    'HEADER_SEARCH_PATHS' => "$(inherited) #{staging_dir}"
  }

  # User target (main app): link the Rust static library
  s.user_target_xcconfig = {
    'LIBRARY_SEARCH_PATHS' => '$(inherited) "${PODS_ROOT}/../../filen-rs/target/aarch64-apple-ios-sim/release" "${PODS_ROOT}/../../filen-rs/target/aarch64-apple-ios/release"',
    'OTHER_LDFLAGS' => '$(inherited) -lfilen_mobile_sdk_bridge'
  }
end
