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

        // -- Contacts --

        AsyncFunction("fetchContacts") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchContacts(paramsJson: paramsJson)
        }

        AsyncFunction("fetchIncomingContactRequests") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchIncomingContactRequests(paramsJson: paramsJson)
        }

        AsyncFunction("fetchOutgoingContactRequests") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchOutgoingContactRequests(paramsJson: paramsJson)
        }

        AsyncFunction("acceptContactRequest") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.acceptContactRequest(paramsJson: paramsJson)
        }

        AsyncFunction("denyContactRequest") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.denyContactRequest(paramsJson: paramsJson)
        }

        AsyncFunction("sendContactRequest") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.sendContactRequest(paramsJson: paramsJson)
        }

        AsyncFunction("removeContact") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.removeContact(paramsJson: paramsJson)
        }

        AsyncFunction("blockContact") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.blockContact(paramsJson: paramsJson)
        }

        AsyncFunction("unblockContact") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.unblockContact(paramsJson: paramsJson)
        }

        AsyncFunction("deleteOutgoingContactRequest") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteOutgoingContactRequest(paramsJson: paramsJson)
        }

        // -- Chats --

        AsyncFunction("fetchChats") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchChats(paramsJson: paramsJson)
        }

        AsyncFunction("createChat") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.createChat(paramsJson: paramsJson)
        }

        AsyncFunction("deleteChat") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteChat(paramsJson: paramsJson)
        }

        AsyncFunction("leaveChat") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.leaveChat(paramsJson: paramsJson)
        }

        AsyncFunction("sendChatMessage") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.sendChatMessage(paramsJson: paramsJson)
        }

        AsyncFunction("editChatMessage") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.editChatMessage(paramsJson: paramsJson)
        }

        AsyncFunction("deleteChatMessage") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteChatMessage(paramsJson: paramsJson)
        }

        AsyncFunction("disableChatMessageEmbeds") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.disableChatMessageEmbeds(paramsJson: paramsJson)
        }

        AsyncFunction("editChatName") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.editChatName(paramsJson: paramsJson)
        }

        AsyncFunction("sendChatTyping") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.sendChatTyping(paramsJson: paramsJson)
        }

        AsyncFunction("chatMarkAsRead") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.chatMarkAsRead(paramsJson: paramsJson)
        }

        AsyncFunction("chatOnline") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.chatOnline(paramsJson: paramsJson)
        }

        AsyncFunction("chatUnread") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.chatUnread(paramsJson: paramsJson)
        }

        AsyncFunction("chatUnreadCount") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.chatUnreadCount(paramsJson: paramsJson)
        }

        AsyncFunction("addChatParticipant") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.addChatParticipant(paramsJson: paramsJson)
        }

        AsyncFunction("removeChatParticipant") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.removeChatParticipant(paramsJson: paramsJson)
        }

        AsyncFunction("fetchChatMessages") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchChatMessages(paramsJson: paramsJson)
        }

        AsyncFunction("fetchChatsLastFocus") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchChatsLastFocus(paramsJson: paramsJson)
        }

        AsyncFunction("updateChatsLastFocus") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.updateChatsLastFocus(paramsJson: paramsJson)
        }

        AsyncFunction("muteChat") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.muteChat(paramsJson: paramsJson)
        }

        AsyncFunction("decryptChatMessage") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.decryptChatMessage(paramsJson: paramsJson)
        }

        // -- Notes --

        AsyncFunction("fetchNotes") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchNotes(paramsJson: paramsJson)
        }

        AsyncFunction("fetchNoteContent") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchNoteContent(paramsJson: paramsJson)
        }

        AsyncFunction("createNote") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.createNote(paramsJson: paramsJson)
        }

        AsyncFunction("deleteNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteNote(paramsJson: paramsJson)
        }

        AsyncFunction("archiveNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.archiveNote(paramsJson: paramsJson)
        }

        AsyncFunction("trashNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.trashNote(paramsJson: paramsJson)
        }

        AsyncFunction("restoreNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.restoreNote(paramsJson: paramsJson)
        }

        AsyncFunction("duplicateNote") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.duplicateNote(paramsJson: paramsJson)
        }

        AsyncFunction("renameNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.renameNote(paramsJson: paramsJson)
        }

        AsyncFunction("editNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.editNote(paramsJson: paramsJson)
        }

        AsyncFunction("changeNoteType") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.changeNoteType(paramsJson: paramsJson)
        }

        AsyncFunction("pinNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.pinNote(paramsJson: paramsJson)
        }

        AsyncFunction("favoriteNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.favoriteNote(paramsJson: paramsJson)
        }

        AsyncFunction("fetchNoteHistory") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchNoteHistory(paramsJson: paramsJson)
        }

        AsyncFunction("restoreNoteHistory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.restoreNoteHistory(paramsJson: paramsJson)
        }

        AsyncFunction("addNoteParticipant") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.addNoteParticipant(paramsJson: paramsJson)
        }

        AsyncFunction("removeNoteParticipant") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.removeNoteParticipant(paramsJson: paramsJson)
        }

        AsyncFunction("changeNoteParticipantPermissions") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.changeNoteParticipantPermissions(paramsJson: paramsJson)
        }

        AsyncFunction("fetchNotesTags") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchNotesTags(paramsJson: paramsJson)
        }

        AsyncFunction("createNoteTag") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.createNoteTag(paramsJson: paramsJson)
        }

        AsyncFunction("deleteNoteTag") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteNoteTag(paramsJson: paramsJson)
        }

        AsyncFunction("renameNoteTag") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.renameNoteTag(paramsJson: paramsJson)
        }

        AsyncFunction("favoriteNoteTag") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.favoriteNoteTag(paramsJson: paramsJson)
        }

        AsyncFunction("tagNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.tagNote(paramsJson: paramsJson)
        }

        AsyncFunction("untagNote") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.untagNote(paramsJson: paramsJson)
        }

        // -- User --

        AsyncFunction("enableTwoFactorAuthentication") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.enableTwoFactorAuthentication(paramsJson: paramsJson)
        }

        AsyncFunction("disableTwoFactorAuthentication") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.disableTwoFactorAuthentication(paramsJson: paramsJson)
        }

        AsyncFunction("deleteAccount") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.deleteAccount(paramsJson: paramsJson)
        }

        AsyncFunction("fetchUserPublicKey") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchUserPublicKey(paramsJson: paramsJson)
        }

        AsyncFunction("didExportMasterKeys") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.didExportMasterKeys(paramsJson: paramsJson)
        }

        AsyncFunction("fetchAccount") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchAccount(paramsJson: paramsJson)
        }

        AsyncFunction("changePassword") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.changePassword(paramsJson: paramsJson)
        }

        // -- FS --

        AsyncFunction("readFileAsString") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.readFileAsString(paramsJson: paramsJson)
        }

        AsyncFunction("writeFileAsString") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.writeFileAsString(paramsJson: paramsJson)
        }

        // -- Transfers --

        AsyncFunction("uploadFile") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.uploadFile(paramsJson: paramsJson)
        }

        AsyncFunction("downloadFile") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.downloadFile(paramsJson: paramsJson)
        }

        AsyncFunction("uploadDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.uploadDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("downloadDirectory") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.downloadDirectory(paramsJson: paramsJson)
        }

        AsyncFunction("transferAction") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.transferAction(paramsJson: paramsJson)
        }

        AsyncFunction("fetchTransfers") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.fetchTransfers(paramsJson: paramsJson)
        }

        // -- HTTP Server --

        AsyncFunction("startHttpServer") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.startHttpServer(paramsJson: paramsJson)
        }

        AsyncFunction("stopHttpServer") { (paramsJson: String) in
            let b = try self.getBridge()
            try await b.stopHttpServer(paramsJson: paramsJson)
        }

        AsyncFunction("restartHTTPServer") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.restartHttpServer(paramsJson: paramsJson)
        }

        AsyncFunction("httpStatus") { (paramsJson: String) -> String in
            let b = try self.getBridge()
            return try await b.httpStatus(paramsJson: paramsJson)
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
