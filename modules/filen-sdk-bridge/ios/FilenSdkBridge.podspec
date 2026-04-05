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

  s.pod_target_xcconfig = {
    'SWIFT_INCLUDE_PATHS' => staging_dir,
    'HEADER_SEARCH_PATHS' => "$(inherited) #{staging_dir}"
  }

  # -lfilen_mobile_sdk_bridge tells the linker to find the Rust static library.
  # The SDK-conditional LIBRARY_SEARCH_PATHS are injected by the Podfile post_install
  # hook so the correct platform slice (device vs simulator) is always used.
  s.user_target_xcconfig = {
    'OTHER_LDFLAGS' => '$(inherited) -lfilen_mobile_sdk_bridge'
  }
end
