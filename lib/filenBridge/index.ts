import FilenSdkBridgeModule, { type FilenSdkBridgeModuleType } from "../../modules/filen-sdk-bridge"
import type {
	LoginResult,
	BridgeCloudItem,
	BridgeDirectoryDto,
	BridgeFileDto,
	ChatDto,
	ChatMessageDto,
	ChatLastFocusEntry,
	ChatParticipantDto,
	ChatContact,
	ChatReplyTo,
	NoteDto,
	NoteContentResponse,
	NoteHistoryDto,
	NoteTagDto,
	ContactDto,
	ContactRequestInDto,
	ContactRequestOutDto,
	EnableTwoFaResponse,
	AccountResponse,
	TogglePublicLinkItem,
	EditPublicLinkParams,
	ShareItem,
	UploadFileParams,
	DownloadFileParams,
	UploadDirectoryParams,
	DownloadDirectoryParams,
	FetchTransfersResult,
	HttpServerInfo,
	HttpStatusInfo
} from "../../modules/filen-sdk-bridge/types"
import { useTransfersStore } from "@/stores/transfers.store"
import axios from "axios"

export class FilenBridge {
	private _httpServerPort: number | null = null
	private _httpAuthToken: string | null = null

	// ── Auth ────────────────────────────────────────────────────────

	public async login(email: string, password: string, twoFactorCode?: string): Promise<LoginResult> {
		const result = await FilenSdkBridgeModule.login(email, password, twoFactorCode)
		return JSON.parse(result) as LoginResult
	}

	public async register(email: string, password: string): Promise<void> {
		await FilenSdkBridgeModule.register(email, password)
	}

	public async reinitSDK(params: { sdkConfig: Record<string, unknown>; tmpPath: string }): Promise<void> {
		await FilenSdkBridgeModule.reinitSDK(JSON.stringify(params))
	}

	public async resendConfirmation(email: string): Promise<void> {
		await FilenSdkBridgeModule.resendConfirmation(email)
	}

	public async forgotPassword(email: string): Promise<void> {
		await FilenSdkBridgeModule.forgotPassword(email)
	}

	// ── Cloud: Directory operations ─────────────────────────────────

	public async createDirectory(parent: string, name: string): Promise<BridgeDirectoryDto> {
		const result = await FilenSdkBridgeModule.createDirectory(parent, name)
		return JSON.parse(result) as BridgeDirectoryDto
	}

	public async getDirectory(uuid: string): Promise<BridgeDirectoryDto> {
		const result = await FilenSdkBridgeModule.getDirectory(uuid)
		return JSON.parse(result) as BridgeDirectoryDto
	}

	public async deleteDirectory(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteDirectory(uuid)
	}

	public async trashDirectory(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.trashDirectory(uuid)
	}

	public async restoreDirectory(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.restoreDirectory(uuid)
	}

	public async directoryExists(name: string, parent: string): Promise<string | null> {
		const result = await FilenSdkBridgeModule.directoryExists(name, parent)
		return JSON.parse(result) as string | null
	}

	public async renameDirectory(uuid: string, name: string): Promise<void> {
		await FilenSdkBridgeModule.renameDirectory(uuid, name)
	}

	public async moveDirectory(uuid: string, to: string): Promise<void> {
		await FilenSdkBridgeModule.moveDirectory(uuid, to)
	}

	public async changeDirectoryColor(uuid: string, color: string): Promise<void> {
		await FilenSdkBridgeModule.changeDirectoryColor(uuid, color)
	}

	public async favoriteDirectory(uuid: string, favorite: boolean): Promise<void> {
		await FilenSdkBridgeModule.favoriteDirectory(uuid, favorite)
	}

	public async editDirectoryMetadata(uuid: string, metadataName: string): Promise<void> {
		await FilenSdkBridgeModule.editDirectoryMetadata(uuid, metadataName)
	}

