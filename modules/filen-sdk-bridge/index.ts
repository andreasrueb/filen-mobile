import { NitroModules, type HybridObject } from "react-native-nitro-modules"

// Nitro-native return types (C++ maps/vectors auto-converted to JSI, no JSON.parse)
// Null JSON values are omitted → undefined in JS (Nitro doesn't support nullptr_t)
type NativeScalar = string | number | boolean
type NativeFlatObj = Record<string, NativeScalar | undefined>
type NativeObjArray = NativeFlatObj[]
type NativeResultObj = Record<string, NativeScalar | NativeObjArray | undefined>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilenSdkBridgeModuleType extends HybridObject<{}> {
	// Auth
	login(email: string, password: string, twoFactorCode: string | undefined): Promise<string>
	register(email: string, password: string): Promise<void>
	reinitSDK(paramsJson: string): Promise<void>
	resendConfirmation(email: string): Promise<void>
	forgotPassword(email: string): Promise<void>
	// Cloud: Directory operations
	createDirectory(parent: string, name: string): Promise<string>
	getDirectory(uuid: string): Promise<string>
	deleteDirectory(uuid: string): Promise<void>
	trashDirectory(uuid: string): Promise<void>
	restoreDirectory(uuid: string): Promise<void>
	directoryExists(name: string, parent: string): Promise<string>
	renameDirectory(uuid: string, name: string): Promise<void>
	moveDirectory(uuid: string, to: string): Promise<void>
	changeDirectoryColor(uuid: string, color: string): Promise<void>
	favoriteDirectory(uuid: string, favorite: boolean): Promise<void>
	editDirectoryMetadata(uuid: string, metadataName: string): Promise<void>
	fetchDirectorySize(uuid: string): Promise<string>
	getDirectoryTree(uuid: string): Promise<string>
	directoryUUIDToPath(uuid: string): Promise<string>
	directoryPublicLinkStatus(uuid: string): Promise<string>
	// Cloud: File operations
	getFile(uuid: string): Promise<string>
	deleteFile(uuid: string): Promise<void>
	trashFile(uuid: string): Promise<void>
	restoreFile(uuid: string): Promise<void>
	fileExists(name: string, parent: string): Promise<string>
	renameFile(uuid: string, name: string): Promise<void>
	moveFile(uuid: string, to: string): Promise<void>
	favoriteFile(uuid: string, favorite: boolean): Promise<void>
	editFileMetadata(uuid: string, metadataName: string, metadataMime: string | undefined): Promise<void>
	fileUUIDToPath(uuid: string): Promise<string>
	filePublicLinkStatus(uuid: string): Promise<string>
	// Cloud: Listing & search
	fetchCloudItems(of: string, parent: string, receiverId: number): Promise<NativeObjArray>
	queryGlobalSearch(query: string): Promise<string>
	// Cloud: Public links
	toggleItemPublicLink(paramsJson: string): Promise<string>
	// Cloud: Sharing
	stopSharingItem(uuid: string, receiverId: number): Promise<void>
	removeSharedItem(uuid: string): Promise<void>
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
	decryptDirectoryPublicLinkKey(metadata: string): Promise<string>
	// Contacts
	fetchContacts(type: string): Promise<string>
	fetchIncomingContactRequests(): Promise<string>
	fetchOutgoingContactRequests(): Promise<string>
	acceptContactRequest(uuid: string): Promise<void>
	denyContactRequest(uuid: string): Promise<void>
	sendContactRequest(email: string): Promise<void>
	removeContact(uuid: string): Promise<void>
	blockContact(email: string): Promise<void>
	unblockContact(uuid: string): Promise<void>
	deleteOutgoingContactRequest(uuid: string): Promise<void>
	// Chats
	fetchChats(): Promise<string>
	createChat(paramsJson: string): Promise<string>
	deleteChat(uuid: string): Promise<void>
	leaveChat(uuid: string): Promise<void>
	sendChatMessage(paramsJson: string): Promise<string>
	editChatMessage(conversation: string, uuid: string, message: string): Promise<void>
	deleteChatMessage(conversation: string, uuid: string): Promise<void>
	disableChatMessageEmbeds(uuid: string, conversation: string): Promise<void>
	editChatName(conversation: string, name: string): Promise<void>
	sendChatTyping(conversation: string, type: string): Promise<void>
	chatMarkAsRead(uuid: string): Promise<void>
	chatOnline(uuid: string): Promise<string>
	chatUnread(): Promise<string>
	chatUnreadCount(uuid: string): Promise<string>
	addChatParticipant(paramsJson: string): Promise<void>
	removeChatParticipant(paramsJson: string): Promise<void>
	fetchChatMessages(conversation: string, timestamp: number): Promise<NativeObjArray>
	fetchChatsLastFocus(): Promise<string>
	updateChatsLastFocus(paramsJson: string): Promise<void>
	muteChat(conversation: string, mute: boolean): Promise<void>
	decryptChatMessage(conversation: string, message: string): Promise<string>
	// Notes
	fetchNotes(): Promise<string>
	fetchNoteContent(uuid: string): Promise<string>
	createNote(title: string | undefined): Promise<string>
	deleteNote(uuid: string): Promise<void>
	archiveNote(uuid: string): Promise<void>
	trashNote(uuid: string): Promise<void>
	restoreNote(uuid: string): Promise<void>
	duplicateNote(uuid: string): Promise<string>
	renameNote(uuid: string, title: string): Promise<void>
	editNote(uuid: string, content: string, preview: string): Promise<void>
	changeNoteType(uuid: string, type: string, content: string | undefined): Promise<void>
	pinNote(uuid: string, pin: boolean): Promise<void>
	favoriteNote(uuid: string, favorite: boolean): Promise<void>
	fetchNoteHistory(uuid: string): Promise<string>
	restoreNoteHistory(uuid: string, id: number): Promise<void>
	addNoteParticipant(uuid: string, contactUuid: string, permissionsWrite: boolean): Promise<void>
	removeNoteParticipant(uuid: string, userId: number): Promise<void>
	changeNoteParticipantPermissions(uuid: string, userId: number, permissionsWrite: boolean): Promise<void>
	fetchNotesTags(): Promise<string>
	createNoteTag(name: string): Promise<string>
	deleteNoteTag(uuid: string): Promise<void>
	renameNoteTag(uuid: string, name: string): Promise<void>
	favoriteNoteTag(uuid: string, favorite: boolean): Promise<void>
	tagNote(uuid: string, tag: string): Promise<void>
	untagNote(uuid: string, tag: string): Promise<void>
	// User
	enableTwoFactorAuthentication(twoFactorCode: string | undefined): Promise<string>
	disableTwoFactorAuthentication(twoFactorCode: string | undefined): Promise<void>
	deleteAccount(twoFactorCode: string | undefined): Promise<void>
	fetchUserPublicKey(email: string): Promise<string>
	didExportMasterKeys(): Promise<void>
	fetchAccount(): Promise<string>
	changePassword(currentPassword: string, newPassword: string): Promise<void>
	updatePersonalInformation(paramsJson: string): Promise<void>
	updateNickname(paramsJson: string): Promise<void>
	changeEmail(paramsJson: string): Promise<void>
	fetchGDPR(): Promise<string>
	toggleVersioning(enable: boolean): Promise<void>
	toggleLoginAlerts(enable: boolean): Promise<void>
	deleteAllVersionedFiles(): Promise<void>
	deleteEverything(): Promise<void>
	fetchEvents(paramsJson: string): Promise<string>
	fetchEvent(paramsJson: string): Promise<string>
	uploadAvatar(uri: string): Promise<void>
	// FS
	readFileAsString(path: string): Promise<string>
	writeFileAsString(path: string, content: string): Promise<void>
	// Transfers
	uploadFile(paramsJson: string): Promise<string>
	downloadFile(paramsJson: string): Promise<void>
	uploadDirectory(paramsJson: string): Promise<void>
	downloadDirectory(paramsJson: string): Promise<void>
	transferAction(id: string, action: string): Promise<string>
	fetchTransfers(): Promise<NativeResultObj>
	// HTTP Server
	startHttpServer(): Promise<string>
	stopHttpServer(): Promise<void>
	restartHTTPServer(): Promise<string>
	httpStatus(): Promise<string>
}

export default NitroModules.createHybridObject<FilenSdkBridgeModuleType>("FilenSdkBridge")
