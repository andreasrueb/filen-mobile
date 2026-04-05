import filenBridge from "@/lib/filenBridge"
import * as FileSystem from "expo-file-system"
import thumbnails from "./thumbnails"
import { normalizeFilePathForExpo } from "./utils"
import { useTransfersStore } from "@/stores/transfers.store"

type UploadDirectoryParams = {
	id: string
	localPath: string
	parent: string
	name: string
	size: number
	deleteAfterUpload?: boolean
	isShared?: boolean
}

type UploadFileParams = {
	id: string
	localPath: string
	parent: string
	name: string
	size: number
	lastModified?: number
	creation?: number
	deleteAfterUpload?: boolean
	uuid?: string
} & (
	| {
			isShared: false
	  }
	| {
			isShared: true
			receiverEmail: string
			receiverId: number
			sharerEmail: string
			sharerId: number
			receivers: DriveCloudItem extends { receivers: infer R } ? R : never
	  }
)

export class Upload {
	private readonly setHiddenTransfers = useTransfersStore.getState().setHiddenTransfers

	private isAuthed(): boolean {
		return filenBridge.ready
	}

	public directory = {
		foreground: async (
			params: UploadDirectoryParams & {
				dontEmitProgress?: boolean
			}
		): Promise<void> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to upload files.")
			}

			const sourceEntry = new FileSystem.Directory(params.localPath)

			if (!sourceEntry.exists) {
				throw new Error(`Source ${params.localPath} does not exist.`)
			}

			if (params.dontEmitProgress) {
				this.setHiddenTransfers(hidden => ({
					...hidden,
					[params.id]: params.id
				}))
			}

			return await filenBridge.uploadDirectory(params)
		},
		background: async (): Promise<void> => {
			throw new Error("Background directory upload is not implemented yet.")
		}
	}

	public file = {
		foreground: async (
			params: UploadFileParams & {
				disableThumbnailGeneration?: boolean
				dontEmitProgress?: boolean
			}
		): Promise<DriveCloudItem> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to upload files.")
			}

			const sourceEntry = new FileSystem.File(params.localPath)

			if (!sourceEntry.exists) {
				throw new Error(`Source ${params.localPath} does not exist.`)
			}

			if (params.dontEmitProgress) {
				this.setHiddenTransfers(hidden => ({
					...hidden,
					[params.id]: params.id
				}))
			}

			const wantsToDeleteAfterUpload = params.deleteAfterUpload ?? false
			const item = (await filenBridge.uploadFile({
				...params,
				deleteAfterUpload: false
			})) as unknown as DriveCloudItem

			if (!params.disableThumbnailGeneration) {
				await thumbnails
					.generate({
						item,
						originalFilePath: normalizeFilePathForExpo(params.localPath)
					})
					.catch(e => {
						console.error("Failed to generate thumbnail for", item.uuid, e)
					})
			}

			if (wantsToDeleteAfterUpload) {
				const file = new FileSystem.File(normalizeFilePathForExpo(params.localPath))

				if (file.exists) {
					file.delete()
				}
			}

			return item
		},
		background: async (
			params: UploadFileParams & {
				disableThumbnailGeneration?: boolean
			}
		): Promise<DriveCloudItem> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to upload files.")
			}

			const sourceFile = new FileSystem.File(params.localPath)

			if (!sourceFile.exists) {
				throw new Error(`Source ${params.localPath} does not exist.`)
			}

			const wantsToDeleteAfterUpload = params.deleteAfterUpload ?? false
			const item = (await filenBridge.uploadFile({
				...params,
				deleteAfterUpload: false
			})) as unknown as DriveCloudItem

			if (!params.disableThumbnailGeneration) {
				await thumbnails
					.generate({
						item,
						originalFilePath: normalizeFilePathForExpo(params.localPath)
					})
					.catch(() => {
						// We don't want to throw an error if thumbnail generation fails
					})
			}

			if (wantsToDeleteAfterUpload) {
				if (sourceFile.exists) {
					sourceFile.delete()
				}
			}

			return item
		}
	}
}

export const upload = new Upload()

export default upload
