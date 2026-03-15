import { requireNativeModule } from "expo-modules-core"

export type FilenSdkBridgeModuleType = {
	initialize(): void
	login(paramsJson: string): Promise<string>
	register(paramsJson: string): Promise<void>
	reinitSDK(paramsJson: string): Promise<void>
	resendConfirmation(paramsJson: string): Promise<void>
	forgotPassword(paramsJson: string): Promise<void>
}

export default requireNativeModule<FilenSdkBridgeModuleType>("FilenSdkBridge")
