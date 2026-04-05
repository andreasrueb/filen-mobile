import FilenSdkBridgeModule, { type FilenSdkBridgeModuleType } from "../../modules/filen-sdk-bridge"
import { useTransfersStore } from "@/stores/transfers.store"
import axios from "axios"

export class FilenBridge {
	private _httpServerPort: number | null = null
	private _httpAuthToken: string | null = null

	/**
	 * Call a handler function on the Rust SDK bridge.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async proxy<T = any>(functionName: string, params?: any): Promise<T> {
		// restartHTTPServer — update local port/token state
		if (functionName === "restartHTTPServer") {
			const resultJson = await FilenSdkBridgeModule.restartHTTPServer(JSON.stringify({}))
			const info = JSON.parse(resultJson) as { port: number; authToken: string }

			this._httpServerPort = info.port
			this._httpAuthToken = info.authToken

			return info as T
		}

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
				return result as T
			}
		}

		return result
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
	 * Start the Rust SDK bridge and HTTP server.
	 */
	public async start(): Promise<void> {
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
	 * Stop the Rust HTTP server.
	 */
	public async stop(): Promise<void> {
		try {
			await FilenSdkBridgeModule.stopHttpServer(JSON.stringify({}))
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
