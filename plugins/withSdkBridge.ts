import { ConfigPlugin } from "@expo/config-plugins"
import { withDangerousMod } from "@expo/config-plugins/build/plugins/withDangerousMod"
import { withAppBuildGradle } from "@expo/config-plugins/build/plugins/android-plugins"
import { execSync } from "child_process"
import fs from "node:fs"
import path from "node:path"

export type IOSRustBuildProps = {
	libName: string
	crateName: string
	targets: string[]
	cargoArgs?: string
}

export type AndroidRustBuildProps = {
	crateName: string
	libName: string
	targets: string[]
	cargoArgs?: string
}

export type SdkBridgePluginProps = {
	ios: IOSRustBuildProps
	android: AndroidRustBuildProps
}

const androidTargetsToRustTargets: Record<string, string> = {
	x86_64: "x86_64-linux-android",
	"armeabi-v7a": "armv7-linux-androideabi",
	"arm64-v8a": "aarch64-linux-android",
	x86: "i686-linux-android"
}

async function buildRustForIOS(projectRoot: string, props: IOSRustBuildProps) {
	const { libName, targets, cargoArgs, crateName } = props
	const fullRustPath = path.join(projectRoot, "filen-rs")

	// 1. Build Rust static libraries for all targets
	execSync(
		`cargo build --lib --release ${targets.map(t => `--target ${t}`).join(" ")} -p ${crateName} ${cargoArgs || ""}`,
		{
			cwd: fullRustPath,
			stdio: "inherit"
		}
	)

	// 2. Remove dylibs so the linker only finds the static .a libraries
	for (const t of targets) {
		const dylib = path.join(fullRustPath, "target", t, "release", `lib${libName}.dylib`)

		if (fs.existsSync(dylib)) {
			fs.unlinkSync(dylib)
		}
	}

	// 3. Ensure the hand-written C FFI header exists.
	// The header lives at filen-rs/target/ffi-headers/<libName>_ffi.h and is
	// checked into the repo. cbindgen cannot handle the hyper generics in the
	// crate, so we maintain the header manually (it mirrors ffi.rs exactly).
	const ffiHeaderDir = path.join(fullRustPath, "target", "ffi-headers")
	const ffiHeader = path.join(ffiHeaderDir, `${libName}_ffi.h`)

	fs.mkdirSync(ffiHeaderDir, { recursive: true })

	if (!fs.existsSync(ffiHeader)) {
		// Copy the checked-in header from the crate directory
		const srcHeader = path.join(fullRustPath, crateName, "ffi-header", `${libName}_ffi.h`)

		if (fs.existsSync(srcHeader)) {
			fs.copyFileSync(srcHeader, ffiHeader)
		} else {
			throw new Error(`[withSdkBridge] FFI header not found at ${ffiHeader} or ${srcHeader}`)
		}
	}
}

const withSdkBridgeIOS: ConfigPlugin<SdkBridgePluginProps> = (config, props) => {
	const { ios } = props

	// Build Rust during prebuild
	config = withDangerousMod(config, [
		"ios",
		async config => {
			await buildRustForIOS(config.modRequest.projectRoot, ios)

			return config
		}
	])

	return config
}

const withSdkBridgeAndroid: ConfigPlugin<SdkBridgePluginProps> = (config, props) => {
	const { android } = props

	config = withAppBuildGradle(config, async config => {
		config.modResults.contents += `
android {
	sourceSets {
		main {
			kotlin {
				srcDirs += 'build/generated/kotlin/uniffi/${android.libName}'
			}
		}
	}
}
`
		return config
	})

	return withDangerousMod(config, [
		"android",
		async config => {
			const { libName, crateName, targets, cargoArgs } = android
			const platformRoot = config.modRequest.platformProjectRoot
			const androidBuildDir = path.join(platformRoot, "app", "build")
			const androidSrcDir = path.join(platformRoot, "app", "src", "main")
			const jniLibsDir = path.join(androidSrcDir, "jniLibs")
			const fullRustPath = path.join(config.modRequest.projectRoot, "filen-rs")

			try {
				// Build rust library for android targets
				execSync(
					`cargo ndk${targets.map(t => ` -t ${t}`).join("")} build --release -p ${crateName} ${cargoArgs || ""}`,
					{
						cwd: fullRustPath,
						stdio: "inherit"
					}
				)

				// Generate Kotlin bindings
				execSync(
					`cargo run --bin uniffi-bindgen generate --library ./target/${androidTargetsToRustTargets[targets[0]!]!}/release/lib${libName}.so --language kotlin --out-dir ${androidBuildDir}/generated/kotlin -n`,
					{
						cwd: fullRustPath,
						stdio: "inherit"
					}
				)

				// Copy .so files to jniLibs
				targets.forEach(t => {
					fs.mkdirSync(path.join(jniLibsDir, t), { recursive: true })
					fs.copyFileSync(
						path.join(fullRustPath, "target", androidTargetsToRustTargets[t]!, "release", `lib${libName}.so`),
						path.join(jniLibsDir, t, `lib${libName}.so`)
					)
				})
			} catch (e) {
				console.warn(`[withSdkBridge] Android Rust build failed (targets may not be installed): ${e}`)
			}

			return config
		}
	])
}

export const withSdkBridge: ConfigPlugin<SdkBridgePluginProps> = (config, props) => {
	config = withSdkBridgeIOS(config, props)
	config = withSdkBridgeAndroid(config, props)
	return config
}

export default withSdkBridge
