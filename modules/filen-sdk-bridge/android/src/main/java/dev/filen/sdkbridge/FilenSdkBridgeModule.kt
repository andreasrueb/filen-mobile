package dev.filen.sdkbridge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.filen_mobile_sdk_bridge.FilenMobileSdkBridge

class FilenSdkBridgeModule : Module() {
    private var bridge: FilenMobileSdkBridge? = null

    override fun definition() = ModuleDefinition {
        Name("FilenSdkBridge")

        Function("initialize") {
            if (bridge == null) {
                bridge = FilenMobileSdkBridge()
            }
        }

        // -- Auth --

        AsyncFunction("login") { paramsJson: String ->
            getBridge().login(paramsJson)
        }

        AsyncFunction("register") { paramsJson: String ->
            getBridge().register(paramsJson)
        }

        AsyncFunction("reinitSDK") { paramsJson: String ->
            getBridge().reinitSdk(paramsJson)
        }

        AsyncFunction("resendConfirmation") { paramsJson: String ->
            getBridge().resendConfirmation(paramsJson)
        }

        AsyncFunction("forgotPassword") { paramsJson: String ->
            getBridge().forgotPassword(paramsJson)
        }

        // -- Cloud: Directory operations --

        AsyncFunction("createDirectory") { paramsJson: String ->
            getBridge().createDirectory(paramsJson)
        }

        AsyncFunction("getDirectory") { paramsJson: String ->
            getBridge().getDirectory(paramsJson)
        }

        AsyncFunction("deleteDirectory") { paramsJson: String ->
            getBridge().deleteDirectory(paramsJson)
        }

        AsyncFunction("trashDirectory") { paramsJson: String ->
            getBridge().trashDirectory(paramsJson)
        }

        AsyncFunction("restoreDirectory") { paramsJson: String ->
            getBridge().restoreDirectory(paramsJson)
        }

        AsyncFunction("directoryExists") { paramsJson: String ->
            getBridge().directoryExists(paramsJson)
        }

        AsyncFunction("renameDirectory") { paramsJson: String ->
            getBridge().renameDirectory(paramsJson)
        }

        AsyncFunction("moveDirectory") { paramsJson: String ->
            getBridge().moveDirectory(paramsJson)
        }

        AsyncFunction("changeDirectoryColor") { paramsJson: String ->
            getBridge().changeDirectoryColor(paramsJson)
        }

        AsyncFunction("favoriteDirectory") { paramsJson: String ->
            getBridge().favoriteDirectory(paramsJson)
        }

        AsyncFunction("editDirectoryMetadata") { paramsJson: String ->
            getBridge().editDirectoryMetadata(paramsJson)
        }

        AsyncFunction("fetchDirectorySize") { paramsJson: String ->
            getBridge().fetchDirectorySize(paramsJson)
        }

        AsyncFunction("getDirectoryTree") { paramsJson: String ->
            getBridge().getDirectoryTree(paramsJson)
        }

        AsyncFunction("directoryUUIDToPath") { paramsJson: String ->
            getBridge().directoryUuidToPath(paramsJson)
        }

        AsyncFunction("directoryPublicLinkStatus") { paramsJson: String ->
            getBridge().directoryPublicLinkStatus(paramsJson)
        }

        // -- Cloud: File operations --

        AsyncFunction("getFile") { paramsJson: String ->
            getBridge().getFile(paramsJson)
        }

        AsyncFunction("deleteFile") { paramsJson: String ->
            getBridge().deleteFile(paramsJson)
        }

        AsyncFunction("trashFile") { paramsJson: String ->
            getBridge().trashFile(paramsJson)
        }

        AsyncFunction("restoreFile") { paramsJson: String ->
            getBridge().restoreFile(paramsJson)
        }

        AsyncFunction("fileExists") { paramsJson: String ->
            getBridge().fileExists(paramsJson)
        }

        AsyncFunction("renameFile") { paramsJson: String ->
            getBridge().renameFile(paramsJson)
        }

        AsyncFunction("moveFile") { paramsJson: String ->
            getBridge().moveFile(paramsJson)
        }

        AsyncFunction("favoriteFile") { paramsJson: String ->
            getBridge().favoriteFile(paramsJson)
        }

        AsyncFunction("editFileMetadata") { paramsJson: String ->
            getBridge().editFileMetadata(paramsJson)
        }

        AsyncFunction("fileUUIDToPath") { paramsJson: String ->
            getBridge().fileUuidToPath(paramsJson)
        }

        AsyncFunction("filePublicLinkStatus") { paramsJson: String ->
            getBridge().filePublicLinkStatus(paramsJson)
        }

        // -- Cloud: Listing & search --

        AsyncFunction("fetchCloudItems") { paramsJson: String ->
            getBridge().fetchCloudItems(paramsJson)
        }

        AsyncFunction("queryGlobalSearch") { paramsJson: String ->
            getBridge().queryGlobalSearch(paramsJson)
        }

        // -- Cloud: Public links --

        AsyncFunction("toggleItemPublicLink") { paramsJson: String ->
            getBridge().toggleItemPublicLink(paramsJson)
        }

        // -- Cloud: Sharing --

        AsyncFunction("stopSharingItem") { paramsJson: String ->
            getBridge().stopSharingItem(paramsJson)
        }

        AsyncFunction("removeSharedItem") { paramsJson: String ->
            getBridge().removeSharedItem(paramsJson)
        }
    }

    private fun getBridge(): FilenMobileSdkBridge {
        return bridge ?: throw IllegalStateException("FilenSdkBridge not initialized. Call initialize() first.")
    }
}
