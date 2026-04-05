import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query"
import { DEFAULT_QUERY_OPTIONS, useDefaultQueryParams } from "./client"
import filenBridge from "@/lib/filenBridge"
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus"
import { sortParams } from "@/lib/utils"
import type { FileVersionsResponse } from "@filen/sdk/dist/types/api/v3/file/versions"

export const BASE_QUERY_KEY = "useFileVersionsQuery"

export type UseFileVersionsQueryParams = {
	uuid: string
}

export async function fetchData(params: UseFileVersionsQueryParams): Promise<FileVersionsResponse> {
	return await filenBridge.fetchFileVersions(params)
}

export function useFileVersionsQuery(
	params: UseFileVersionsQueryParams,
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

export default useFileVersionsQuery