	public async fetchDirectorySize(uuid: string): Promise<{ size: number; folders: number; files: number }> {
		const result = await FilenSdkBridgeModule.fetchDirectorySize(uuid)
		return JSON.parse(result)
	}

	public async getDirectoryTree(uuid: string): Promise<Record<string, BridgeCloudItem>> {
		const result = await FilenSdkBridgeModule.getDirectoryTree(uuid)
		return JSON.parse(result)
	}

	public async directoryUUIDToPath(uuid: string): Promise<string> {
		const result = await FilenSdkBridgeModule.directoryUUIDToPath(uuid)
		return JSON.parse(result) as string
	}

	public async directoryPublicLinkStatus(uuid: string): Promise<unknown> {
		const result = await FilenSdkBridgeModule.directoryPublicLinkStatus(uuid)
		return JSON.parse(result)
	}

	// ── Cloud: File operations ──────────────────────────────────────

	public async getFile(uuid: string): Promise<BridgeFileDto> {
		const result = await FilenSdkBridgeModule.getFile(uuid)
		return JSON.parse(result) as BridgeFileDto
	}

	public async deleteFile(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteFile(uuid)
	}

	public async trashFile(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.trashFile(uuid)
	}

	public async restoreFile(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.restoreFile(uuid)
	}

	public async fileExists(name: string, parent: string): Promise<string | null> {
		const result = await FilenSdkBridgeModule.fileExists(name, parent)
		return JSON.parse(result) as string | null
	}

	public async renameFile(uuid: string, name: string): Promise<void> {
		await FilenSdkBridgeModule.renameFile(uuid, name)
	}

	public async moveFile(uuid: string, to: string): Promise<void> {
		await FilenSdkBridgeModule.moveFile(uuid, to)
	}

	public async favoriteFile(uuid: string, favorite: boolean): Promise<void> {
		await FilenSdkBridgeModule.favoriteFile(uuid, favorite)
	}

	public async editFileMetadata(uuid: string, metadataName: string, metadataMime?: string): Promise<void> {
		await FilenSdkBridgeModule.editFileMetadata(uuid, metadataName, metadataMime)
	}

	public async fileUUIDToPath(uuid: string): Promise<string> {
		const result = await FilenSdkBridgeModule.fileUUIDToPath(uuid)
		return JSON.parse(result) as string
	}

	public async filePublicLinkStatus(uuid: string): Promise<unknown> {
		const result = await FilenSdkBridgeModule.filePublicLinkStatus(uuid)
		return JSON.parse(result)
	}

	// ── Cloud: Listing & search ─────────────────────────────────────

	public async fetchCloudItems(of: string, parent: string, receiverId: number): Promise<BridgeCloudItem[]> {
		const result = await FilenSdkBridgeModule.fetchCloudItems(of, parent, receiverId)
		return JSON.parse(result) as BridgeCloudItem[]
	}

	public async queryGlobalSearch(query: string): Promise<BridgeCloudItem[]> {
		const result = await FilenSdkBridgeModule.queryGlobalSearch(query)
		return JSON.parse(result) as BridgeCloudItem[]
	}

	// ── Cloud: Public links ─────────────────────────────────────────

	public async toggleItemPublicLink(item: TogglePublicLinkItem, enable: boolean, linkUUID?: string): Promise<string> {
		const result = await FilenSdkBridgeModule.toggleItemPublicLink(
			JSON.stringify({ item, enable, linkUUID: linkUUID ?? "" })
		)
		return JSON.parse(result) as string
	}

	// ── Cloud: Sharing ──────────────────────────────────────────────

	public async stopSharingItem(uuid: string, receiverId: number): Promise<void> {
		await FilenSdkBridgeModule.stopSharingItem(uuid, receiverId)
	}

	public async removeSharedItem(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.removeSharedItem(uuid)
	}

	public async shareItems(items: ShareItem[], email: string): Promise<void> {
		await FilenSdkBridgeModule.shareItems(JSON.stringify({ items, email }))
	}

	// ── Cloud: Public link details ──────────────────────────────────

