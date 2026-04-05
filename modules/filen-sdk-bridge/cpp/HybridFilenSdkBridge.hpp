#pragma once

#include <NitroModules/HybridObject.hpp>
#include <NitroModules/Promise.hpp>
#include <string>

// Rust FFI header
#include "filen_mobile_sdk_bridge_ffi.h"

namespace margelo::nitro::filensdk {

using namespace margelo::nitro;

class HybridFilenSdkBridge : public HybridObject {
public:
    HybridFilenSdkBridge() : HybridObject(TAG) {
        bridge_ = filen_bridge_new();
    }

    ~HybridFilenSdkBridge() override {
        if (bridge_) {
            filen_bridge_free(bridge_);
            bridge_ = nullptr;
        }
    }

    // Non-copyable
    HybridFilenSdkBridge(const HybridFilenSdkBridge&) = delete;
    HybridFilenSdkBridge& operator=(const HybridFilenSdkBridge&) = delete;

public:
    void loadHybridMethods() override {
        HybridObject::loadHybridMethods();
        registerHybrids(this, [](Prototype& proto) {
            // Auth
            proto.registerHybridMethod("login", &HybridFilenSdkBridge::login);
            proto.registerHybridMethod("register_", &HybridFilenSdkBridge::register_);
            proto.registerHybridMethod("reinitSDK", &HybridFilenSdkBridge::reinitSDK);
            proto.registerHybridMethod("resendConfirmation", &HybridFilenSdkBridge::resendConfirmation);
            proto.registerHybridMethod("forgotPassword", &HybridFilenSdkBridge::forgotPassword);

            // Cloud: Directory operations
            proto.registerHybridMethod("createDirectory", &HybridFilenSdkBridge::createDirectory);
            proto.registerHybridMethod("getDirectory", &HybridFilenSdkBridge::getDirectory);
            proto.registerHybridMethod("deleteDirectory", &HybridFilenSdkBridge::deleteDirectory);
            proto.registerHybridMethod("trashDirectory", &HybridFilenSdkBridge::trashDirectory);
            proto.registerHybridMethod("restoreDirectory", &HybridFilenSdkBridge::restoreDirectory);
            proto.registerHybridMethod("directoryExists", &HybridFilenSdkBridge::directoryExists);
            proto.registerHybridMethod("renameDirectory", &HybridFilenSdkBridge::renameDirectory);
            proto.registerHybridMethod("moveDirectory", &HybridFilenSdkBridge::moveDirectory);
            proto.registerHybridMethod("changeDirectoryColor", &HybridFilenSdkBridge::changeDirectoryColor);
            proto.registerHybridMethod("favoriteDirectory", &HybridFilenSdkBridge::favoriteDirectory);
            proto.registerHybridMethod("editDirectoryMetadata", &HybridFilenSdkBridge::editDirectoryMetadata);
            proto.registerHybridMethod("fetchDirectorySize", &HybridFilenSdkBridge::fetchDirectorySize);
            proto.registerHybridMethod("getDirectoryTree", &HybridFilenSdkBridge::getDirectoryTree);
            proto.registerHybridMethod("directoryUUIDToPath", &HybridFilenSdkBridge::directoryUUIDToPath);
            proto.registerHybridMethod("directoryPublicLinkStatus", &HybridFilenSdkBridge::directoryPublicLinkStatus);

            // Cloud: File operations
            proto.registerHybridMethod("getFile", &HybridFilenSdkBridge::getFile);
            proto.registerHybridMethod("deleteFile", &HybridFilenSdkBridge::deleteFile);
            proto.registerHybridMethod("trashFile", &HybridFilenSdkBridge::trashFile);
            proto.registerHybridMethod("restoreFile", &HybridFilenSdkBridge::restoreFile);
            proto.registerHybridMethod("fileExists", &HybridFilenSdkBridge::fileExists);
            proto.registerHybridMethod("renameFile", &HybridFilenSdkBridge::renameFile);
            proto.registerHybridMethod("moveFile", &HybridFilenSdkBridge::moveFile);
            proto.registerHybridMethod("favoriteFile", &HybridFilenSdkBridge::favoriteFile);
            proto.registerHybridMethod("editFileMetadata", &HybridFilenSdkBridge::editFileMetadata);
            proto.registerHybridMethod("fileUUIDToPath", &HybridFilenSdkBridge::fileUUIDToPath);
            proto.registerHybridMethod("filePublicLinkStatus", &HybridFilenSdkBridge::filePublicLinkStatus);

            // Cloud: Listing & search
            proto.registerHybridMethod("fetchCloudItems", &HybridFilenSdkBridge::fetchCloudItems);
            proto.registerHybridMethod("queryGlobalSearch", &HybridFilenSdkBridge::queryGlobalSearch);

            // Cloud: Public links & sharing
            proto.registerHybridMethod("toggleItemPublicLink", &HybridFilenSdkBridge::toggleItemPublicLink);
            proto.registerHybridMethod("stopSharingItem", &HybridFilenSdkBridge::stopSharingItem);
            proto.registerHybridMethod("removeSharedItem", &HybridFilenSdkBridge::removeSharedItem);
            proto.registerHybridMethod("shareItems", &HybridFilenSdkBridge::shareItems);
            proto.registerHybridMethod("editItemPublicLink", &HybridFilenSdkBridge::editItemPublicLink);
            proto.registerHybridMethod("filePublicLinkInfo", &HybridFilenSdkBridge::filePublicLinkInfo);
            proto.registerHybridMethod("filePublicLinkHasPassword", &HybridFilenSdkBridge::filePublicLinkHasPassword);
            proto.registerHybridMethod("directoryPublicLinkInfo", &HybridFilenSdkBridge::directoryPublicLinkInfo);
            proto.registerHybridMethod("directorySizePublicLink", &HybridFilenSdkBridge::directorySizePublicLink);
            proto.registerHybridMethod("fetchFileVersions", &HybridFilenSdkBridge::fetchFileVersions);
            proto.registerHybridMethod("restoreFileVersion", &HybridFilenSdkBridge::restoreFileVersion);
            proto.registerHybridMethod("decryptDirectoryPublicLinkKey", &HybridFilenSdkBridge::decryptDirectoryPublicLinkKey);

            // Contacts
            proto.registerHybridMethod("fetchContacts", &HybridFilenSdkBridge::fetchContacts);
            proto.registerHybridMethod("fetchIncomingContactRequests", &HybridFilenSdkBridge::fetchIncomingContactRequests);
            proto.registerHybridMethod("fetchOutgoingContactRequests", &HybridFilenSdkBridge::fetchOutgoingContactRequests);
            proto.registerHybridMethod("acceptContactRequest", &HybridFilenSdkBridge::acceptContactRequest);
            proto.registerHybridMethod("denyContactRequest", &HybridFilenSdkBridge::denyContactRequest);
            proto.registerHybridMethod("sendContactRequest", &HybridFilenSdkBridge::sendContactRequest);
            proto.registerHybridMethod("removeContact", &HybridFilenSdkBridge::removeContact);
            proto.registerHybridMethod("blockContact", &HybridFilenSdkBridge::blockContact);
            proto.registerHybridMethod("unblockContact", &HybridFilenSdkBridge::unblockContact);
            proto.registerHybridMethod("deleteOutgoingContactRequest", &HybridFilenSdkBridge::deleteOutgoingContactRequest);

            // Chats
            proto.registerHybridMethod("fetchChats", &HybridFilenSdkBridge::fetchChats);
            proto.registerHybridMethod("createChat", &HybridFilenSdkBridge::createChat);
            proto.registerHybridMethod("deleteChat", &HybridFilenSdkBridge::deleteChat);
            proto.registerHybridMethod("leaveChat", &HybridFilenSdkBridge::leaveChat);
            proto.registerHybridMethod("sendChatMessage", &HybridFilenSdkBridge::sendChatMessage);
            proto.registerHybridMethod("editChatMessage", &HybridFilenSdkBridge::editChatMessage);
            proto.registerHybridMethod("deleteChatMessage", &HybridFilenSdkBridge::deleteChatMessage);
            proto.registerHybridMethod("disableChatMessageEmbeds", &HybridFilenSdkBridge::disableChatMessageEmbeds);
            proto.registerHybridMethod("editChatName", &HybridFilenSdkBridge::editChatName);
            proto.registerHybridMethod("sendChatTyping", &HybridFilenSdkBridge::sendChatTyping);
            proto.registerHybridMethod("chatMarkAsRead", &HybridFilenSdkBridge::chatMarkAsRead);
            proto.registerHybridMethod("chatOnline", &HybridFilenSdkBridge::chatOnline);
            proto.registerHybridMethod("chatUnread", &HybridFilenSdkBridge::chatUnread);
            proto.registerHybridMethod("chatUnreadCount", &HybridFilenSdkBridge::chatUnreadCount);
            proto.registerHybridMethod("addChatParticipant", &HybridFilenSdkBridge::addChatParticipant);
            proto.registerHybridMethod("removeChatParticipant", &HybridFilenSdkBridge::removeChatParticipant);
            proto.registerHybridMethod("fetchChatMessages", &HybridFilenSdkBridge::fetchChatMessages);
            proto.registerHybridMethod("fetchChatsLastFocus", &HybridFilenSdkBridge::fetchChatsLastFocus);
            proto.registerHybridMethod("updateChatsLastFocus", &HybridFilenSdkBridge::updateChatsLastFocus);
            proto.registerHybridMethod("muteChat", &HybridFilenSdkBridge::muteChat);
            proto.registerHybridMethod("decryptChatMessage", &HybridFilenSdkBridge::decryptChatMessage);

            // Notes
            proto.registerHybridMethod("fetchNotes", &HybridFilenSdkBridge::fetchNotes);
            proto.registerHybridMethod("fetchNoteContent", &HybridFilenSdkBridge::fetchNoteContent);
            proto.registerHybridMethod("createNote", &HybridFilenSdkBridge::createNote);
            proto.registerHybridMethod("deleteNote", &HybridFilenSdkBridge::deleteNote);
            proto.registerHybridMethod("archiveNote", &HybridFilenSdkBridge::archiveNote);
            proto.registerHybridMethod("trashNote", &HybridFilenSdkBridge::trashNote);
            proto.registerHybridMethod("restoreNote", &HybridFilenSdkBridge::restoreNote);
            proto.registerHybridMethod("duplicateNote", &HybridFilenSdkBridge::duplicateNote);
            proto.registerHybridMethod("renameNote", &HybridFilenSdkBridge::renameNote);
            proto.registerHybridMethod("editNote", &HybridFilenSdkBridge::editNote);
            proto.registerHybridMethod("changeNoteType", &HybridFilenSdkBridge::changeNoteType);
            proto.registerHybridMethod("pinNote", &HybridFilenSdkBridge::pinNote);
            proto.registerHybridMethod("favoriteNote", &HybridFilenSdkBridge::favoriteNote);
            proto.registerHybridMethod("fetchNoteHistory", &HybridFilenSdkBridge::fetchNoteHistory);
            proto.registerHybridMethod("restoreNoteHistory", &HybridFilenSdkBridge::restoreNoteHistory);
            proto.registerHybridMethod("addNoteParticipant", &HybridFilenSdkBridge::addNoteParticipant);
            proto.registerHybridMethod("removeNoteParticipant", &HybridFilenSdkBridge::removeNoteParticipant);
            proto.registerHybridMethod("changeNoteParticipantPermissions", &HybridFilenSdkBridge::changeNoteParticipantPermissions);
            proto.registerHybridMethod("fetchNotesTags", &HybridFilenSdkBridge::fetchNotesTags);
            proto.registerHybridMethod("createNoteTag", &HybridFilenSdkBridge::createNoteTag);
            proto.registerHybridMethod("deleteNoteTag", &HybridFilenSdkBridge::deleteNoteTag);
            proto.registerHybridMethod("renameNoteTag", &HybridFilenSdkBridge::renameNoteTag);
            proto.registerHybridMethod("favoriteNoteTag", &HybridFilenSdkBridge::favoriteNoteTag);
            proto.registerHybridMethod("tagNote", &HybridFilenSdkBridge::tagNote);
            proto.registerHybridMethod("untagNote", &HybridFilenSdkBridge::untagNote);

            // User
            proto.registerHybridMethod("enableTwoFactorAuthentication", &HybridFilenSdkBridge::enableTwoFactorAuthentication);
            proto.registerHybridMethod("disableTwoFactorAuthentication", &HybridFilenSdkBridge::disableTwoFactorAuthentication);
            proto.registerHybridMethod("deleteAccount", &HybridFilenSdkBridge::deleteAccount);
            proto.registerHybridMethod("fetchUserPublicKey", &HybridFilenSdkBridge::fetchUserPublicKey);
            proto.registerHybridMethod("didExportMasterKeys", &HybridFilenSdkBridge::didExportMasterKeys);
            proto.registerHybridMethod("fetchAccount", &HybridFilenSdkBridge::fetchAccount);
            proto.registerHybridMethod("changePassword", &HybridFilenSdkBridge::changePassword);
            proto.registerHybridMethod("updatePersonalInformation", &HybridFilenSdkBridge::updatePersonalInformation);
            proto.registerHybridMethod("updateNickname", &HybridFilenSdkBridge::updateNickname);
            proto.registerHybridMethod("changeEmail", &HybridFilenSdkBridge::changeEmail);
            proto.registerHybridMethod("fetchGDPR", &HybridFilenSdkBridge::fetchGDPR);
            proto.registerHybridMethod("toggleVersioning", &HybridFilenSdkBridge::toggleVersioning);
            proto.registerHybridMethod("toggleLoginAlerts", &HybridFilenSdkBridge::toggleLoginAlerts);
            proto.registerHybridMethod("deleteAllVersionedFiles", &HybridFilenSdkBridge::deleteAllVersionedFiles);
            proto.registerHybridMethod("deleteEverything", &HybridFilenSdkBridge::deleteEverything);
            proto.registerHybridMethod("fetchEvents", &HybridFilenSdkBridge::fetchEvents);
            proto.registerHybridMethod("fetchEvent", &HybridFilenSdkBridge::fetchEvent);
            proto.registerHybridMethod("uploadAvatar", &HybridFilenSdkBridge::uploadAvatar);

            // FS
            proto.registerHybridMethod("readFileAsString", &HybridFilenSdkBridge::readFileAsString);
            proto.registerHybridMethod("writeFileAsString", &HybridFilenSdkBridge::writeFileAsString);

            // Transfers
            proto.registerHybridMethod("uploadFile", &HybridFilenSdkBridge::uploadFile);
            proto.registerHybridMethod("downloadFile", &HybridFilenSdkBridge::downloadFile);
            proto.registerHybridMethod("uploadDirectory", &HybridFilenSdkBridge::uploadDirectory);
            proto.registerHybridMethod("downloadDirectory", &HybridFilenSdkBridge::downloadDirectory);
            proto.registerHybridMethod("transferAction", &HybridFilenSdkBridge::transferAction);
            proto.registerHybridMethod("fetchTransfers", &HybridFilenSdkBridge::fetchTransfers);

            // HTTP Server
            proto.registerHybridMethod("startHttpServer", &HybridFilenSdkBridge::startHttpServer);
            proto.registerHybridMethod("stopHttpServer", &HybridFilenSdkBridge::stopHttpServer);
            proto.registerHybridMethod("restartHTTPServer", &HybridFilenSdkBridge::restartHTTPServer);
            proto.registerHybridMethod("httpStatus", &HybridFilenSdkBridge::httpStatus);
        });
    }

private:
    // Helper: call a Rust FFI function that returns a string
    using FfiStringFn = FfiResult(*)(const FilenMobileSdkBridge*, const char*);
    std::shared_ptr<Promise<std::string>> callString(FfiStringFn fn, const std::string& paramsJson) {
        auto* b = bridge_;
        return Promise<std::string>::async([b, fn, paramsJson]() -> std::string {
            FfiResult result = fn(b, paramsJson.c_str());
            if (result.error != nullptr) {
                std::string err(result.error);
                filen_bridge_free_string(result.error);
                throw std::runtime_error(err);
            }
            std::string data(result.data ? result.data : "");
            if (result.data) filen_bridge_free_string(result.data);
            return data;
        });
    }

