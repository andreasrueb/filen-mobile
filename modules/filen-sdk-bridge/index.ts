import { NitroModules, type HybridObject } from "react-native-nitro-modules"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilenSdkBridgeModuleType extends HybridObject<{}> {
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
	shareItems(paramsJson: string): Promise<void>
	// Cloud: Public link details
	editItemPublicLink(paramsJson: string): Promise<void>
	filePublicLinkInfo(paramsJson: string): Promise<string>
	filePublicLinkHasPassword(paramsJson: string): Promise<string>
	directoryPublicLinkInfo(paramsJson: string): Promise<string>
	directorySizePublicLink(paramsJson: string): Promise<string>
	// Cloud: File versions
	fetchFileVersions(paramsJson: string): Promise<string>
	restoreFileVersion(paramsJson: string): Promise<void>
	// Cloud: Crypto
	decryptDirectoryPublicLinkKey(paramsJson: string): Promise<string>
	// Contacts
	fetchContacts(paramsJson: string): Promise<string>
	fetchIncomingContactRequests(paramsJson: string): Promise<string>
	fetchOutgoingContactRequests(paramsJson: string): Promise<string>
	acceptContactRequest(paramsJson: string): Promise<void>
	denyContactRequest(paramsJson: string): Promise<void>
	sendContactRequest(paramsJson: string): Promise<void>
	removeContact(paramsJson: string): Promise<void>
	blockContact(paramsJson: string): Promise<void>
	unblockContact(paramsJson: string): Promise<void>
	deleteOutgoingContactRequest(paramsJson: string): Promise<void>
	// Chats
	fetchChats(paramsJson: string): Promise<string>
	createChat(paramsJson: string): Promise<string>
	deleteChat(paramsJson: string): Promise<void>
	leaveChat(paramsJson: string): Promise<void>
	sendChatMessage(paramsJson: string): Promise<string>
	editChatMessage(paramsJson: string): Promise<void>
	deleteChatMessage(paramsJson: string): Promise<void>
	disableChatMessageEmbeds(paramsJson: string): Promise<void>
	editChatName(paramsJson: string): Promise<void>
	sendChatTyping(paramsJson: string): Promise<void>
	chatMarkAsRead(paramsJson: string): Promise<void>
	chatOnline(paramsJson: string): Promise<string>
	chatUnread(paramsJson: string): Promise<string>
	chatUnreadCount(paramsJson: string): Promise<string>
	addChatParticipant(paramsJson: string): Promise<void>
	removeChatParticipant(paramsJson: string): Promise<void>
	fetchChatMessages(paramsJson: string): Promise<string>
	fetchChatsLastFocus(paramsJson: string): Promise<string>
	updateChatsLastFocus(paramsJson: string): Promise<void>
	muteChat(paramsJson: string): Promise<void>
	decryptChatMessage(paramsJson: string): Promise<string>
	// Notes
	fetchNotes(paramsJson: string): Promise<string>
	fetchNoteContent(paramsJson: string): Promise<string>
	createNote(paramsJson: string): Promise<string>
	deleteNote(paramsJson: string): Promise<void>
	archiveNote(paramsJson: string): Promise<void>
	trashNote(paramsJson: string): Promise<void>
	restoreNote(paramsJson: string): Promise<void>
	duplicateNote(paramsJson: string): Promise<string>
	renameNote(paramsJson: string): Promise<void>
	editNote(paramsJson: string): Promise<void>
	changeNoteType(paramsJson: string): Promise<void>
	pinNote(paramsJson: string): Promise<void>
	favoriteNote(paramsJson: string): Promise<void>
	fetchNoteHistory(paramsJson: string): Promise<string>
	restoreNoteHistory(paramsJson: string): Promise<void>
	addNoteParticipant(paramsJson: string): Promise<void>
	removeNoteParticipant(paramsJson: string): Promise<void>
	changeNoteParticipantPermissions(paramsJson: string): Promise<void>
	fetchNotesTags(paramsJson: string): Promise<string>
	createNoteTag(paramsJson: string): Promise<string>
	deleteNoteTag(paramsJson: string): Promise<void>
	renameNoteTag(paramsJson: string): Promise<void>
	favoriteNoteTag(paramsJson: string): Promise<void>
	tagNote(paramsJson: string): Promise<void>
	untagNote(paramsJson: string): Promise<void>
	// User
	enableTwoFactorAuthentication(paramsJson: string): Promise<string>
	disableTwoFactorAuthentication(paramsJson: string): Promise<void>
	deleteAccount(paramsJson: string): Promise<void>
	fetchUserPublicKey(paramsJson: string): Promise<string>
	didExportMasterKeys(paramsJson: string): Promise<void>
	fetchAccount(paramsJson: string): Promise<string>
	changePassword(paramsJson: string): Promise<void>
	updatePersonalInformation(paramsJson: string): Promise<void>
	updateNickname(paramsJson: string): Promise<void>
	changeEmail(paramsJson: string): Promise<void>
	fetchGDPR(paramsJson: string): Promise<string>
	toggleVersioning(paramsJson: string): Promise<void>
	toggleLoginAlerts(paramsJson: string): Promise<void>
	deleteAllVersionedFiles(paramsJson: string): Promise<void>
	deleteEverything(paramsJson: string): Promise<void>
	fetchEvents(paramsJson: string): Promise<string>
	fetchEvent(paramsJson: string): Promise<string>
	uploadAvatar(paramsJson: string): Promise<void>
	// FS
	readFileAsString(paramsJson: string): Promise<string>
	writeFileAsString(paramsJson: string): Promise<void>
	// Transfers
	uploadFile(paramsJson: string): Promise<string>
	downloadFile(paramsJson: string): Promise<void>
	uploadDirectory(paramsJson: string): Promise<void>
	downloadDirectory(paramsJson: string): Promise<void>
	transferAction(paramsJson: string): Promise<string>
	fetchTransfers(paramsJson: string): Promise<string>
	// HTTP Server
	startHttpServer(paramsJson: string): Promise<string>
	stopHttpServer(paramsJson: string): Promise<void>
	restartHTTPServer(paramsJson: string): Promise<string>
	httpStatus(paramsJson: string): Promise<string>
}

let instance: FilenSdkBridgeModuleType | null = null

function getBridge(): FilenSdkBridgeModuleType {
	if (!instance) {
		instance = NitroModules.createHybridObject<FilenSdkBridgeModuleType>("FilenSdkBridge")
	}

	return instance
}

export default new Proxy({} as FilenSdkBridgeModuleType, {
	get(_target, prop) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (getBridge() as any)[prop]
	}
})
