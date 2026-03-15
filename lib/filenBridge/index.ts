import FilenSdkBridgeModule from "../../modules/filen-sdk-bridge"
import nodeWorker from "@/lib/nodeWorker"
import type { NodeWorkerHandlers } from "nodeWorker"

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
	"removeSharedItem"
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
	 * Delegate to the Node worker for HTTP streaming (until Phase 4 replaces it).
	 */
	public buildStreamURL(file: Parameters<typeof nodeWorker.buildStreamURL>[0]): string | null {
		return nodeWorker.buildStreamURL(file)
	}

	/**
	 * Delegate to the Node worker for HTTP server health check.
	 */
	public async httpServerAlive(): Promise<boolean> {
		return nodeWorker.httpServerAlive()
	}

	/**
	 * Start the Node worker (still needed for non-migrated functions).
	 */
	public async start(): Promise<void> {
		await nodeWorker.start()
	}

	/**
	 * Stop the Node worker.
	 */
	public async stop(): Promise<void> {
		await nodeWorker.stop()
	}

	public get ready(): boolean {
		return nodeWorker.ready
	}

	public get httpServerPort(): number | null {
		return nodeWorker.httpServerPort
	}

	public get httpAuthToken(): string | null {
		return nodeWorker.httpAuthToken
	}

	public async updateTransfers(): Promise<void> {
		return nodeWorker.updateTransfers()
	}
}

export const filenBridge = new FilenBridge()

export default filenBridge