    // Helper: call a Rust FFI function that returns void
    using FfiVoidFn = FfiResult(*)(const FilenMobileSdkBridge*, const char*);
    std::shared_ptr<Promise<void>> callVoid(FfiVoidFn fn, const std::string& paramsJson) {
        auto* b = bridge_;
        return Promise<void>::async([b, fn, paramsJson]() {
            FfiResult result = fn(b, paramsJson.c_str());
            if (result.error != nullptr) {
                std::string err(result.error);
                filen_bridge_free_string(result.error);
                if (result.data) filen_bridge_free_string(result.data);
                throw std::runtime_error(err);
            }
            if (result.data) filen_bridge_free_string(result.data);
        });
    }

    // ── Method implementations ──────────────────────────────────────────

    // Auth
    std::shared_ptr<Promise<std::string>> login(const std::string& p) { return callString(filen_bridge_login, p); }
    std::shared_ptr<Promise<void>> register_(const std::string& p) { return callVoid(filen_bridge_register, p); }
    std::shared_ptr<Promise<void>> reinitSDK(const std::string& p) { return callVoid(filen_bridge_reinit_sdk, p); }
    std::shared_ptr<Promise<void>> resendConfirmation(const std::string& p) { return callVoid(filen_bridge_resend_confirmation, p); }
    std::shared_ptr<Promise<void>> forgotPassword(const std::string& p) { return callVoid(filen_bridge_forgot_password, p); }