	public async editItemPublicLink(params: EditPublicLinkParams): Promise<void> {
		await FilenSdkBridgeModule.editItemPublicLink(JSON.stringify(params))
	}

	public async filePublicLinkInfo(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.filePublicLinkInfo(JSON.stringify(params))
		return JSON.parse(result)
	}

	public async filePublicLinkHasPassword(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.filePublicLinkHasPassword(JSON.stringify(params))
		return JSON.parse(result)
	}

	public async directoryPublicLinkInfo(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.directoryPublicLinkInfo(JSON.stringify(params))
		return JSON.parse(result)
	}

	public async directorySizePublicLink(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.directorySizePublicLink(JSON.stringify(params))
		return JSON.parse(result)
	}

	// ── Cloud: File versions ────────────────────────────────────────

	public async fetchFileVersions(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.fetchFileVersions(JSON.stringify(params))
		return JSON.parse(result)
	}

	public async restoreFileVersion(params: Record<string, unknown>): Promise<void> {
		await FilenSdkBridgeModule.restoreFileVersion(JSON.stringify(params))
	}

	// ── Cloud: Crypto ───────────────────────────────────────────────

	public async decryptDirectoryPublicLinkKey(metadata: string): Promise<string> {
		const result = await FilenSdkBridgeModule.decryptDirectoryPublicLinkKey(metadata)
		return JSON.parse(result) as string
	}

	// ── Contacts ────────────────────────────────────────────────────

	public async fetchContacts(type: "all" | "blocked"): Promise<ContactDto[]> {
		const result = await FilenSdkBridgeModule.fetchContacts(type)
		return JSON.parse(result) as ContactDto[]
	}

	public async fetchIncomingContactRequests(): Promise<ContactRequestInDto[]> {
		const result = await FilenSdkBridgeModule.fetchIncomingContactRequests()
		return JSON.parse(result) as ContactRequestInDto[]
	}

	public async fetchOutgoingContactRequests(): Promise<ContactRequestOutDto[]> {
		const result = await FilenSdkBridgeModule.fetchOutgoingContactRequests()
		return JSON.parse(result) as ContactRequestOutDto[]
	}

	public async acceptContactRequest(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.acceptContactRequest(uuid)
	}

	public async denyContactRequest(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.denyContactRequest(uuid)
	}

	public async sendContactRequest(email: string): Promise<void> {
		await FilenSdkBridgeModule.sendContactRequest(email)
	}

	public async removeContact(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.removeContact(uuid)
	}

	public async blockContact(email: string): Promise<void> {
		await FilenSdkBridgeModule.blockContact(email)
	}

	public async unblockContact(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.unblockContact(uuid)
	}

	public async deleteOutgoingContactRequest(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteOutgoingContactRequest(uuid)
	}

	// ── Chats ───────────────────────────────────────────────────────

	public async fetchChats(): Promise<ChatDto[]> {
		const result = await FilenSdkBridgeModule.fetchChats()
		return JSON.parse(result) as ChatDto[]
	}

	public async createChat(contacts: ChatContact[]): Promise<ChatDto> {
		const result = await FilenSdkBridgeModule.createChat(JSON.stringify({ contacts }))
		return JSON.parse(result) as ChatDto
	}

	public async deleteChat(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteChat(uuid)
	}

	public async leaveChat(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.leaveChat(uuid)
	}

	public async sendChatMessage(conversation: string, message: string, replyTo?: ChatReplyTo, uuid?: string): Promise<ChatMessageDto> {
		const result = await FilenSdkBridgeModule.sendChatMessage(
			JSON.stringify({ conversation, message, replyTo: replyTo ?? null, uuid })
		)
		return JSON.parse(result) as ChatMessageDto
	}

	public async editChatMessage(conversation: string, uuid: string, message: string): Promise<void> {
		await FilenSdkBridgeModule.editChatMessage(conversation, uuid, message)
	}

	public async deleteChatMessage(conversation: string, uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteChatMessage(conversation, uuid)
	}

