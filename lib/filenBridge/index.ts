import FilenSdkBridgeModule from "../../modules/filen-sdk-bridge"
import nodeWorker from "@/lib/nodeWorker"
import type { NodeWorkerHandlers } from "nodeWorker"
import { useTransfersStore } from "@/stores/transfers.store"
import { httpHealthCheck } from "@/lib/nodeWorker/utils"

/**
 * Set of handler functions that have been migrated to the Rust SDK bridge.
 * These will be routed to the Expo Module instead of the Node worker.
 */
const MIGRATED_FUNCTIONS = new Set<keyof NodeWorkerHandlers>([
	// Auth (Phase 0)
	"login",
	"register",
	"reinitSDK",
	"resendConfirmation",
	"forgotPassword",
	// Cloud: Directory operations (Phase 1)
	"createDirectory",
	"getDirectory",
	"deleteDirectory",
	"trashDirectory",
	"restoreDirectory",
	"directoryExists",
	"renameDirectory",
	"moveDirectory",
	"changeDirectoryColor",
	"favoriteDirectory",
	"editDirectoryMetadata",
	"fetchDirectorySize",
	"getDirectoryTree",
	"directoryUUIDToPath",
	"directoryPublicLinkStatus",
	// Cloud: File operations (Phase 1)
	"getFile",
	"deleteFile",
	"trashFile",
	"restoreFile",
	"fileExists",
	"renameFile",
	"moveFile",
	"favoriteFile",
	"editFileMetadata",
	"fileUUIDToPath",
	"filePublicLinkStatus",
	// Cloud: Listing & search (Phase 1 — partial)
	"fetchCloudItems",
	"queryGlobalSearch",
	// Cloud: Public links (Phase 1)
	"toggleItemPublicLink",
	// Cloud: Sharing (Phase 1)
	"stopSharingItem",
	"removeSharedItem",
	// Contacts (Phase 2a)
	"fetchContacts",
	"fetchIncomingContactRequests",
	"fetchOutgoingContactRequests",
	"acceptContactRequest",
	"denyContactRequest",
	"sendContactRequest",
	"removeContact",
	"blockContact",
	"unblockContact",
	"deleteOutgoingContactRequest",
	// Chats (Phase 2b)
	"fetchChats",
	"createChat",
	"deleteChat",
	"leaveChat",
	"sendChatMessage",
	"editChatMessage",
	"deleteChatMessage",
	"disableChatMessageEmbeds",
	"editChatName",
	"sendChatTyping",
	"chatMarkAsRead",
	"chatOnline",
	"chatUnread",
	"chatUnreadCount",
	"addChatParticipant",
	"removeChatParticipant",
	"fetchChatMessages",
	"fetchChatsLastFocus",
	"updateChatsLastFocus",
	"muteChat",
	// Crypto (Phase 2b)
	"decryptChatMessage",
	// Notes (Phase 2c)
	"fetchNotes",
	"fetchNoteContent",
	"createNote",
	"deleteNote",
	"archiveNote",
	"trashNote",
	"restoreNote",
	"duplicateNote",
	"renameNote",
	"editNote",
	"changeNoteType",
	"pinNote",
	"favoriteNote",
	"fetchNoteHistory",
	"restoreNoteHistory",
	"addNoteParticipant",
	"removeNoteParticipant",
	"changeNoteParticipantPermissions",
	"fetchNotesTags",
	"createNoteTag",
	"deleteNoteTag",
	"renameNoteTag",
	"favoriteNoteTag",
	"tagNote",
	"untagNote",
	// User (Phase 2d)
	"enableTwoFactorAuthentication",
	"disableTwoFactorAuthentication",
	"deleteAccount",
	"fetchUserPublicKey",
	"didExportMasterKeys",
	"fetchAccount",
	"changePassword",
	// FS (Phase 2d)
	"readFileAsString",
	"writeFileAsString",
	// Transfers (Phase 3)
	"uploadFile",
	"downloadFile",
	"uploadDirectory",
	"downloadDirectory",
	"transferAction",
	"fetchTransfers",
	// HTTP Server (Phase 4)
	"restartHTTPServer"
])

/**
 * fetchCloudItems types that are NOT yet supported by the Rust bridge.
 * These will fall through to the Node worker.
 */
const FETCH_CLOUD_ITEMS_NODE_FALLBACK_TYPES = new Set([
	"sharedOut",
	"offline"
])