    // Cloud: Dirs
    std::shared_ptr<Promise<std::string>> createDirectory(const std::string& p) { return callString(filen_bridge_create_directory, p); }
    std::shared_ptr<Promise<std::string>> getDirectory(const std::string& p) { return callString(filen_bridge_get_directory, p); }
    std::shared_ptr<Promise<void>> deleteDirectory(const std::string& p) { return callVoid(filen_bridge_delete_directory, p); }
    std::shared_ptr<Promise<void>> trashDirectory(const std::string& p) { return callVoid(filen_bridge_trash_directory, p); }
    std::shared_ptr<Promise<void>> restoreDirectory(const std::string& p) { return callVoid(filen_bridge_restore_directory, p); }
    std::shared_ptr<Promise<std::string>> directoryExists(const std::string& p) { return callString(filen_bridge_directory_exists, p); }
    std::shared_ptr<Promise<void>> renameDirectory(const std::string& p) { return callVoid(filen_bridge_rename_directory, p); }
    std::shared_ptr<Promise<void>> moveDirectory(const std::string& p) { return callVoid(filen_bridge_move_directory, p); }
    std::shared_ptr<Promise<void>> changeDirectoryColor(const std::string& p) { return callVoid(filen_bridge_change_directory_color, p); }
    std::shared_ptr<Promise<void>> favoriteDirectory(const std::string& p) { return callVoid(filen_bridge_favorite_directory, p); }
    std::shared_ptr<Promise<void>> editDirectoryMetadata(const std::string& p) { return callVoid(filen_bridge_edit_directory_metadata, p); }
    std::shared_ptr<Promise<std::string>> fetchDirectorySize(const std::string& p) { return callString(filen_bridge_fetch_directory_size, p); }
    std::shared_ptr<Promise<std::string>> getDirectoryTree(const std::string& p) { return callString(filen_bridge_get_directory_tree, p); }
    std::shared_ptr<Promise<std::string>> directoryUUIDToPath(const std::string& p) { return callString(filen_bridge_directory_uuid_to_path, p); }
    std::shared_ptr<Promise<std::string>> directoryPublicLinkStatus(const std::string& p) { return callString(filen_bridge_directory_public_link_status, p); }

