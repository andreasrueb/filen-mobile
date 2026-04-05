import { memo, useEffect, useRef, useCallback } from "react"
import useReactQueryRefetchOnAppFocus from "@/hooks/useReactQueryRefetchOnAppFocus"
import { useAppStateStore } from "@/stores/appState.store"
import { AppState, type AppStateStatus } from "react-native"
import { useShallow } from "zustand/shallow"
import filenBridge from "@/lib/filenBridge"
import NetInfo from "@react-native-community/netinfo"

export const Listeners = memo(() => {
	useReactQueryRefetchOnAppFocus()

	const previousAppStateRef = useRef<AppStateStatus>(AppState.currentState)
	const isRefreshingRef = useRef<boolean>(false)
	const setAppState = useAppStateStore(useShallow(state => state.setAppState))

	const refresh = useCallback(async () => {
		if (isRefreshingRef.current) {
			return
		}

		isRefreshingRef.current = true

		try {
			await NetInfo.refresh()

			const alive = await filenBridge.httpServerAlive()

			if (!alive) {
				const httpServerInfo = await filenBridge.proxy("restartHTTPServer", undefined)

				filenBridge.httpAuthToken = httpServerInfo.authToken
				filenBridge.httpServerPort = httpServerInfo.port
			}
		} catch (e) {
			console.error(e)
		} finally {
			isRefreshingRef.current = false
		}
	}, [])

	useEffect(() => {
		const appStateSub = AppState.addEventListener("change", nextAppState => {
			if (previousAppStateRef.current !== nextAppState) {
				previousAppStateRef.current = nextAppState

				setAppState(nextAppState)

				if (nextAppState === "active") {
					refresh()
				}
			}
		})

		return () => {
			appStateSub.remove()
		}
	}, [setAppState, refresh])

	return null
})

Listeners.displayName = "Listeners"

export default Listeners