export class FilenBridge {
	private initialized: boolean = false
	private _httpServerPort: number | null = null
	private _httpAuthToken: string | null = null

	public initialize(): void {
		if (!this.initialized) {
			FilenSdkBridgeModule.initialize()
			this.initialized = true
		}
	}

	/**
	 * Route a function call to either the Rust SDK bridge (for migrated functions)
	 * or the Node worker (for everything else).
	 */
	public async proxy<T extends keyof NodeWorkerHandlers>(
		functionName: T,
		params: Parameters<NodeWorkerHandlers[T]>[0]
	): Promise<Awaited<ReturnType<NodeWorkerHandlers[T]>>> {
		// reinitSDK must go to BOTH Rust bridge and Node worker,
		// since some call sites still use nodeWorker.proxy() directly.
		if (functionName === "reinitSDK") {
			this.initialize()

			const paramsJson = JSON.stringify(params ?? {})

			const [result] = await Promise.all([
				FilenSdkBridgeModule.reinitSDK(paramsJson),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				nodeWorker.proxy("reinitSDK", params as any)
			])

			return result as Awaited<ReturnType<NodeWorkerHandlers[T]>>
		}

		// restartHTTPServer routes to the Rust HTTP server
		if (functionName === "restartHTTPServer") {
			this.initialize()

			const resultJson = await FilenSdkBridgeModule.restartHTTPServer(JSON.stringify({}))
			const info = JSON.parse(resultJson) as { port: number; authToken: string }

			this._httpServerPort = info.port
			this._httpAuthToken = info.authToken

			return info as Awaited<ReturnType<NodeWorkerHandlers[T]>>
		}

		// Special handling for fetchCloudItems — some types need Node fallback
		if (functionName === "fetchCloudItems" && params && typeof params === "object" && "of" in params) {
			const ofType = (params as { of: string }).of

			if (FETCH_CLOUD_ITEMS_NODE_FALLBACK_TYPES.has(ofType)) {
				return nodeWorker.proxy(functionName, params)
			}
		}

		if (MIGRATED_FUNCTIONS.has(functionName)) {
			this.initialize()

			const paramsJson = JSON.stringify(params ?? {})
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const nativeModule = FilenSdkBridgeModule as any

			if (typeof nativeModule[functionName] !== "function") {
				throw new Error(`[FilenBridge] No native function for ${functionName}`)
			}

			const result = await nativeModule[functionName](paramsJson)

			// For functions that return JSON, parse the result
			if (typeof result === "string" && result.length > 0) {
				try {
					return JSON.parse(result)
				} catch {
					return result as Awaited<ReturnType<NodeWorkerHandlers[T]>>
				}
			}

			return result as Awaited<ReturnType<NodeWorkerHandlers[T]>>
		}

		// Fall back to Node worker for non-migrated functions
		return nodeWorker.proxy(functionName, params)
	}

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
	 * Start the Node worker (still needed for non-migrated functions)
	 * and the Rust HTTP server.
	 */
	public async start(): Promise<void> {
		await nodeWorker.start()

		this.initialize()

		try {
			const resultJson = await FilenSdkBridgeModule.startHttpServer(JSON.stringify({}))
			const info = JSON.parse(resultJson) as { port: number; authToken: string }

			this._httpServerPort = info.port
			this._httpAuthToken = info.authToken
		} catch (e) {
			console.error("[FilenBridge] Failed to start HTTP server:", e)
		}
	}

	/**
	 * Stop the Node worker and the Rust HTTP server.
	 */
	public async stop(): Promise<void> {
		try {
			await FilenSdkBridgeModule.stopHttpServer(JSON.stringify({}))
		} catch (e) {
			console.error("[FilenBridge] Failed to stop HTTP server:", e)
		}

		this._httpServerPort = null
		this._httpAuthToken = null

		await nodeWorker.stop()
	}

	public get ready(): boolean {
		return nodeWorker.ready
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
		this.initialize()

		const resultJson = await FilenSdkBridgeModule.fetchTransfers(JSON.stringify({}))
		const data = JSON.parse(resultJson) as {
			transfers: Transfer[]
			finishedTransfers: Transfer[]
			speed: number
			remaining: number
			progress: number
		}

		const store = useTransfersStore.getState()

		store.setTransfers(data.transfers)
		store.setFinishedTransfers(data.finishedTransfers)
		store.setSpeed(data.speed)
		store.setRemaining(data.remaining)
		store.setProgress(data.progress)
	}
}

export const filenBridge = new FilenBridge()

export default filenBridge