    // Cloud: Files
    std::shared_ptr<Promise<std::string>> getFile(const std::string& p) { return callString(filen_bridge_get_file, p); }
    std::shared_ptr<Promise<void>> deleteFile(const std::string& p) { return callVoid(filen_bridge_delete_file, p); }
    std::shared_ptr<Promise<void>> trashFile(const std::string& p) { return callVoid(filen_bridge_trash_file, p); }
    std::shared_ptr<Promise<void>> restoreFile(const std::string& p) { return callVoid(filen_bridge_restore_file, p); }
    std::shared_ptr<Promise<std::string>> fileExists(const std::string& p) { return callString(filen_bridge_file_exists, p); }
    std::shared_ptr<Promise<void>> renameFile(const std::string& p) { return callVoid(filen_bridge_rename_file, p); }
    std::shared_ptr<Promise<void>> moveFile(const std::string& p) { return callVoid(filen_bridge_move_file, p); }
    std::shared_ptr<Promise<void>> favoriteFile(const std::string& p) { return callVoid(filen_bridge_favorite_file, p); }
    std::shared_ptr<Promise<void>> editFileMetadata(const std::string& p) { return callVoid(filen_bridge_edit_file_metadata, p); }
    std::shared_ptr<Promise<std::string>> fileUUIDToPath(const std::string& p) { return callString(filen_bridge_file_uuid_to_path, p); }
    std::shared_ptr<Promise<std::string>> filePublicLinkStatus(const std::string& p) { return callString(filen_bridge_file_public_link_status, p); }

