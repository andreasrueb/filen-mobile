import { memo } from "react"
import { type SafeAreaViewProps, type Edge } from "react-native-safe-area-context"
import { SafeAreaView } from "@/components/styled"
import { cn } from "@/lib/cn"

export const Container = memo(
	({
		children,
		viewProps,
		className,
		edges = ["left", "right"]
	}: {
		children: React.ReactNode
		viewProps?: SafeAreaViewProps
		className?: string
		edges?: Edge[]
	}) => {
		return (
			<SafeAreaView
				className={cn("flex-1", className)}
				edges={edges}
				{...viewProps}
			>
				{children}
			</SafeAreaView>
		)
	}
)

Container.displayName = "Container"

export default Container