	public async disableChatMessageEmbeds(uuid: string, conversation: string): Promise<void> {
		await FilenSdkBridgeModule.disableChatMessageEmbeds(uuid, conversation)
	}

	public async editChatName(conversation: string, name: string): Promise<void> {
		await FilenSdkBridgeModule.editChatName(conversation, name)
	}

	public async sendChatTyping(conversation: string, type: string): Promise<void> {
		await FilenSdkBridgeModule.sendChatTyping(conversation, type)
	}

	public async chatMarkAsRead(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.chatMarkAsRead(uuid)
	}

	public async chatOnline(uuid: string): Promise<ChatParticipantDto[]> {
		const result = await FilenSdkBridgeModule.chatOnline(uuid)
		return JSON.parse(result) as ChatParticipantDto[]
	}

	public async chatUnread(): Promise<number> {
		const result = await FilenSdkBridgeModule.chatUnread()
		return JSON.parse(result) as number
	}

	public async chatUnreadCount(uuid: string): Promise<number> {
		const result = await FilenSdkBridgeModule.chatUnreadCount(uuid)
		return JSON.parse(result) as number
	}

	public async addChatParticipant(conversation: string, contact: ChatContact): Promise<void> {
		await FilenSdkBridgeModule.addChatParticipant(JSON.stringify({ conversation, contact }))
	}

	public async removeChatParticipant(conversation: string, contact: ChatContact): Promise<void> {
		await FilenSdkBridgeModule.removeChatParticipant(JSON.stringify({ conversation, contact }))
	}

	public async fetchChatMessages(conversation: string, timestamp?: number): Promise<ChatMessageDto[]> {
		const result = await FilenSdkBridgeModule.fetchChatMessages(conversation, timestamp ?? 0)
		return JSON.parse(result) as ChatMessageDto[]
	}

	public async fetchChatsLastFocus(): Promise<ChatLastFocusEntry[]> {
		const result = await FilenSdkBridgeModule.fetchChatsLastFocus()
		return JSON.parse(result) as ChatLastFocusEntry[]
	}

	public async updateChatsLastFocus(conversations: string[]): Promise<void> {
		await FilenSdkBridgeModule.updateChatsLastFocus(JSON.stringify({ conversations }))
	}

	public async muteChat(conversation: string, mute: boolean): Promise<void> {
		await FilenSdkBridgeModule.muteChat(conversation, mute)
	}

	public async decryptChatMessage(conversation: string, message: string): Promise<string> {
		const result = await FilenSdkBridgeModule.decryptChatMessage(conversation, message)
		return JSON.parse(result) as string
	}

	// ── Notes ───────────────────────────────────────────────────────

	public async fetchNotes(): Promise<NoteDto[]> {
		const result = await FilenSdkBridgeModule.fetchNotes()
		return JSON.parse(result) as NoteDto[]
	}

	public async fetchNoteContent(uuid: string): Promise<NoteContentResponse> {
		const result = await FilenSdkBridgeModule.fetchNoteContent(uuid)
		return JSON.parse(result) as NoteContentResponse
	}

	public async createNote(title?: string): Promise<NoteDto> {
		const result = await FilenSdkBridgeModule.createNote(title)
		return JSON.parse(result) as NoteDto
	}

	public async deleteNote(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteNote(uuid)
	}

	public async archiveNote(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.archiveNote(uuid)
	}

	public async trashNote(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.trashNote(uuid)
	}

	public async restoreNote(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.restoreNote(uuid)
	}

	public async duplicateNote(uuid: string): Promise<NoteDto> {
		const result = await FilenSdkBridgeModule.duplicateNote(uuid)
		return JSON.parse(result) as NoteDto
	}

	public async renameNote(uuid: string, title: string): Promise<void> {
		await FilenSdkBridgeModule.renameNote(uuid, title)
	}

	public async editNote(uuid: string, content: string, preview: string): Promise<void> {
		await FilenSdkBridgeModule.editNote(uuid, content, preview)
	}