    // Cloud: Listing
    std::shared_ptr<Promise<std::string>> fetchCloudItems(const std::string& p) { return callString(filen_bridge_fetch_cloud_items, p); }
    std::shared_ptr<Promise<std::string>> queryGlobalSearch(const std::string& p) { return callString(filen_bridge_query_global_search, p); }

    // Cloud: Public links & sharing
    std::shared_ptr<Promise<std::string>> toggleItemPublicLink(const std::string& p) { return callString(filen_bridge_toggle_item_public_link, p); }
    std::shared_ptr<Promise<void>> stopSharingItem(const std::string& p) { return callVoid(filen_bridge_stop_sharing_item, p); }
    std::shared_ptr<Promise<void>> removeSharedItem(const std::string& p) { return callVoid(filen_bridge_remove_shared_item, p); }
    std::shared_ptr<Promise<void>> shareItems(const std::string& p) { return callVoid(filen_bridge_share_items, p); }
    std::shared_ptr<Promise<void>> editItemPublicLink(const std::string& p) { return callVoid(filen_bridge_edit_item_public_link, p); }
    std::shared_ptr<Promise<std::string>> filePublicLinkInfo(const std::string& p) { return callString(filen_bridge_file_public_link_info, p); }
    std::shared_ptr<Promise<std::string>> filePublicLinkHasPassword(const std::string& p) { return callString(filen_bridge_file_public_link_has_password, p); }
    std::shared_ptr<Promise<std::string>> directoryPublicLinkInfo(const std::string& p) { return callString(filen_bridge_directory_public_link_info, p); }
    std::shared_ptr<Promise<std::string>> directorySizePublicLink(const std::string& p) { return callString(filen_bridge_directory_size_public_link, p); }
    std::shared_ptr<Promise<std::string>> fetchFileVersions(const std::string& p) { return callString(filen_bridge_fetch_file_versions, p); }
    std::shared_ptr<Promise<void>> restoreFileVersion(const std::string& p) { return callVoid(filen_bridge_restore_file_version, p); }
    std::shared_ptr<Promise<std::string>> decryptDirectoryPublicLinkKey(const std::string& p) { return callString(filen_bridge_decrypt_directory_public_link_key, p); }

