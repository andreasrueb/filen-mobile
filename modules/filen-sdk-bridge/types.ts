// ── Bridge param & return types ─────────────────────────────────────
// Derived from the Rust serde structs in filen-rs/filen-mobile-sdk-bridge/src/

// ── Auth ────────────────────────────────────────────────────────────

export type LoginResult = {
	apiKey: string
	masterKeys: string[]
	publicKey: string
	privateKey: string
	email: string
	userId: number
	password: string
	twoFactorCode: string
	connectToSocket: boolean
	metadataCache: boolean
	baseFolderUUID: string
	authVersion: number
}

// ── Cloud: Items ────────────────────────────────────────────────────

export type BridgeCloudItem = {
	uuid: string
	parent: string
	name: string
	type: "file" | "directory"
	isShared: boolean
	selected: boolean
	favorited: boolean
	// File-specific
	size?: number
	mime?: string
	key?: string
	lastModified?: number
	creation?: number | null
	hash?: string | null
	region?: string
	bucket?: string
	timestamp?: number
	chunks?: number
	version?: number
	rm?: string
	// Directory-specific
	color?: string
}

export type BridgeDirectoryDto = {
	uuid: string
	parent: string
	name: string
	color: string
	favorited: boolean
	timestamp: number
	lastModified: number
	size: number
	type: "directory"
}

export type BridgeFileDto = {
	uuid: string
	parent: string
	name: string
	size: number
	mime: string
	key: string
	lastModified: number
	creation: number | null
	hash: string | null
	favorited: boolean
	region: string
	bucket: string
	timestamp: number
	chunks: number
	type: "file"
	version: number
	rm: string
}

// ── Cloud: Public links ─────────────────────────────────────────────

export type TogglePublicLinkItem = {
	type: string
	uuid: string
}

export type EditPublicLinkParams = {
	type?: string
	itemType?: string
	itemUUID?: string
	enableDownload?: boolean
	expiration?: string
	linkUUID?: string
	password?: string | null
}

export type ShareItem = {
	uuid: string
	type: string
	parent: string
}

// ── Chats ───────────────────────────────────────────────────────────

export type ChatParticipantDto = {
	userId: number
	email: string
	avatar: string | null
	nickName: string
	permissionsAdd: boolean
	added: number
	appearOffline: boolean
	lastActive: number
}

export type ChatMessagePartialDto = {
	uuid: string
	senderId: number
	senderEmail: string
	senderAvatar: string | null
	senderNickName: string
	message: string | null
}

export type ChatMessageDto = {
	uuid: string
	senderId: number
	senderEmail: string
	senderAvatar: string | null
	senderNickName: string
	message: string | null
	conversation: string
	replyTo: ChatMessagePartialDto | null
	embedDisabled: boolean
	edited: boolean
	editedTimestamp: number
	sentTimestamp: number
}

export type ChatDto = {
	uuid: string
	ownerId: number
	name: string | null
	participants: ChatParticipantDto[]
	muted: boolean
	created: number
	lastFocus: number | null
	lastMessage: ChatMessageDto | null
}

export type ChatLastFocusEntry = {
	uuid: string
	lastFocus: number
}

export type ChatContact = {
	uuid: string
	userId: number
	email: string
	nickName?: string
	publicKey: string
	avatar?: string | null
}

export type ChatReplyTo = {
	uuid: string
	senderId: number
	senderEmail: string
	senderAvatar?: string | null
	senderNickName: string
	message?: string | null
}

// ── Notes ───────────────────────────────────────────────────────────

export type NoteParticipantDto = {
	userId: number
	isOwner: boolean
	email: string
	avatar: string | null
	nickName: string
	permissionsWrite: boolean
	addedTimestamp: number
}

export type NoteTagDto = {
	uuid: string
	name: string | null
	favorite: boolean
	editedTimestamp: number
	createdTimestamp: number
}

export type NoteDto = {
	uuid: string
	ownerId: number
	lastEditorId: number
	favorite: boolean
	pinned: boolean
	tags: NoteTagDto[]
	type: string
	title: string | null
	preview: string | null
	trash: boolean
	archive: boolean
	createdTimestamp: number
	editedTimestamp: number
	participants: NoteParticipantDto[]
}

export type NoteContentResponse = {
	content: string | null
	type: string
}

export type NoteHistoryDto = {
	id: number
	preview: string | null
	content: string | null
	editedTimestamp: number
	editorId: number
	type: string
}

// ── Contacts ────────────────────────────────────────────────────────

export type ContactDto = {
	uuid: string
	userId: number
	email: string
	avatar: string | null
	nickName: string
	lastActive: number
	timestamp: number
}

export type ContactRequestInDto = {
	uuid: string
	userId: number
	email: string
	avatar: string | null
	nickName: string
}

export type ContactRequestOutDto = {
	uuid: string
	email: string
	avatar: string | null
	nickName: string
}

// ── User ────────────────────────────────────────────────────────────

export type EnableTwoFaResponse = {
	recoveryKey: string
}

export type AccountResponse = {
	account: Record<string, unknown>
	settings: Record<string, unknown>
}

// ── Transfers ───────────────────────────────────────────────────────

export type UploadFileParams = {
	id: string
	localPath: string
	parent: string
	name: string
	size: number
	lastModified?: number
	creation?: number
	deleteAfterUpload?: boolean
	uuid?: string
	isShared?: boolean
	receiverEmail?: string
	receiverId?: number
	sharerEmail?: string
	sharerId?: number
	receivers?: unknown
}

export type DownloadFileParams = {
	id: string
	uuid: string
	bucket: string
	region: string
	chunks: number
	version: number
	key: string
	end?: number
	start?: number
	destination: string
	size: number
	name: string
}

export type UploadDirectoryParams = {
	id: string
	localPath: string
	parent: string
	name: string
	size: number
	deleteAfterUpload?: boolean
	isShared?: boolean
}

export type DownloadDirectoryParams = {
	id: string
	uuid: string
	destination: string
	name: string
	size: number
}

export type FetchTransfersResult = {
	transfers: Transfer[]
	finishedTransfers: Transfer[]
	speed: number
	remaining: number
	progress: number
}

// ── HTTP Server ─────────────────────────────────────────────────────

export type HttpServerInfo = {
	port: number
	authToken: string
}

export type HttpStatusInfo = {
	port: number
	authToken: string
	active: boolean
}
