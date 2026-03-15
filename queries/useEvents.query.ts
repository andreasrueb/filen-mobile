import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query"
import { DEFAULT_QUERY_OPTIONS, useDefaultQueryParams } from "./client"
import filenBridge from "@/lib/filenBridge"
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus"
import { sortParams } from "@/lib/utils"
import type { UserEvent } from "@filen/sdk/dist/types/api/v3/user/events"

export const BASE_QUERY_KEY = "useEventsQuery"

export type UseEventsQueryParams = {
	timestamp?: number
	filter: "all"
}

export async function fetchData(params: UseEventsQueryParams): Promise<UserEvent[]> {
	return await filenBridge.proxy("fetchEvents", params)
}

export function useEventsQuery(
	params: UseEventsQueryParams,
	options?: Omit<UseQueryOptions, "queryKey" | "queryFn">
): UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error> {
	const sortedParams = sortParams(params)
	const defaultParams = useDefaultQueryParams(options)

	const query = useQuery({
		...DEFAULT_QUERY_OPTIONS,
		...defaultParams,
		...options,
		staleTime: 5000,
		queryKey: [BASE_QUERY_KEY, sortedParams],
		queryFn: () => fetchData(sortedParams)
	})

	useRefreshOnFocus({
		isEnabled: query.isEnabled,
		refetch: query.refetch
	})

	return query as UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error>
}

export default useEventsQuery