    // Contacts
    std::shared_ptr<Promise<std::string>> fetchContacts(const std::string& p) { return callString(filen_bridge_fetch_contacts, p); }
    std::shared_ptr<Promise<std::string>> fetchIncomingContactRequests(const std::string& p) { return callString(filen_bridge_fetch_incoming_contact_requests, p); }
    std::shared_ptr<Promise<std::string>> fetchOutgoingContactRequests(const std::string& p) { return callString(filen_bridge_fetch_outgoing_contact_requests, p); }
    std::shared_ptr<Promise<void>> acceptContactRequest(const std::string& p) { return callVoid(filen_bridge_accept_contact_request, p); }
    std::shared_ptr<Promise<void>> denyContactRequest(const std::string& p) { return callVoid(filen_bridge_deny_contact_request, p); }
    std::shared_ptr<Promise<void>> sendContactRequest(const std::string& p) { return callVoid(filen_bridge_send_contact_request, p); }
    std::shared_ptr<Promise<void>> removeContact(const std::string& p) { return callVoid(filen_bridge_remove_contact, p); }
    std::shared_ptr<Promise<void>> blockContact(const std::string& p) { return callVoid(filen_bridge_block_contact, p); }
    std::shared_ptr<Promise<void>> unblockContact(const std::string& p) { return callVoid(filen_bridge_unblock_contact, p); }
    std::shared_ptr<Promise<void>> deleteOutgoingContactRequest(const std::string& p) { return callVoid(filen_bridge_delete_outgoing_contact_request, p); }

    // Chats
    std::shared_ptr<Promise<std::string>> fetchChats(const std::string& p) { return callString(filen_bridge_fetch_chats, p); }
    std::shared_ptr<Promise<std::string>> createChat(const std::string& p) { return callString(filen_bridge_create_chat, p); }
    std::shared_ptr<Promise<void>> deleteChat(const std::string& p) { return callVoid(filen_bridge_delete_chat, p); }
    std::shared_ptr<Promise<void>> leaveChat(const std::string& p) { return callVoid(filen_bridge_leave_chat, p); }
    std::shared_ptr<Promise<std::string>> sendChatMessage(const std::string& p) { return callString(filen_bridge_send_chat_message, p); }
    std::shared_ptr<Promise<void>> editChatMessage(const std::string& p) { return callVoid(filen_bridge_edit_chat_message, p); }
    std::shared_ptr<Promise<void>> deleteChatMessage(const std::string& p) { return callVoid(filen_bridge_delete_chat_message, p); }
    std::shared_ptr<Promise<void>> disableChatMessageEmbeds(const std::string& p) { return callVoid(filen_bridge_disable_chat_message_embeds, p); }
    std::shared_ptr<Promise<void>> editChatName(const std::string& p) { return callVoid(filen_bridge_edit_chat_name, p); }
    std::shared_ptr<Promise<void>> sendChatTyping(const std::string& p) { return callVoid(filen_bridge_send_chat_typing, p); }
    std::shared_ptr<Promise<void>> chatMarkAsRead(const std::string& p) { return callVoid(filen_bridge_chat_mark_as_read, p); }
    std::shared_ptr<Promise<std::string>> chatOnline(const std::string& p) { return callString(filen_bridge_chat_online, p); }
    std::shared_ptr<Promise<std::string>> chatUnread(const std::string& p) { return callString(filen_bridge_chat_unread, p); }
    std::shared_ptr<Promise<std::string>> chatUnreadCount(const std::string& p) { return callString(filen_bridge_chat_unread_count, p); }
    std::shared_ptr<Promise<void>> addChatParticipant(const std::string& p) { return callVoid(filen_bridge_add_chat_participant, p); }
    std::shared_ptr<Promise<void>> removeChatParticipant(const std::string& p) { return callVoid(filen_bridge_remove_chat_participant, p); }
    std::shared_ptr<Promise<std::string>> fetchChatMessages(const std::string& p) { return callString(filen_bridge_fetch_chat_messages, p); }
    std::shared_ptr<Promise<std::string>> fetchChatsLastFocus(const std::string& p) { return callString(filen_bridge_fetch_chats_last_focus, p); }
    std::shared_ptr<Promise<void>> updateChatsLastFocus(const std::string& p) { return callVoid(filen_bridge_update_chats_last_focus, p); }
    std::shared_ptr<Promise<void>> muteChat(const std::string& p) { return callVoid(filen_bridge_mute_chat, p); }
    std::shared_ptr<Promise<std::string>> decryptChatMessage(const std::string& p) { return callString(filen_bridge_decrypt_chat_message, p); }

