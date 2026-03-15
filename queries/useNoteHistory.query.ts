import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query"
import { DEFAULT_QUERY_OPTIONS, useDefaultQueryParams } from "./client"
import filenBridge from "@/lib/filenBridge"
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus"
import { sortParams } from "@/lib/utils"
import type { NoteHistory } from "@filen/sdk/dist/types/api/v3/notes/history"

export const BASE_QUERY_KEY = "useNoteHistoryQuery"

export type UseNoteHistoryQueryParams = {
	uuid: string
}

export async function fetchData(params: UseNoteHistoryQueryParams): Promise<NoteHistory[]> {
	return await filenBridge.proxy("fetchNoteHistory", params)
}

export function useNoteHistoryQuery(
	params: UseNoteHistoryQueryParams,
	options?: Omit<UseQueryOptions, "queryKey" | "queryFn">
): UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error> {
	const sortedParams = sortParams(params)
	const defaultParams = useDefaultQueryParams(options)

	const query = useQuery({
		...DEFAULT_QUERY_OPTIONS,
		...defaultParams,
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

export default useNoteHistoryQuery
