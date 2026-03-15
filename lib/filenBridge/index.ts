import FilenSdkBridgeModule from "../../modules/filen-sdk-bridge"
import nodeWorker from "@/lib/nodeWorker"
import type { NodeWorkerHandlers } from "nodeWorker"

/**
 * Set of handler functions that have been migrated to the Rust SDK bridge.
 * These will be routed to the Expo Module instead of the Node worker.
 */
const MIGRATED_FUNCTIONS = new Set<keyof NodeWorkerHandlers>([
	"login",
	"register",
	"reinitSDK",
	"resendConfirmation",
	"forgotPassword"
])

type MigratedFunctionMap = {
	login: (paramsJson: string) => Promise<string>
	register: (paramsJson: string) => Promise<void>
	reinitSDK: (paramsJson: string) => Promise<void>
	resendConfirmation: (paramsJson: string) => Promise<void>
	forgotPassword: (paramsJson: string) => Promise<void>
}

const BRIDGE_FUNCTION_MAP: Record<string, keyof MigratedFunctionMap> = {
	login: "login",
	register: "register",
	reinitSDK: "reinitSDK",
	resendConfirmation: "resendConfirmation",
	forgotPassword: "forgotPassword"
}

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
		if (MIGRATED_FUNCTIONS.has(functionName)) {
			this.initialize()

			const bridgeFn = BRIDGE_FUNCTION_MAP[functionName]

			if (!bridgeFn) {
				throw new Error(`[FilenBridge] No bridge function mapping for ${functionName}`)
			}

			const paramsJson = JSON.stringify(params ?? {})
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const nativeModule = FilenSdkBridgeModule as any

			const result = await nativeModule[bridgeFn](paramsJson)

			// For functions that return JSON (like login), parse the result
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
