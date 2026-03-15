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

	execSync(
		`cargo build --lib --release ${targets.map(t => `--target ${t}`).join(" ")} -p ${crateName} ${cargoArgs || ""}`,
		{
			cwd: fullRustPath,
			stdio: "inherit"
		}
	)

	execSync(
		`cargo run -p uniffi-bindgen-swift -- target/${targets[0]!}/release/lib${libName}.a target/uniffi-xcframework-staging-sdk-bridge --swift-sources --headers --modulemap --module-name ${libName}FFI --modulemap-filename module.modulemap`,
		{
			cwd: fullRustPath,
			stdio: "inherit"
		}
	)

	const iosTargetPath = path.join(fullRustPath, "target", "ios-sdk-bridge")

	if (fs.existsSync(iosTargetPath)) {
		await fs.promises.rm(iosTargetPath, {
			recursive: true,
			force: true
		})
	}

	execSync(
		`xcodebuild -create-xcframework ${targets
			.map(t => `-library target/${t}/release/lib${libName}.a -headers target/uniffi-xcframework-staging-sdk-bridge`)
			.join(" ")} -output target/ios-sdk-bridge/lib${libName}.xcframework`,
		{
			cwd: fullRustPath,
			stdio: "inherit"
		}
	)
}

const withSdkBridgeIOS: ConfigPlugin<SdkBridgePluginProps> = (config, props) => {
	const { ios } = props

	// Build Rust during prebuild
	config = withDangerousMod(config, [
		"ios",
		async config => {
			await buildRustForIOS(config.modRequest.projectRoot, ios)

			// Copy the generated Swift binding file to the Expo module's ios/ directory
			const fullRustPath = path.join(config.modRequest.projectRoot, "filen-rs")
			const generatedSwiftFile = path.join(
				fullRustPath,
				"target",
				"uniffi-xcframework-staging-sdk-bridge",
				`${ios.libName}.swift`
			)
			const moduleIosDir = path.join(config.modRequest.projectRoot, "modules", "filen-sdk-bridge", "ios")

			await fs.promises.mkdir(moduleIosDir, { recursive: true })
			await fs.promises.copyFile(generatedSwiftFile, path.join(moduleIosDir, `${ios.libName}.swift`))

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
