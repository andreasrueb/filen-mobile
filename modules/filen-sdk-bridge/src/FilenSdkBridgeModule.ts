import { requireNativeModule } from "expo-modules-core"

export type FilenSdkBridgeModuleType = {
	initialize(): void
	// Auth
	login(paramsJson: string): Promise<string>
	register(paramsJson: string): Promise<void>
	reinitSDK(paramsJson: string): Promise<void>
	resendConfirmation(paramsJson: string): Promise<void>
	forgotPassword(paramsJson: string): Promise<void>
	// Cloud: Directory operations
	createDirectory(paramsJson: string): Promise<string>
	getDirectory(paramsJson: string): Promise<string>
	deleteDirectory(paramsJson: string): Promise<void>
	trashDirectory(paramsJson: string): Promise<void>
	restoreDirectory(paramsJson: string): Promise<void>
	directoryExists(paramsJson: string): Promise<string>
	renameDirectory(paramsJson: string): Promise<void>
	moveDirectory(paramsJson: string): Promise<void>
	changeDirectoryColor(paramsJson: string): Promise<void>
	favoriteDirectory(paramsJson: string): Promise<void>
	editDirectoryMetadata(paramsJson: string): Promise<void>
	fetchDirectorySize(paramsJson: string): Promise<string>
	getDirectoryTree(paramsJson: string): Promise<string>
	directoryUUIDToPath(paramsJson: string): Promise<string>
	directoryPublicLinkStatus(paramsJson: string): Promise<string>
	// Cloud: File operations
	getFile(paramsJson: string): Promise<string>
	deleteFile(paramsJson: string): Promise<void>
	trashFile(paramsJson: string): Promise<void>
	restoreFile(paramsJson: string): Promise<void>
	fileExists(paramsJson: string): Promise<string>
	renameFile(paramsJson: string): Promise<void>
	moveFile(paramsJson: string): Promise<void>
	favoriteFile(paramsJson: string): Promise<void>
	editFileMetadata(paramsJson: string): Promise<void>
	fileUUIDToPath(paramsJson: string): Promise<string>
	filePublicLinkStatus(paramsJson: string): Promise<string>
	// Cloud: Listing & search
	fetchCloudItems(paramsJson: string): Promise<string>
	queryGlobalSearch(paramsJson: string): Promise<string>
	// Cloud: Public links
	toggleItemPublicLink(paramsJson: string): Promise<string>
	// Cloud: Sharing
	stopSharingItem(paramsJson: string): Promise<void>
	removeSharedItem(paramsJson: string): Promise<void>
}

export default requireNativeModule<FilenSdkBridgeModuleType>("FilenSdkBridge")