	public async changeNoteType(uuid: string, newType: string, content?: string): Promise<void> {
		await FilenSdkBridgeModule.changeNoteType(uuid, newType, content)
	}

	public async pinNote(uuid: string, pin: boolean): Promise<void> {
		await FilenSdkBridgeModule.pinNote(uuid, pin)
	}

	public async favoriteNote(uuid: string, favorite: boolean): Promise<void> {
		await FilenSdkBridgeModule.favoriteNote(uuid, favorite)
	}

	public async fetchNoteHistory(uuid: string): Promise<NoteHistoryDto[]> {
		const result = await FilenSdkBridgeModule.fetchNoteHistory(uuid)
		return JSON.parse(result) as NoteHistoryDto[]
	}

	public async restoreNoteHistory(uuid: string, id: number): Promise<void> {
		await FilenSdkBridgeModule.restoreNoteHistory(uuid, id)
	}

	public async addNoteParticipant(uuid: string, contactUuid: string, permissionsWrite: boolean): Promise<void> {
		await FilenSdkBridgeModule.addNoteParticipant(uuid, contactUuid, permissionsWrite)
	}

	public async removeNoteParticipant(uuid: string, userId: number): Promise<void> {
		await FilenSdkBridgeModule.removeNoteParticipant(uuid, userId)
	}

	public async changeNoteParticipantPermissions(uuid: string, userId: number, permissionsWrite: boolean): Promise<void> {
		await FilenSdkBridgeModule.changeNoteParticipantPermissions(uuid, userId, permissionsWrite)
	}

	public async fetchNotesTags(): Promise<NoteTagDto[]> {
		const result = await FilenSdkBridgeModule.fetchNotesTags()
		return JSON.parse(result) as NoteTagDto[]
	}

	public async createNoteTag(name: string): Promise<NoteTagDto> {
		const result = await FilenSdkBridgeModule.createNoteTag(name)
		return JSON.parse(result) as NoteTagDto
	}

	public async deleteNoteTag(uuid: string): Promise<void> {
		await FilenSdkBridgeModule.deleteNoteTag(uuid)
	}

	public async renameNoteTag(uuid: string, name: string): Promise<void> {
		await FilenSdkBridgeModule.renameNoteTag(uuid, name)
	}

	public async favoriteNoteTag(uuid: string, favorite: boolean): Promise<void> {
		await FilenSdkBridgeModule.favoriteNoteTag(uuid, favorite)
	}

	public async tagNote(uuid: string, tag: string): Promise<void> {
		await FilenSdkBridgeModule.tagNote(uuid, tag)
	}

	public async untagNote(uuid: string, tag: string): Promise<void> {
		await FilenSdkBridgeModule.untagNote(uuid, tag)
	}

	// ── User ────────────────────────────────────────────────────────

	public async enableTwoFactorAuthentication(twoFactorCode?: string): Promise<EnableTwoFaResponse> {
		const result = await FilenSdkBridgeModule.enableTwoFactorAuthentication(twoFactorCode)
		return JSON.parse(result) as EnableTwoFaResponse
	}

	public async disableTwoFactorAuthentication(twoFactorCode?: string): Promise<void> {
		await FilenSdkBridgeModule.disableTwoFactorAuthentication(twoFactorCode)
	}

	public async deleteAccount(twoFactorCode?: string): Promise<void> {
		await FilenSdkBridgeModule.deleteAccount(twoFactorCode)
	}

	public async fetchUserPublicKey(email: string): Promise<string> {
		const result = await FilenSdkBridgeModule.fetchUserPublicKey(email)
		return JSON.parse(result) as string
	}

	public async didExportMasterKeys(): Promise<void> {
		await FilenSdkBridgeModule.didExportMasterKeys()
	}

	public async fetchAccount(): Promise<AccountResponse> {
		const result = await FilenSdkBridgeModule.fetchAccount()
		return JSON.parse(result) as AccountResponse
	}

