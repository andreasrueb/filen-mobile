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

        AsyncFunction("shareItems") { paramsJson: String ->
            getBridge().shareItems(paramsJson)
        }

        AsyncFunction("editItemPublicLink") { paramsJson: String ->
            getBridge().editItemPublicLink(paramsJson)
        }

        AsyncFunction("filePublicLinkInfo") { paramsJson: String ->
            getBridge().filePublicLinkInfo(paramsJson)
        }

        AsyncFunction("filePublicLinkHasPassword") { paramsJson: String ->
            getBridge().filePublicLinkHasPassword(paramsJson)
        }

        AsyncFunction("directoryPublicLinkInfo") { paramsJson: String ->
            getBridge().directoryPublicLinkInfo(paramsJson)
        }

        AsyncFunction("directorySizePublicLink") { paramsJson: String ->
            getBridge().directorySizePublicLink(paramsJson)
        }

        AsyncFunction("fetchFileVersions") { paramsJson: String ->
            getBridge().fetchFileVersions(paramsJson)
        }

        AsyncFunction("restoreFileVersion") { paramsJson: String ->
            getBridge().restoreFileVersion(paramsJson)
        }

        AsyncFunction("decryptDirectoryPublicLinkKey") { paramsJson: String ->
            getBridge().decryptDirectoryPublicLinkKey(paramsJson)
        }

        // -- Contacts --

        AsyncFunction("fetchContacts") { paramsJson: String ->
            getBridge().fetchContacts(paramsJson)
        }

        AsyncFunction("fetchIncomingContactRequests") { paramsJson: String ->
            getBridge().fetchIncomingContactRequests(paramsJson)
        }

        AsyncFunction("fetchOutgoingContactRequests") { paramsJson: String ->
            getBridge().fetchOutgoingContactRequests(paramsJson)
        }

        AsyncFunction("acceptContactRequest") { paramsJson: String ->
            getBridge().acceptContactRequest(paramsJson)
        }

        AsyncFunction("denyContactRequest") { paramsJson: String ->
            getBridge().denyContactRequest(paramsJson)
        }

        AsyncFunction("sendContactRequest") { paramsJson: String ->
            getBridge().sendContactRequest(paramsJson)
        }

        AsyncFunction("removeContact") { paramsJson: String ->
            getBridge().removeContact(paramsJson)
        }

        AsyncFunction("blockContact") { paramsJson: String ->
            getBridge().blockContact(paramsJson)
        }

        AsyncFunction("unblockContact") { paramsJson: String ->
            getBridge().unblockContact(paramsJson)
        }

        AsyncFunction("deleteOutgoingContactRequest") { paramsJson: String ->
            getBridge().deleteOutgoingContactRequest(paramsJson)
        }

        // -- Chats --

        AsyncFunction("fetchChats") { paramsJson: String ->
            getBridge().fetchChats(paramsJson)
        }

        AsyncFunction("createChat") { paramsJson: String ->
            getBridge().createChat(paramsJson)
        }

        AsyncFunction("deleteChat") { paramsJson: String ->
            getBridge().deleteChat(paramsJson)
        }

        AsyncFunction("leaveChat") { paramsJson: String ->
            getBridge().leaveChat(paramsJson)
        }

        AsyncFunction("sendChatMessage") { paramsJson: String ->
            getBridge().sendChatMessage(paramsJson)
        }

        AsyncFunction("editChatMessage") { paramsJson: String ->
            getBridge().editChatMessage(paramsJson)
        }

        AsyncFunction("deleteChatMessage") { paramsJson: String ->
            getBridge().deleteChatMessage(paramsJson)
        }

        AsyncFunction("disableChatMessageEmbeds") { paramsJson: String ->
            getBridge().disableChatMessageEmbeds(paramsJson)
        }

        AsyncFunction("editChatName") { paramsJson: String ->
            getBridge().editChatName(paramsJson)
        }

        AsyncFunction("sendChatTyping") { paramsJson: String ->
            getBridge().sendChatTyping(paramsJson)
        }

        AsyncFunction("chatMarkAsRead") { paramsJson: String ->
            getBridge().chatMarkAsRead(paramsJson)
        }

        AsyncFunction("chatOnline") { paramsJson: String ->
            getBridge().chatOnline(paramsJson)
        }

        AsyncFunction("chatUnread") { paramsJson: String ->
            getBridge().chatUnread(paramsJson)
        }

        AsyncFunction("chatUnreadCount") { paramsJson: String ->
            getBridge().chatUnreadCount(paramsJson)
        }

        AsyncFunction("addChatParticipant") { paramsJson: String ->
            getBridge().addChatParticipant(paramsJson)
        }

        AsyncFunction("removeChatParticipant") { paramsJson: String ->
            getBridge().removeChatParticipant(paramsJson)
        }

        AsyncFunction("fetchChatMessages") { paramsJson: String ->
            getBridge().fetchChatMessages(paramsJson)
        }

        AsyncFunction("fetchChatsLastFocus") { paramsJson: String ->
            getBridge().fetchChatsLastFocus(paramsJson)
        }

        AsyncFunction("updateChatsLastFocus") { paramsJson: String ->
            getBridge().updateChatsLastFocus(paramsJson)
        }

        AsyncFunction("muteChat") { paramsJson: String ->
            getBridge().muteChat(paramsJson)
        }

        AsyncFunction("decryptChatMessage") { paramsJson: String ->
            getBridge().decryptChatMessage(paramsJson)
        }

        // -- Notes --

        AsyncFunction("fetchNotes") { paramsJson: String ->
            getBridge().fetchNotes(paramsJson)
        }

        AsyncFunction("fetchNoteContent") { paramsJson: String ->
            getBridge().fetchNoteContent(paramsJson)
        }

        AsyncFunction("createNote") { paramsJson: String ->
            getBridge().createNote(paramsJson)
        }

        AsyncFunction("deleteNote") { paramsJson: String ->
            getBridge().deleteNote(paramsJson)
        }

        AsyncFunction("archiveNote") { paramsJson: String ->
            getBridge().archiveNote(paramsJson)
        }

        AsyncFunction("trashNote") { paramsJson: String ->
            getBridge().trashNote(paramsJson)
        }

        AsyncFunction("restoreNote") { paramsJson: String ->
            getBridge().restoreNote(paramsJson)
        }

        AsyncFunction("duplicateNote") { paramsJson: String ->
            getBridge().duplicateNote(paramsJson)
        }

        AsyncFunction("renameNote") { paramsJson: String ->
            getBridge().renameNote(paramsJson)
        }

        AsyncFunction("editNote") { paramsJson: String ->
            getBridge().editNote(paramsJson)
        }

        AsyncFunction("changeNoteType") { paramsJson: String ->
            getBridge().changeNoteType(paramsJson)
        }

        AsyncFunction("pinNote") { paramsJson: String ->
            getBridge().pinNote(paramsJson)
        }

        AsyncFunction("favoriteNote") { paramsJson: String ->
            getBridge().favoriteNote(paramsJson)
        }

        AsyncFunction("fetchNoteHistory") { paramsJson: String ->
            getBridge().fetchNoteHistory(paramsJson)
        }

        AsyncFunction("restoreNoteHistory") { paramsJson: String ->
            getBridge().restoreNoteHistory(paramsJson)
        }

        AsyncFunction("addNoteParticipant") { paramsJson: String ->
            getBridge().addNoteParticipant(paramsJson)
        }

        AsyncFunction("removeNoteParticipant") { paramsJson: String ->
            getBridge().removeNoteParticipant(paramsJson)
        }

        AsyncFunction("changeNoteParticipantPermissions") { paramsJson: String ->
            getBridge().changeNoteParticipantPermissions(paramsJson)
        }

        AsyncFunction("fetchNotesTags") { paramsJson: String ->
            getBridge().fetchNotesTags(paramsJson)
        }

        AsyncFunction("createNoteTag") { paramsJson: String ->
            getBridge().createNoteTag(paramsJson)
        }

        AsyncFunction("deleteNoteTag") { paramsJson: String ->
            getBridge().deleteNoteTag(paramsJson)
        }

        AsyncFunction("renameNoteTag") { paramsJson: String ->
            getBridge().renameNoteTag(paramsJson)
        }

        AsyncFunction("favoriteNoteTag") { paramsJson: String ->
            getBridge().favoriteNoteTag(paramsJson)
        }

        AsyncFunction("tagNote") { paramsJson: String ->
            getBridge().tagNote(paramsJson)
        }

        AsyncFunction("untagNote") { paramsJson: String ->
            getBridge().untagNote(paramsJson)
        }

        // -- User --

        AsyncFunction("enableTwoFactorAuthentication") { paramsJson: String ->
            getBridge().enableTwoFactorAuthentication(paramsJson)
        }

        AsyncFunction("disableTwoFactorAuthentication") { paramsJson: String ->
            getBridge().disableTwoFactorAuthentication(paramsJson)
        }

        AsyncFunction("deleteAccount") { paramsJson: String ->
            getBridge().deleteAccount(paramsJson)
        }

        AsyncFunction("fetchUserPublicKey") { paramsJson: String ->
            getBridge().fetchUserPublicKey(paramsJson)
        }

        AsyncFunction("didExportMasterKeys") { paramsJson: String ->
            getBridge().didExportMasterKeys(paramsJson)
        }

        AsyncFunction("fetchAccount") { paramsJson: String ->
            getBridge().fetchAccount(paramsJson)
        }

        AsyncFunction("changePassword") { paramsJson: String ->
            getBridge().changePassword(paramsJson)
        }

        AsyncFunction("updatePersonalInformation") { paramsJson: String ->
            getBridge().updatePersonalInformation(paramsJson)
        }

        AsyncFunction("updateNickname") { paramsJson: String ->
            getBridge().updateNickname(paramsJson)
        }

        AsyncFunction("changeEmail") { paramsJson: String ->
            getBridge().changeEmail(paramsJson)
        }

        AsyncFunction("fetchGDPR") { paramsJson: String ->
            getBridge().fetchGdpr(paramsJson)
        }

        AsyncFunction("toggleVersioning") { paramsJson: String ->
            getBridge().toggleVersioning(paramsJson)
        }

        AsyncFunction("toggleLoginAlerts") { paramsJson: String ->
            getBridge().toggleLoginAlerts(paramsJson)
        }

        AsyncFunction("deleteAllVersionedFiles") { paramsJson: String ->
            getBridge().deleteAllVersionedFiles(paramsJson)
        }

        AsyncFunction("deleteEverything") { paramsJson: String ->
            getBridge().deleteEverything(paramsJson)
        }

        AsyncFunction("fetchEvents") { paramsJson: String ->
            getBridge().fetchEvents(paramsJson)
        }

        AsyncFunction("fetchEvent") { paramsJson: String ->
            getBridge().fetchEvent(paramsJson)
        }

        AsyncFunction("uploadAvatar") { paramsJson: String ->
            getBridge().uploadAvatar(paramsJson)
        }

        // -- FS --

        AsyncFunction("readFileAsString") { paramsJson: String ->
            getBridge().readFileAsString(paramsJson)
        }

        AsyncFunction("writeFileAsString") { paramsJson: String ->
            getBridge().writeFileAsString(paramsJson)
        }

        // -- Transfers --

        AsyncFunction("uploadFile") { paramsJson: String ->
            getBridge().uploadFile(paramsJson)
        }

        AsyncFunction("downloadFile") { paramsJson: String ->
            getBridge().downloadFile(paramsJson)
        }

        AsyncFunction("uploadDirectory") { paramsJson: String ->
            getBridge().uploadDirectory(paramsJson)
        }

        AsyncFunction("downloadDirectory") { paramsJson: String ->
            getBridge().downloadDirectory(paramsJson)
        }

        AsyncFunction("transferAction") { paramsJson: String ->
            getBridge().transferAction(paramsJson)
        }

        AsyncFunction("fetchTransfers") { paramsJson: String ->
            getBridge().fetchTransfers(paramsJson)
        }

        // -- HTTP Server --

        AsyncFunction("startHttpServer") { paramsJson: String ->
            getBridge().startHttpServer(paramsJson)
        }

        AsyncFunction("stopHttpServer") { paramsJson: String ->
            getBridge().stopHttpServer(paramsJson)
        }

        AsyncFunction("restartHTTPServer") { paramsJson: String ->
            getBridge().restartHttpServer(paramsJson)
        }

        AsyncFunction("httpStatus") { paramsJson: String ->
            getBridge().httpStatus(paramsJson)
        }
    }

    private fun getBridge(): FilenMobileSdkBridge {
        return bridge ?: throw IllegalStateException("FilenSdkBridge not initialized. Call initialize() first.")
    }
}
