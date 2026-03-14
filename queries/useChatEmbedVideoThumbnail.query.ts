import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query"
import { DEFAULT_QUERY_OPTIONS, useDefaultQueryParams, DEFAULT_QUERY_OPTIONS_ETERNAL } from "./client"
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus"
import { createVideoPlayer } from "expo-video"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import * as FileSystem from "expo-file-system"
import { xxHash32 } from "js-xxhash"
import nodeWorker from "@/lib/nodeWorker"
import pathModule from "path"
import { sortParams } from "@/lib/utils"

export const BASE_QUERY_KEY = "useChatEmbedVideoThumbnailQuery"

export type UseChatEmbedVideoThumbnailQueryParams = {
	source: string
	link: string
	name: string
}

export async function fetchData(params: UseChatEmbedVideoThumbnailQueryParams) {
	const destination = new FileSystem.File(
		pathModule.posix.join(
			FileSystem.Paths.cache.uri,
			`chat-embed-video-thumbnail-${xxHash32(`${params.source}:${params.link}`).toString(16)}${pathModule.posix.extname(params.name)}`
		)
	)

	if (!destination.exists) {
		const nodeWorkerHTTPServerAlive = await nodeWorker.httpServerAlive()

		if (!nodeWorkerHTTPServerAlive) {
			throw new Error("Node worker HTTP server is not alive.")
		}

		const player = createVideoPlayer(params.source)

		try {
			const thumbnails = await player.generateThumbnailsAsync([0.5])
			const videoThumbnail = thumbnails[0]

			if (!videoThumbnail) {
				throw new Error("Failed to generate video thumbnail.")
			}

			const manipulated = await ImageManipulator.manipulate(videoThumbnail).renderAsync()

			const result = await manipulated.saveAsync({
				compress: 0.7,
				format: SaveFormat.PNG,
				base64: false
			})

			const resultFile = new FileSystem.File(result.uri)

			if (!resultFile.exists) {
				throw new Error("Failed to save video thumbnail.")
			}

			resultFile.move(destination)

			if (!destination.exists) {
				throw new Error(`Generated thumbnail at ${destination.uri} does not exist.`)
			}
		} finally {
			player.release()
		}
	}

	return destination.uri
}

export function useChatEmbedVideoThumbnailQuery(
	params: UseChatEmbedVideoThumbnailQueryParams,
	options?: Omit<UseQueryOptions, "queryKey" | "queryFn">
): UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error> {
	const sortedParams = sortParams(params)
	const defaultParams = useDefaultQueryParams(options)

	const query = useQuery({
		...DEFAULT_QUERY_OPTIONS,
		...defaultParams,
		...DEFAULT_QUERY_OPTIONS_ETERNAL,
		throwOnError: err => {
			console.error(err)

			return false
		},
		...options,
		queryKey: [BASE_QUERY_KEY, sortedParams],
		queryFn: () => fetchData(sortedParams)
	})

	useRefreshOnFocus({
		isEnabled: query.isEnabled,
		refetch: query.refetch
	})

	return query as UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error>
}

export default useChatEmbedVideoThumbnailQuery