	public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
		await FilenSdkBridgeModule.changePassword(currentPassword, newPassword)
	}

	public async updatePersonalInformation(params: Record<string, unknown>): Promise<void> {
		await FilenSdkBridgeModule.updatePersonalInformation(JSON.stringify(params))
	}

	public async updateNickname(params: Record<string, unknown>): Promise<void> {
		await FilenSdkBridgeModule.updateNickname(JSON.stringify(params))
	}

	public async changeEmail(params: Record<string, unknown>): Promise<void> {
		await FilenSdkBridgeModule.changeEmail(JSON.stringify(params))
	}

	public async fetchGDPR(): Promise<unknown> {
		const result = await FilenSdkBridgeModule.fetchGDPR()
		return JSON.parse(result)
	}

	public async toggleVersioning(enable: boolean): Promise<void> {
		await FilenSdkBridgeModule.toggleVersioning(enable)
	}

	public async toggleLoginAlerts(enable: boolean): Promise<void> {
		await FilenSdkBridgeModule.toggleLoginAlerts(enable)
	}

	public async deleteAllVersionedFiles(): Promise<void> {
		await FilenSdkBridgeModule.deleteAllVersionedFiles()
	}

	public async deleteEverything(): Promise<void> {
		await FilenSdkBridgeModule.deleteEverything()
	}

	public async fetchEvents(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.fetchEvents(JSON.stringify(params))
		return JSON.parse(result)
	}

	public async fetchEvent(params: Record<string, unknown>): Promise<unknown> {
		const result = await FilenSdkBridgeModule.fetchEvent(JSON.stringify(params))
		return JSON.parse(result)
	}

	public async uploadAvatar(uri: string): Promise<void> {
		await FilenSdkBridgeModule.uploadAvatar(uri)
	}

	// ── FS ──────────────────────────────────────────────────────────

	public async readFileAsString(path: string): Promise<string> {
		return await FilenSdkBridgeModule.readFileAsString(path)
	}

	public async writeFileAsString(path: string, content: string): Promise<void> {
		await FilenSdkBridgeModule.writeFileAsString(path, content)
	}

	// ── Transfers ───────────────────────────────────────────────────

	public async uploadFile(params: UploadFileParams): Promise<BridgeCloudItem> {
		const result = await FilenSdkBridgeModule.uploadFile(JSON.stringify(params))
		return JSON.parse(result) as BridgeCloudItem
	}

	public async downloadFile(params: DownloadFileParams): Promise<void> {
		await FilenSdkBridgeModule.downloadFile(JSON.stringify(params))
	}

	public async uploadDirectory(params: UploadDirectoryParams): Promise<void> {
		await FilenSdkBridgeModule.uploadDirectory(JSON.stringify(params))
	}

	public async downloadDirectory(params: DownloadDirectoryParams): Promise<void> {
		await FilenSdkBridgeModule.downloadDirectory(JSON.stringify(params))
	}

	public async transferAction(id: string, action: string): Promise<string> {
		return await FilenSdkBridgeModule.transferAction(id, action)
	}

	public async fetchTransfers(): Promise<FetchTransfersResult> {
		const result = await FilenSdkBridgeModule.fetchTransfers()
		return JSON.parse(result) as FetchTransfersResult
	}

	// ── HTTP Server ─────────────────────────────────────────────────

	public async startHttpServer(): Promise<HttpServerInfo> {
		const result = await FilenSdkBridgeModule.startHttpServer()
		return JSON.parse(result) as HttpServerInfo
	}

	public async stopHttpServer(): Promise<void> {
		await FilenSdkBridgeModule.stopHttpServer()
	}

	public async restartHTTPServer(): Promise<HttpServerInfo> {
		const result = await FilenSdkBridgeModule.restartHTTPServer()
		const info = JSON.parse(result) as HttpServerInfo

		this._httpServerPort = info.port
		this._httpAuthToken = info.authToken

		return info
	}

	public async httpStatus(): Promise<HttpStatusInfo> {
		const result = await FilenSdkBridgeModule.httpStatus()
		return JSON.parse(result) as HttpStatusInfo
	}

	// ── HTTP Server lifecycle helpers ───────────────────────────────

	/**
	 * Build a streaming URL for file playback using the Rust HTTP server.
	 */
	public buildStreamURL(file: {
		mime: string
		size: number
		uuid: string
		bucket: string
		key: string
		version: number
		chunks: number
		region: string
	}): string | null {
		if (
			!this._httpServerPort ||
			!this._httpAuthToken ||
			this._httpAuthToken.length === 0 ||
			this._httpServerPort <= 0
		) {
			return null
		}

		return `http://127.0.0.1:${this._httpServerPort}/stream?auth=${this._httpAuthToken}&file=${encodeURIComponent(
			btoa(
				JSON.stringify({
					mime: file.mime,
					size: file.size,
					uuid: file.uuid,
					bucket: file.bucket,
					key: file.key,
					version: file.version,
					chunks: file.chunks,
					region: file.region
				})
			)
		)}`
	}

	/**
	 * Check if the Rust HTTP server is alive via /ping.
	 */
	public async httpServerAlive(): Promise<boolean> {
		if (
			!this._httpServerPort ||
			!this._httpAuthToken ||
			this._httpAuthToken.length === 0 ||
			this._httpServerPort <= 0
		) {
			return false
		}

		return await httpHealthCheck({
			url: `http://127.0.0.1:${this._httpServerPort}/ping`,
			method: "GET",
			expectedStatusCode: 200,
			timeout: 3000,
			headers: {
				Authorization: `Bearer ${this._httpAuthToken}`
			}
		})
	}

	/**
	 * Start the Rust SDK bridge and HTTP server.
	 */
	public async start(): Promise<void> {
		try {
			const info = await this.startHttpServer()

			this._httpServerPort = info.port
			this._httpAuthToken = info.authToken
		} catch (e) {
			console.error("[FilenBridge] Failed to start HTTP server:", e)
		}
	}

	/**
	 * Stop the Rust HTTP server.
	 */
	public async stop(): Promise<void> {
		try {
			await this.stopHttpServer()
		} catch (e) {
			console.error("[FilenBridge] Failed to stop HTTP server:", e)
		}

		this._httpServerPort = null
		this._httpAuthToken = null
	}

	public get ready(): boolean {
		return true
	}

	public get httpServerPort(): number | null {
		return this._httpServerPort
	}

	public set httpServerPort(port: number | null) {
		this._httpServerPort = port
	}

	public get httpAuthToken(): string | null {
		return this._httpAuthToken
	}

	public set httpAuthToken(token: string | null) {
		this._httpAuthToken = token
	}

	public async updateTransfers(): Promise<void> {
		const data = await this.fetchTransfers()

		const store = useTransfersStore.getState()

		store.setTransfers(data.transfers)
		store.setFinishedTransfers(data.finishedTransfers)
		store.setSpeed(data.speed)
		store.setRemaining(data.remaining)
		store.setProgress(data.progress)
	}
}

async function httpHealthCheck({
	url,
	method = "GET",
	expectedStatusCode = 200,
	timeout = 5000,
	headers
}: {
	url: string
	expectedStatusCode?: number
	method?: "GET" | "POST" | "HEAD"
	timeout?: number
	headers?: Record<string, string>
}): Promise<boolean> {
	const abortController = new AbortController()

	const timeouter = setTimeout(() => {
		abortController.abort()
	}, timeout)

	try {
		const response = await axios({
			url,
			timeout,
			method,
			headers,
			signal: abortController.signal,
			validateStatus: status => (!expectedStatusCode ? true : expectedStatusCode === status)
		})

		clearTimeout(timeouter)

		return response.status === expectedStatusCode
	} catch {
		clearTimeout(timeouter)

		return false
	}
}

export type { FilenSdkBridgeModuleType }

export const filenBridge = new FilenBridge()

export default filenBridge