    // Notes
    std::shared_ptr<Promise<std::string>> fetchNotes(const std::string& p) { return callString(filen_bridge_fetch_notes, p); }
    std::shared_ptr<Promise<std::string>> fetchNoteContent(const std::string& p) { return callString(filen_bridge_fetch_note_content, p); }
    std::shared_ptr<Promise<std::string>> createNote(const std::string& p) { return callString(filen_bridge_create_note, p); }
    std::shared_ptr<Promise<void>> deleteNote(const std::string& p) { return callVoid(filen_bridge_delete_note, p); }
    std::shared_ptr<Promise<void>> archiveNote(const std::string& p) { return callVoid(filen_bridge_archive_note, p); }
    std::shared_ptr<Promise<void>> trashNote(const std::string& p) { return callVoid(filen_bridge_trash_note, p); }
    std::shared_ptr<Promise<void>> restoreNote(const std::string& p) { return callVoid(filen_bridge_restore_note, p); }
    std::shared_ptr<Promise<std::string>> duplicateNote(const std::string& p) { return callString(filen_bridge_duplicate_note, p); }
    std::shared_ptr<Promise<void>> renameNote(const std::string& p) { return callVoid(filen_bridge_rename_note, p); }
    std::shared_ptr<Promise<void>> editNote(const std::string& p) { return callVoid(filen_bridge_edit_note, p); }
    std::shared_ptr<Promise<void>> changeNoteType(const std::string& p) { return callVoid(filen_bridge_change_note_type, p); }
    std::shared_ptr<Promise<void>> pinNote(const std::string& p) { return callVoid(filen_bridge_pin_note, p); }
    std::shared_ptr<Promise<void>> favoriteNote(const std::string& p) { return callVoid(filen_bridge_favorite_note, p); }
    std::shared_ptr<Promise<std::string>> fetchNoteHistory(const std::string& p) { return callString(filen_bridge_fetch_note_history, p); }
    std::shared_ptr<Promise<void>> restoreNoteHistory(const std::string& p) { return callVoid(filen_bridge_restore_note_history, p); }
    std::shared_ptr<Promise<void>> addNoteParticipant(const std::string& p) { return callVoid(filen_bridge_add_note_participant, p); }
    std::shared_ptr<Promise<void>> removeNoteParticipant(const std::string& p) { return callVoid(filen_bridge_remove_note_participant, p); }
    std::shared_ptr<Promise<void>> changeNoteParticipantPermissions(const std::string& p) { return callVoid(filen_bridge_change_note_participant_permissions, p); }
    std::shared_ptr<Promise<std::string>> fetchNotesTags(const std::string& p) { return callString(filen_bridge_fetch_notes_tags, p); }
    std::shared_ptr<Promise<std::string>> createNoteTag(const std::string& p) { return callString(filen_bridge_create_note_tag, p); }
    std::shared_ptr<Promise<void>> deleteNoteTag(const std::string& p) { return callVoid(filen_bridge_delete_note_tag, p); }
    std::shared_ptr<Promise<void>> renameNoteTag(const std::string& p) { return callVoid(filen_bridge_rename_note_tag, p); }
    std::shared_ptr<Promise<void>> favoriteNoteTag(const std::string& p) { return callVoid(filen_bridge_favorite_note_tag, p); }
    std::shared_ptr<Promise<void>> tagNote(const std::string& p) { return callVoid(filen_bridge_tag_note, p); }
    std::shared_ptr<Promise<void>> untagNote(const std::string& p) { return callVoid(filen_bridge_untag_note, p); }

