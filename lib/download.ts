import filenBridge from "@/lib/filenBridge"
import * as FileSystem from "expo-file-system"
import paths from "@/lib/paths"
import { randomUUID } from "expo-crypto"
import { useTransfersStore } from "@/stores/transfers.store"
import pathModule from "path"

type DownloadDirectoryParams = {
	id: string
	uuid: string
	destination: string
	name: string
	size: number
}

type DownloadFileParams = {
	id: string
	uuid: string
	bucket: string
	region: string
	chunks: number
	version: number
	key: string
	end?: number
	start?: number
	destination: string
	size: number
	name: string
}

export class Download {
	private readonly setHiddenTransfers = useTransfersStore.getState().setHiddenTransfers

	private isAuthed(): boolean {
		return filenBridge.ready
	}

	public directory = {
		foreground: async (
			params: DownloadDirectoryParams & {
				dontEmitProgress?: boolean
			}
		): Promise<void> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to download files.")
			}

			const destination = new FileSystem.Directory(
				params.destination ?? pathModule.posix.join(paths.temporaryDownloads(), randomUUID())
			)

			if (!destination.parentDirectory.exists) {
				destination.parentDirectory.create({
					intermediates: true
				})
			}

			if (destination.exists) {
				destination.delete()
			}

			if (params.dontEmitProgress) {
				this.setHiddenTransfers(hidden => ({
					...hidden,
					[params.id]: params.id
				}))
			}

			await filenBridge.downloadDirectory({
				id: params.id ?? randomUUID(),
				uuid: params.uuid,
				destination: destination.uri,
				size: params.size,
				name: params.name
			})
		},
		background: async (params: DownloadDirectoryParams): Promise<void> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to download files.")
			}

			const destination = new FileSystem.Directory(
				params.destination ?? pathModule.posix.join(paths.temporaryDownloads(), randomUUID())
			)

			if (!destination.parentDirectory.exists) {
				destination.parentDirectory.create({
					intermediates: true
				})
			}

			if (destination.exists) {
				destination.delete()
			}

			await filenBridge.downloadDirectory({
				id: params.id ?? randomUUID(),
				uuid: params.uuid,
				destination: destination.uri,
				size: params.size,
				name: params.name
			})
		}
	}

	public file = {
		foreground: async (
			params: DownloadFileParams & {
				dontEmitProgress?: boolean
			}
		): Promise<void> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to download files.")
			}

			const destination = new FileSystem.File(
				params.destination ??
					pathModule.posix.join(paths.temporaryDownloads(), `${randomUUID()}${pathModule.posix.extname(params.name)}`)
			)

			if (!destination.parentDirectory.exists) {
				destination.parentDirectory.create({
					intermediates: true
				})
			}

			if (destination.exists) {
				destination.delete()
			}

			if (params.dontEmitProgress) {
				this.setHiddenTransfers(hidden => ({
					...hidden,
					[params.id]: params.id
				}))
			}

			await filenBridge.downloadFile(params)

			if (!destination.exists) {
				throw new Error("File download failed, file does not exist after download.")
			}

			if (destination.size !== params.size) {
				throw new Error("File download failed, file size does not match expected size.")
			}
		},
		background: async (params: DownloadFileParams): Promise<void> => {
			if (!this.isAuthed()) {
				throw new Error("You must be authenticated to download files.")
			}

			const destination = new FileSystem.File(
				params.destination ??
					pathModule.posix.join(paths.temporaryDownloads(), `${randomUUID()}${pathModule.posix.extname(params.name)}`)
			)

			if (!destination.parentDirectory.exists) {
				destination.parentDirectory.create({
					intermediates: true
				})
			}

			if (destination.exists) {
				destination.delete()
			}

			await filenBridge.downloadFile(params)

			if (!destination.exists) {
				throw new Error("File download failed, file does not exist after download.")
			}

			if (destination.size !== params.size) {
				throw new Error("File download failed, file size does not match expected size.")
			}
		}
	}
}

export const download = new Download()

export default download
