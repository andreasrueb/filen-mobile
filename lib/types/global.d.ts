type SerializedError = {
	name: string
	message: string
	stack?: string
	stringified: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

type DriveCloudItem = Prettify<
	| ({
			selected: boolean
			thumbnail?: string
			favorited: boolean
			path?: string
	  } & ({
			isShared: true
	  } & import("@filen/sdk").CloudItemShared))
	| ({
			selected: boolean
			thumbnail?: string
			favorited: boolean
			path?: string
	  } & ({
			isShared: false
	  } & import("@filen/sdk").CloudItem))
>

type FetchCloudItemsParams = {
	of: "drive" | "favorites" | "recents" | "sharedIn" | "sharedOut" | "trash" | "links" | "photos" | "none" | "offline"
	parent: string
	receiverId: number
}

type FetchDirectorySizeResult = {
	size: number
	folders: number
	files: number
}

type TransferState = "started" | "queued" | "finished" | "error" | "stopped" | "paused"

type Transfer = {
	id: string
	type: "upload" | "download"
	itemType: "file" | "directory"
	uuid: string
	state: TransferState
	bytes: number
	name: string
	size: number
	startedTimestamp: number
	finishedTimestamp: number
	queuedTimestamp: number
	errorTimestamp: number
	progressTimestamp: number
}

type TransfersStore = {
	transfers: Transfer[]
	finishedTransfers: Transfer[]
	setTransfers: (fn: Transfer[] | ((prev: Transfer[]) => Transfer[])) => void
	setFinishedTransfers: (fn: Transfer[] | ((prev: Transfer[]) => Transfer[])) => void
}
