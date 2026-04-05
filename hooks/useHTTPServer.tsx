import filenBridge from "@/lib/filenBridge"
import { useEffect, useState, useCallback, useRef } from "react"
import { AppState } from "react-native"

export default function useHTTPServer() {
	const [info, setInfo] = useState<{
		httpServerPort: number | null
		httpAuthToken: string | null
		ready: boolean
	}>({
		httpServerPort: filenBridge.httpServerPort,
		httpAuthToken: filenBridge.httpAuthToken,
		ready: filenBridge.ready
	})
	const prev = useRef<string>(`${filenBridge.httpServerPort}:${filenBridge.httpAuthToken}:${filenBridge.ready}`)

	const buildStreamURL = useCallback(
		(file: {
			mime: string
			size: number
			uuid: string
			bucket: string
			key: string
			version: number
			chunks: number
			region: string
		}) => {
			if (!info.httpServerPort || !info.httpAuthToken || !info.ready || info.httpAuthToken.length === 0 || info.httpServerPort <= 0) {
				return null
			}

			return `http://127.0.0.1:${info.httpServerPort}/stream?auth=${info.httpAuthToken}&file=${encodeURIComponent(
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
		},
		[info]
	)

	useEffect(() => {
		// Poll until the HTTP server is ready (port + token available).
		// This handles the case where the hook mounts before filenBridge.start() completes.
		const interval = setInterval(() => {
			const key = `${filenBridge.httpServerPort}:${filenBridge.httpAuthToken}:${filenBridge.ready}`

			if (prev.current === key) {
				return
			}

			prev.current = key

			setInfo({
				httpServerPort: filenBridge.httpServerPort,
				httpAuthToken: filenBridge.httpAuthToken,
				ready: filenBridge.ready
			})
		}, 500)

		const appStateListener = AppState.addEventListener("change", nextAppState => {
			if (nextAppState !== "active") {
				return
			}

			setTimeout(() => {
				const key = `${filenBridge.httpServerPort}:${filenBridge.httpAuthToken}:${filenBridge.ready}`

				if (prev.current === key) {
					return
				}

				prev.current = key

				setInfo({
					httpServerPort: filenBridge.httpServerPort,
					httpAuthToken: filenBridge.httpAuthToken,
					ready: filenBridge.ready
				})
			}, 3000)
		})

		return () => {
			clearInterval(interval)
			appStateListener.remove()
		}
	}, [])

	return {
		buildStreamURL,
		port: info.httpServerPort,
		authToken: info.httpAuthToken
	}
}