    // User
    std::shared_ptr<Promise<std::string>> enableTwoFactorAuthentication(const std::string& p) { return callString(filen_bridge_enable_two_factor_authentication, p); }
    std::shared_ptr<Promise<void>> disableTwoFactorAuthentication(const std::string& p) { return callVoid(filen_bridge_disable_two_factor_authentication, p); }
    std::shared_ptr<Promise<void>> deleteAccount(const std::string& p) { return callVoid(filen_bridge_delete_account, p); }
    std::shared_ptr<Promise<std::string>> fetchUserPublicKey(const std::string& p) { return callString(filen_bridge_fetch_user_public_key, p); }
    std::shared_ptr<Promise<void>> didExportMasterKeys(const std::string& p) { return callVoid(filen_bridge_did_export_master_keys, p); }
    std::shared_ptr<Promise<std::string>> fetchAccount(const std::string& p) { return callString(filen_bridge_fetch_account, p); }
    std::shared_ptr<Promise<void>> changePassword(const std::string& p) { return callVoid(filen_bridge_change_password, p); }
    std::shared_ptr<Promise<void>> updatePersonalInformation(const std::string& p) { return callVoid(filen_bridge_update_personal_information, p); }
    std::shared_ptr<Promise<void>> updateNickname(const std::string& p) { return callVoid(filen_bridge_update_nickname, p); }
    std::shared_ptr<Promise<void>> changeEmail(const std::string& p) { return callVoid(filen_bridge_change_email, p); }
    std::shared_ptr<Promise<std::string>> fetchGDPR(const std::string& p) { return callString(filen_bridge_fetch_gdpr, p); }
    std::shared_ptr<Promise<void>> toggleVersioning(const std::string& p) { return callVoid(filen_bridge_toggle_versioning, p); }
    std::shared_ptr<Promise<void>> toggleLoginAlerts(const std::string& p) { return callVoid(filen_bridge_toggle_login_alerts, p); }
    std::shared_ptr<Promise<void>> deleteAllVersionedFiles(const std::string& p) { return callVoid(filen_bridge_delete_all_versioned_files, p); }
    std::shared_ptr<Promise<void>> deleteEverything(const std::string& p) { return callVoid(filen_bridge_delete_everything, p); }
    std::shared_ptr<Promise<std::string>> fetchEvents(const std::string& p) { return callString(filen_bridge_fetch_events, p); }
    std::shared_ptr<Promise<std::string>> fetchEvent(const std::string& p) { return callString(filen_bridge_fetch_event, p); }
    std::shared_ptr<Promise<void>> uploadAvatar(const std::string& p) { return callVoid(filen_bridge_upload_avatar, p); }

    // FS
    std::shared_ptr<Promise<std::string>> readFileAsString(const std::string& p) { return callString(filen_bridge_read_file_as_string, p); }
    std::shared_ptr<Promise<void>> writeFileAsString(const std::string& p) { return callVoid(filen_bridge_write_file_as_string, p); }

    // Transfers
    std::shared_ptr<Promise<std::string>> uploadFile(const std::string& p) { return callString(filen_bridge_upload_file, p); }
    std::shared_ptr<Promise<void>> downloadFile(const std::string& p) { return callVoid(filen_bridge_download_file, p); }
    std::shared_ptr<Promise<void>> uploadDirectory(const std::string& p) { return callVoid(filen_bridge_upload_directory, p); }
    std::shared_ptr<Promise<void>> downloadDirectory(const std::string& p) { return callVoid(filen_bridge_download_directory, p); }
    std::shared_ptr<Promise<std::string>> transferAction(const std::string& p) { return callString(filen_bridge_transfer_action, p); }
    std::shared_ptr<Promise<std::string>> fetchTransfers(const std::string& p) { return callString(filen_bridge_fetch_transfers, p); }

    // HTTP Server
    std::shared_ptr<Promise<std::string>> startHttpServer(const std::string& p) { return callString(filen_bridge_start_http_server, p); }
    std::shared_ptr<Promise<void>> stopHttpServer(const std::string& p) { return callVoid(filen_bridge_stop_http_server, p); }
    std::shared_ptr<Promise<std::string>> restartHTTPServer(const std::string& p) { return callString(filen_bridge_restart_http_server, p); }
    std::shared_ptr<Promise<std::string>> httpStatus(const std::string& p) { return callString(filen_bridge_http_status, p); }

private:
    FilenMobileSdkBridge* bridge_ = nullptr;
    static constexpr auto TAG = "FilenSdkBridge";
};

} // namespace margelo::nitro::filensdk
