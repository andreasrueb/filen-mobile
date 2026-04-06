import { useColorScheme as useRNColorScheme } from "react-native"
import { useUniwind, Uniwind } from "uniwind"
import { useCallback, useMemo } from "react"
import { COLORS } from "@/theme/colors"

export function useColorScheme() {
	const { theme } = useUniwind()
	const systemColorScheme = useRNColorScheme()

	const colorScheme = useMemo(() => {
		if (theme === "light" || theme === "dark") {
			return theme
		}

		return systemColorScheme ?? "light"
	}, [theme, systemColorScheme])

	const setColorScheme = useCallback((scheme: "light" | "dark") => {
		Uniwind.setTheme(scheme)
	}, [])

	const toggleColorScheme = useCallback(() => {
		return setColorScheme(colorScheme === "light" ? "dark" : "light")
	}, [colorScheme, setColorScheme])

	return {
		colorScheme,
		isDarkColorScheme: colorScheme === "dark",
		setColorScheme,
		toggleColorScheme,
		colors: COLORS[colorScheme]
	}
}
