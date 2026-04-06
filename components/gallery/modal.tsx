import { useEffect, memo, useCallback, useMemo, useRef } from "react"
import { BackHandler, View, Pressable, FlatList, Platform, Modal, useWindowDimensions } from "react-native"
import { useGalleryStore, type GalleryItem } from "@/stores/gallery.store"
import { useShallow } from "zustand/shallow"
import { KeyboardController } from "react-native-keyboard-controller"
import { GestureViewer, useGestureViewerEvent, type GestureViewerProps } from "react-native-gesture-image-viewer"
import Image from "./previews/image"
import Video from "./previews/video"
import Audio from "./previews/audio"
import Header from "./header"
import { translateMemoized } from "@/lib/i18n"
import { Text } from "../nativewindui/Text"
import Animated, { FadeOut } from "react-native-reanimated"
import { ActivityIndicator } from "../nativewindui/ActivityIndicator"
import { useColorScheme } from "@/lib/useColorScheme"
import { cn } from "@/lib/cn"
import { PortalHost } from "@rn-primitives/portal"

export const Item = memo(({ item, index }: { item: GalleryItem; index: number }) => {
	const { colors, isDarkColorScheme } = useColorScheme()
	const visible = useGalleryStore(state => state.currentVisibleIndex === index)

	const onPress = useCallback(() => {
		if (item.previewType !== "image") {
			return
		}

		useGalleryStore.getState().setShowHeader(prev => !prev)
	}, [item.previewType])

	const onLongPress = useCallback(() => {
		if (item.previewType !== "image") {
			return
		}

		useGalleryStore.getState().setShowHeader(false)
	}, [item.previewType])

	return (
		<View className="flex-1 flex-row items-center justify-center overflow-hidden">
			<Pressable
				className="flex-1"
				onPress={onPress}
				onLongPress={onLongPress}
			>
				{!visible ? (
					<Animated.View
						exiting={FadeOut}
						className={cn(
							"flex-1 items-center justify-center",
							item.previewType === "image" || item.previewType === "video"
								? isDarkColorScheme
									? "bg-black"
									: "bg-white"
								: "bg-background"
						)}
					>
						<ActivityIndicator
							color={colors.foreground}
							size="small"
						/>
					</Animated.View>
				) : item.previewType === "image" ? (
					<Image item={item} />
				) : item.previewType === "video" ? (
					<Video item={item} />
				) : item.previewType === "audio" ? (
					<Audio item={item} />
				) : (
					<View className="flex-1 flex-row items-center justify-center">
						<Text className="text-white">{translateMemoized("gallery.noPreviewAvailable")}</Text>
					</View>
				)}
			</Pressable>
		</View>
	)
})

Item.displayName = "Item"

export const GalleryModal = memo(() => {
	const visible = useGalleryStore(useShallow(state => state.visible))
	const items = useGalleryStore(useShallow(state => state.items))
	const dimensions = useWindowDimensions()
	const dimensionsRef = useRef(dimensions)
	dimensionsRef.current = dimensions
	const initialIndex = useGalleryStore(useShallow(state => state.initialIndex))
	const currentVisibleIndex = useGalleryStore(useShallow(state => state.currentVisibleIndex))

	const renderItem = useCallback((item: GalleryItem, index: number) => {
		return (
			<Item
				item={item}
				index={index}
			/>
		)
	}, [])

	const keyExtractor = useCallback((item: GalleryItem) => {
		return item.itemType === "cloudItem" ? item.data.item.uuid : item.data.uri
	}, [])

	const validatedInitialScrollIndex = useMemo(() => {
		if (!initialIndex) {
			return undefined
		}

		return items.at(initialIndex) ? initialIndex : undefined
	}, [items, initialIndex])

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: dimensionsRef.current.width,
			offset: dimensionsRef.current.width * index,
			index
		}),
		[]
	)

	const onIndexChange = useCallback((index: number) => {
		useGalleryStore.getState().setCurrentVisibleIndex(index)
	}, [])

	const listProps = useMemo(() => {
		return {
			keyExtractor: keyExtractor as (item: unknown) => string,
			windowSize: 3,
			initialNumToRender: 1,
			updateCellsBatchingPeriod: 100,
			showsVerticalScrollIndicator: false,
			showsHorizontalScrollIndicator: false,
			maxToRenderPerBatch: 1,
			getItemLayout,
			removeClippedSubviews: true,
			initialScrollIndex: validatedInitialScrollIndex
		} satisfies GestureViewerProps<GalleryItem, typeof FlatList>["listProps"]
	}, [keyExtractor, getItemLayout, validatedInitialScrollIndex])

	const onDismiss = useCallback(() => {
		useGalleryStore.getState().reset()
	}, [])

	const onDismissStart = useCallback(() => {
		useGalleryStore.getState().setShowHeader(false)
	}, [])

	useGestureViewerEvent("zoomChange", ({ scale }) => {
		useGalleryStore.getState().setShowHeader(scale <= 1)
	})

	useEffect(() => {
		if (visible && items.length > 0 && KeyboardController.isVisible()) {
			KeyboardController.dismiss().catch(console.error)
		}
	}, [visible, items.length])

	useEffect(() => {
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			if (!visible) {
				return false
			}

			onDismiss()

			return true
		})

		return () => {
			backHandler.remove()
		}
	}, [visible, onDismiss])

	if (!visible) {
		return null
	}

	return (
		<Modal
			visible={true}
			transparent={true}
			animationType="none"
			presentationStyle="overFullScreen"
			onRequestClose={e => {
				e.preventDefault()
				e.stopPropagation()
			}}
			statusBarTranslucent={true}
			navigationBarTranslucent={true}
			allowSwipeDismissal={false}
			supportedOrientations={["portrait", "landscape"]}
			className="flex-1"
		>
			<View className="flex-1">
				<Header />
				<View className="flex-1">
					<GestureViewer
						data={items}
						width={dimensions.width}
						enableLoop={false}
						dismissThreshold={150}
						enableDismissGesture={true}
						enableDoubleTapGesture={items[currentVisibleIndex ?? 0]?.previewType === "image"}
						enableSwipeGesture={true}
						enableZoomGesture={items[currentVisibleIndex ?? 0]?.previewType === "image"}
						enableZoomPanGesture={items[currentVisibleIndex ?? 0]?.previewType === "image"}
						onIndexChange={onIndexChange}
						maxZoomScale={3}
						renderItem={renderItem}
						ListComponent={FlatList}
						initialIndex={validatedInitialScrollIndex}
						listProps={listProps}
						onDismiss={onDismiss}
						onDismissStart={onDismissStart}
					/>
				</View>
				{Platform.OS === "android" && <PortalHost />}
			</View>
		</Modal>
	)
})

GalleryModal.displayName = "GalleryModal"

export default GalleryModal
