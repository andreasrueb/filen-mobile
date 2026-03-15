import ExpoModulesCore

public class FilenSdkBridgeModule: Module {
    private var bridge: FilenMobileSdkBridge?

    public func definition() -> ModuleDefinition {
        Name("FilenSdkBridge")

        Function("initialize") {
            if self.bridge == nil {
                self.bridge = FilenMobileSdkBridge()
            }
        }

        // -- Auth --

        AsyncFunction("login") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.login(paramsJson: paramsJson)
        }

        AsyncFunction("register") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.register(paramsJson: paramsJson)
        }

        AsyncFunction("reinitSDK") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.reinitSdk(paramsJson: paramsJson)
        }

        AsyncFunction("resendConfirmation") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.resendConfirmation(paramsJson: paramsJson)
        }

        AsyncFunction("forgotPassword") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.forgotPassword(paramsJson: paramsJson)
        }

        // -- Cloud: Directory operations --

        AsyncFunction("createDirectory") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.createDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("getDirectory") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.getDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("deleteDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("trashDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.trashDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("restoreDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.restoreDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("directoryExists") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.directoryExists(paramsJson: paramsJson)
        }

        AsyncFunction("renameDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.renameDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("moveDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.moveDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("changeDirectoryColor") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.changeDirectoryColor(paramsJson: paramsJson)
        }

        AsyncFunction("favoriteDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.favoriteDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("editDirectoryMetadata") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.editDirectoryMetadata(paramsJson: paramsJson)
        }

        AsyncFunction("fetchDirectorySize") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchDirectorySize(paramsJson: paramsJson)
        }

        AsyncFunction("getDirectoryTree") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.getDirectoryTree(paramsJson: paramsJson)
        }

        AsyncFunction("directoryUUIDToPath") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.directoryUuidToPath(paramsJson: paramsJson)
        }

        AsyncFunction("directoryPublicLinkStatus") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.directoryPublicLinkStatus(paramsJson: paramsJson)
        }

        // -- Cloud: File operations --

        AsyncFunction("getFile") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.getFile(paramsJson: paramsJson)
        }

        AsyncFunction("deleteFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteFile(paramsJson: paramsJson)
        }

        AsyncFunction("trashFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.trashFile(paramsJson: paramsJson)
        }

        AsyncFunction("restoreFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.restoreFile(paramsJson: paramsJson)
        }

        AsyncFunction("fileExists") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fileExists(paramsJson: paramsJson)
        }

        AsyncFunction("renameFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.renameFile(paramsJson: paramsJson)
        }

        AsyncFunction("moveFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.moveFile(paramsJson: paramsJson)
        }

        AsyncFunction("favoriteFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.favoriteFile(paramsJson: paramsJson)
        }

        AsyncFunction("editFileMetadata") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.editFileMetadata(paramsJson: paramsJson)
        }

        AsyncFunction("fileUUIDToPath") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fileUuidToPath(paramsJson: paramsJson)
        }

        AsyncFunction("filePublicLinkStatus") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.filePublicLinkStatus(paramsJson: paramsJson)
        }

        // -- Cloud: Listing & search --

        AsyncFunction("fetchCloudItems") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchCloudItems(paramsJson: paramsJson)
        }

        AsyncFunction("queryGlobalSearch") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.queryGlobalSearch(paramsJson: paramsJson)
        }

        // -- Cloud: Public links --

        AsyncFunction("toggleItemPublicLink") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.toggleItemPublicLink(paramsJson: paramsJson)
        }

        // -- Cloud: Sharing --

        AsyncFunction("stopSharingItem") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.stopSharingItem(paramsJson: paramsJson)
        }

        AsyncFunction("removeSharedItem") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.removeSharedItem(paramsJson: paramsJson)
        }
    }

    private func getBridge() throws -> FilenMobileSdkBridge {
        guard let bridge = self.bridge else {
            throw NSError(domain: "FilenSdkBridge", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "FilenSdkBridge not initialized. Call initialize() first."
            ])
        }
        return bridge
    }
}
