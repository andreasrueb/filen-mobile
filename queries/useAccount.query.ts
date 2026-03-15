import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query"
import { DEFAULT_QUERY_OPTIONS, useDefaultQueryParams } from "./client"
import filenBridge from "@/lib/filenBridge"
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus"
import type { UserAccountResponse } from "@filen/sdk/dist/types/api/v3/user/account"
import type { UserSettingsResponse } from "@filen/sdk/dist/types/api/v3/user/settings"

export const BASE_QUERY_KEY = "useAccountQuery"

export async function fetchData(): Promise<{ account: UserAccountResponse; settings: UserSettingsResponse }> {
	return await filenBridge.proxy("fetchAccount", undefined)
}

export function useAccountQuery(
	options?: Omit<UseQueryOptions, "queryKey" | "queryFn">
): UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error> {
	const defaultParams = useDefaultQueryParams(options)

	const query = useQuery({
		...DEFAULT_QUERY_OPTIONS,
		...defaultParams,
		...options,
		queryKey: [BASE_QUERY_KEY],
		queryFn: () => fetchData()
	})

	useRefreshOnFocus({
		isEnabled: query.isEnabled,
		refetch: query.refetch
	})

	return query as UseQueryResult<Awaited<ReturnType<typeof fetchData>>, Error>
}

export default useAccountQuery
