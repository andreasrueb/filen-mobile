#pragma once

#include <NitroModules/HybridObject.hpp>
#include <NitroModules/Promise.hpp>
#include <memory>
#include <string>
#include <optional>
#include <sstream>
#include <stdexcept>

// Rust FFI header
#include "filen_mobile_sdk_bridge_ffi.h"

// JSON → Nitro-type parser (for typed returns)
#include "JsonToJsi.hpp"

namespace margelo::nitro::filensdk {

using namespace margelo::nitro;

// Custom deleter so we can use shared_ptr for the opaque Rust handle.
struct BridgeDeleter {
    void operator()(FilenMobileSdkBridge* p) const noexcept {
        if (p) filen_bridge_free(p);
    }
};

// RAII guard that frees both data and error pointers of an FfiResult.
struct FfiResultGuard {
    FfiResult r;
    explicit FfiResultGuard(FfiResult result) : r(result) {}
    ~FfiResultGuard() {
        if (r.data)  filen_bridge_free_string(r.data);
        if (r.error) filen_bridge_free_string(r.error);
    }
    FfiResultGuard(const FfiResultGuard&) = delete;
    FfiResultGuard& operator=(const FfiResultGuard&) = delete;
};

// ── JSON builder for constructing param strings ────────────────────
// Builds a JSON object from typed C++ values to pass to Rust FFI.

class JsonBuilder {
    std::ostringstream ss_;
    bool first_ = true;

    void sep() { if (!first_) ss_ << ','; first_ = false; }

public:
    static std::string escape(const std::string& s) {
        std::string r;
        r.reserve(s.size());
        for (char c : s) {
            switch (c) {
                case '"':  r += "\\\""; break;
                case '\\': r += "\\\\"; break;
                case '\b': r += "\\b"; break;
                case '\f': r += "\\f"; break;
                case '\n': r += "\\n"; break;
                case '\r': r += "\\r"; break;
                case '\t': r += "\\t"; break;
                default:
                    if (static_cast<unsigned char>(c) < 0x20) {
                        char buf[8];
                        snprintf(buf, sizeof(buf), "\\u%04x", static_cast<unsigned char>(c));
                        r += buf;
                    } else {
                        r += c;
                    }
            }
        }
        return r;
    }

public:
    JsonBuilder() { ss_ << '{'; }

    JsonBuilder& str(const char* key, const std::string& val) {
        sep(); ss_ << '"' << key << "\":\"" << escape(val) << '"';
        return *this;
    }

    JsonBuilder& str(const char* key, const std::optional<std::string>& val) {
        if (val.has_value()) return str(key, *val);
        return *this;
    }

    JsonBuilder& num(const char* key, double val) {
        sep(); ss_ << '"' << key << "\":" << val;
        return *this;
    }

    JsonBuilder& boolean(const char* key, bool val) {
        sep(); ss_ << '"' << key << "\":" << (val ? "true" : "false");
        return *this;
    }

    JsonBuilder& raw(const char* key, const std::string& rawJson) {
        sep(); ss_ << '"' << key << "\":" << rawJson;
        return *this;
    }

    std::string build() {
        ss_ << '}';
        return ss_.str();
    }
};

class HybridFilenSdkBridge : public HybridObject {
public:
    HybridFilenSdkBridge()
        : HybridObject(TAG)
        , bridge_(filen_bridge_new(), BridgeDeleter{}) {}

    ~HybridFilenSdkBridge() override = default;

    // Non-copyable
    HybridFilenSdkBridge(const HybridFilenSdkBridge&) = delete;
    HybridFilenSdkBridge& operator=(const HybridFilenSdkBridge&) = delete;

public:
    void loadHybridMethods() override {
        HybridObject::loadHybridMethods();
        registerHybrids(this, [](Prototype& proto) {
            // Auth
            proto.registerHybridMethod("login", &HybridFilenSdkBridge::login);
            proto.registerHybridMethod("register", &HybridFilenSdkBridge::register_);
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
    // Helper: call a Rust FFI function that returns a string.
    // Captures bridge_ as shared_ptr so the Rust handle outlives the async lambda.
    using FfiFn = FfiResult(*)(const FilenMobileSdkBridge*, const char*);

    std::shared_ptr<Promise<std::string>> callString(FfiFn fn, const std::string& paramsJson) {
        auto b = bridge_; // shared_ptr copy — prevents use-after-free
        return Promise<std::string>::async([b, fn, paramsJson]() -> std::string {
            FfiResultGuard g{fn(b.get(), paramsJson.c_str())};
            if (g.r.error) throw std::runtime_error(std::string(g.r.error));
            return std::string(g.r.data ? g.r.data : "");
        });
    }

    // Helper: call a Rust FFI function that returns void.
    std::shared_ptr<Promise<void>> callVoid(FfiFn fn, const std::string& paramsJson) {
        auto b = bridge_; // shared_ptr copy
        return Promise<void>::async([b, fn, paramsJson]() {
            FfiResultGuard g{fn(b.get(), paramsJson.c_str())};
            if (g.r.error) throw std::runtime_error(std::string(g.r.error));
        });
    }

    // Helper: call Rust FFI, parse JSON result into a ResultObj on background thread.
    // Nitro auto-converts the map/variant types to JSI on the JS thread (fast).
    std::shared_ptr<Promise<ResultObj>> callResultObj(FfiFn fn, const std::string& paramsJson) {
        auto b = bridge_;
        return Promise<ResultObj>::async([b, fn, paramsJson]() -> ResultObj {
            FfiResultGuard g{fn(b.get(), paramsJson.c_str())};
            if (g.r.error) throw std::runtime_error(std::string(g.r.error));
            std::string json(g.r.data ? g.r.data : "{}");
            return JsonParser(json).parseResultObject();
        });
    }

    // Helper: call Rust FFI, parse JSON array of flat objects on background thread.
    std::shared_ptr<Promise<ObjArray>> callArray(FfiFn fn, const std::string& paramsJson) {
        auto b = bridge_;
        return Promise<ObjArray>::async([b, fn, paramsJson]() -> ObjArray {
            FfiResultGuard g{fn(b.get(), paramsJson.c_str())};
            if (g.r.error) throw std::runtime_error(std::string(g.r.error));
            std::string json(g.r.data ? g.r.data : "[]");
            return JsonParser(json).parseArray();
        });
    }

    // ── Method implementations ───────────────────���──────────────────────

    // Auth
    std::shared_ptr<Promise<std::string>> login(const std::string& email, const std::string& password, std::optional<std::string> twoFactorCode) {
        return callString(filen_bridge_login, JsonBuilder().str("email", email).str("password", password).str("twoFactorCode", twoFactorCode).build());
    }
    std::shared_ptr<Promise<void>> register_(const std::string& email, const std::string& password) {
        return callVoid(filen_bridge_register, JsonBuilder().str("email", email).str("password", password).build());
    }
    std::shared_ptr<Promise<void>> reinitSDK(const std::string& p) { return callVoid(filen_bridge_reinit_sdk, p); }
    std::shared_ptr<Promise<void>> resendConfirmation(const std::string& email) {
        return callVoid(filen_bridge_resend_confirmation, JsonBuilder().str("email", email).build());
    }
    std::shared_ptr<Promise<void>> forgotPassword(const std::string& email) {
        return callVoid(filen_bridge_forgot_password, JsonBuilder().str("email", email).build());
    }

    // Cloud: Dirs
    std::shared_ptr<Promise<std::string>> createDirectory(const std::string& parent, const std::string& name) {
        return callString(filen_bridge_create_directory, JsonBuilder().str("parent", parent).str("name", name).build());
    }
    std::shared_ptr<Promise<std::string>> getDirectory(const std::string& uuid) {
        return callString(filen_bridge_get_directory, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> deleteDirectory(const std::string& uuid) {
        return callVoid(filen_bridge_delete_directory, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> trashDirectory(const std::string& uuid) {
        return callVoid(filen_bridge_trash_directory, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> restoreDirectory(const std::string& uuid) {
        return callVoid(filen_bridge_restore_directory, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> directoryExists(const std::string& name, const std::string& parent) {
        return callString(filen_bridge_directory_exists, JsonBuilder().str("name", name).str("parent", parent).build());
    }
    std::shared_ptr<Promise<void>> renameDirectory(const std::string& uuid, const std::string& name) {
        return callVoid(filen_bridge_rename_directory, JsonBuilder().str("uuid", uuid).str("name", name).build());
    }
    std::shared_ptr<Promise<void>> moveDirectory(const std::string& uuid, const std::string& to) {
        return callVoid(filen_bridge_move_directory, JsonBuilder().str("uuid", uuid).str("to", to).build());
    }
    std::shared_ptr<Promise<void>> changeDirectoryColor(const std::string& uuid, const std::string& color) {
        return callVoid(filen_bridge_change_directory_color, JsonBuilder().str("uuid", uuid).str("color", color).build());
    }
    std::shared_ptr<Promise<void>> favoriteDirectory(const std::string& uuid, bool favorite) {
        return callVoid(filen_bridge_favorite_directory, JsonBuilder().str("uuid", uuid).boolean("favorite", favorite).build());
    }
    std::shared_ptr<Promise<void>> editDirectoryMetadata(const std::string& uuid, const std::string& metadataName) {
        return callVoid(filen_bridge_edit_directory_metadata,
            std::string("{\"uuid\":\"") + JsonBuilder::escape(uuid) + "\",\"metadata\":{\"name\":\"" + JsonBuilder::escape(metadataName) + "\"}}");
    }
    std::shared_ptr<Promise<std::string>> fetchDirectorySize(const std::string& uuid) {
        return callString(filen_bridge_fetch_directory_size, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> getDirectoryTree(const std::string& uuid) {
        return callString(filen_bridge_get_directory_tree, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> directoryUUIDToPath(const std::string& uuid) {
        return callString(filen_bridge_directory_uuid_to_path, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> directoryPublicLinkStatus(const std::string& uuid) {
        return callString(filen_bridge_directory_public_link_status, JsonBuilder().str("uuid", uuid).build());
    }

    // Cloud: Files
    std::shared_ptr<Promise<std::string>> getFile(const std::string& uuid) {
        return callString(filen_bridge_get_file, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> deleteFile(const std::string& uuid) {
        return callVoid(filen_bridge_delete_file, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> trashFile(const std::string& uuid) {
        return callVoid(filen_bridge_trash_file, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> restoreFile(const std::string& uuid) {
        return callVoid(filen_bridge_restore_file, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> fileExists(const std::string& name, const std::string& parent) {
        return callString(filen_bridge_file_exists, JsonBuilder().str("name", name).str("parent", parent).build());
    }
    std::shared_ptr<Promise<void>> renameFile(const std::string& uuid, const std::string& name) {
        return callVoid(filen_bridge_rename_file, JsonBuilder().str("uuid", uuid).str("name", name).build());
    }
    std::shared_ptr<Promise<void>> moveFile(const std::string& uuid, const std::string& to) {
        return callVoid(filen_bridge_move_file, JsonBuilder().str("uuid", uuid).str("to", to).build());
    }
    std::shared_ptr<Promise<void>> favoriteFile(const std::string& uuid, bool favorite) {
        return callVoid(filen_bridge_favorite_file, JsonBuilder().str("uuid", uuid).boolean("favorite", favorite).build());
    }
    std::shared_ptr<Promise<void>> editFileMetadata(const std::string& uuid, const std::string& metadataName, std::optional<std::string> metadataMime) {
        std::string metaObj = "{\"name\":\"" + JsonBuilder::escape(metadataName) + "\"";
        if (metadataMime.has_value()) {
            metaObj += ",\"mime\":\"" + JsonBuilder::escape(*metadataMime) + "\"";
        }
        metaObj += "}";
        return callVoid(filen_bridge_edit_file_metadata, JsonBuilder().str("uuid", uuid).raw("metadata", metaObj).build());
    }
    std::shared_ptr<Promise<std::string>> fileUUIDToPath(const std::string& uuid) {
        return callString(filen_bridge_file_uuid_to_path, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> filePublicLinkStatus(const std::string& uuid) {
        return callString(filen_bridge_file_public_link_status, JsonBuilder().str("uuid", uuid).build());
    }

    // Cloud: Listing
    std::shared_ptr<Promise<ObjArray>> fetchCloudItems(const std::string& of, const std::string& parent, double receiverId) {
        return callArray(filen_bridge_fetch_cloud_items, JsonBuilder().str("of", of).str("parent", parent).num("receiverId", receiverId).build());
    }
    std::shared_ptr<Promise<std::string>> queryGlobalSearch(const std::string& query) {
        // Rust expects either a bare JSON string or the raw value
        return callString(filen_bridge_query_global_search, "\"" + JsonBuilder::escape(query) + "\"");
    }

    // Cloud: Public links & sharing (complex params — keep JSON)
    std::shared_ptr<Promise<std::string>> toggleItemPublicLink(const std::string& p) { return callString(filen_bridge_toggle_item_public_link, p); }
    std::shared_ptr<Promise<void>> stopSharingItem(const std::string& uuid, double receiverId) {
        return callVoid(filen_bridge_stop_sharing_item, JsonBuilder().str("uuid", uuid).num("receiverId", receiverId).build());
    }
    std::shared_ptr<Promise<void>> removeSharedItem(const std::string& uuid) {
        return callVoid(filen_bridge_remove_shared_item, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> shareItems(const std::string& p) { return callVoid(filen_bridge_share_items, p); }
    std::shared_ptr<Promise<void>> editItemPublicLink(const std::string& p) { return callVoid(filen_bridge_edit_item_public_link, p); }
    std::shared_ptr<Promise<std::string>> filePublicLinkInfo(const std::string& p) { return callString(filen_bridge_file_public_link_info, p); }
    std::shared_ptr<Promise<std::string>> filePublicLinkHasPassword(const std::string& p) { return callString(filen_bridge_file_public_link_has_password, p); }
    std::shared_ptr<Promise<std::string>> directoryPublicLinkInfo(const std::string& p) { return callString(filen_bridge_directory_public_link_info, p); }
    std::shared_ptr<Promise<std::string>> directorySizePublicLink(const std::string& p) { return callString(filen_bridge_directory_size_public_link, p); }
    std::shared_ptr<Promise<std::string>> fetchFileVersions(const std::string& p) { return callString(filen_bridge_fetch_file_versions, p); }
    std::shared_ptr<Promise<void>> restoreFileVersion(const std::string& p) { return callVoid(filen_bridge_restore_file_version, p); }
    std::shared_ptr<Promise<std::string>> decryptDirectoryPublicLinkKey(const std::string& metadata) {
        return callString(filen_bridge_decrypt_directory_public_link_key, JsonBuilder().str("metadata", metadata).build());
    }

    // Contacts
    std::shared_ptr<Promise<std::string>> fetchContacts(const std::string& type) {
        return callString(filen_bridge_fetch_contacts, JsonBuilder().str("type", type).build());
    }
    std::shared_ptr<Promise<std::string>> fetchIncomingContactRequests() {
        return callString(filen_bridge_fetch_incoming_contact_requests, "{}");
    }
    std::shared_ptr<Promise<std::string>> fetchOutgoingContactRequests() {
        return callString(filen_bridge_fetch_outgoing_contact_requests, "{}");
    }
    std::shared_ptr<Promise<void>> acceptContactRequest(const std::string& uuid) {
        return callVoid(filen_bridge_accept_contact_request, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> denyContactRequest(const std::string& uuid) {
        return callVoid(filen_bridge_deny_contact_request, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> sendContactRequest(const std::string& email) {
        return callVoid(filen_bridge_send_contact_request, JsonBuilder().str("email", email).build());
    }
    std::shared_ptr<Promise<void>> removeContact(const std::string& uuid) {
        return callVoid(filen_bridge_remove_contact, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> blockContact(const std::string& email) {
        return callVoid(filen_bridge_block_contact, JsonBuilder().str("email", email).build());
    }
    std::shared_ptr<Promise<void>> unblockContact(const std::string& uuid) {
        return callVoid(filen_bridge_unblock_contact, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> deleteOutgoingContactRequest(const std::string& uuid) {
        return callVoid(filen_bridge_delete_outgoing_contact_request, JsonBuilder().str("uuid", uuid).build());
    }

    // Chats
    std::shared_ptr<Promise<std::string>> fetchChats() { return callString(filen_bridge_fetch_chats, "{}"); }
    std::shared_ptr<Promise<std::string>> createChat(const std::string& p) { return callString(filen_bridge_create_chat, p); }
    std::shared_ptr<Promise<void>> deleteChat(const std::string& uuid) {
        return callVoid(filen_bridge_delete_chat, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> leaveChat(const std::string& uuid) {
        return callVoid(filen_bridge_leave_chat, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> sendChatMessage(const std::string& p) { return callString(filen_bridge_send_chat_message, p); }
    std::shared_ptr<Promise<void>> editChatMessage(const std::string& conversation, const std::string& uuid, const std::string& message) {
        return callVoid(filen_bridge_edit_chat_message, JsonBuilder().str("conversation", conversation).str("uuid", uuid).str("message", message).build());
    }
    std::shared_ptr<Promise<void>> deleteChatMessage(const std::string& conversation, const std::string& uuid) {
        return callVoid(filen_bridge_delete_chat_message, JsonBuilder().str("conversation", conversation).str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> disableChatMessageEmbeds(const std::string& uuid, const std::string& conversation) {
        return callVoid(filen_bridge_disable_chat_message_embeds, JsonBuilder().str("uuid", uuid).str("conversation", conversation).build());
    }
    std::shared_ptr<Promise<void>> editChatName(const std::string& conversation, const std::string& name) {
        return callVoid(filen_bridge_edit_chat_name, JsonBuilder().str("conversation", conversation).str("name", name).build());
    }
    std::shared_ptr<Promise<void>> sendChatTyping(const std::string& conversation, const std::string& type) {
        return callVoid(filen_bridge_send_chat_typing, JsonBuilder().str("conversation", conversation).str("type", type).build());
    }
    std::shared_ptr<Promise<void>> chatMarkAsRead(const std::string& uuid) {
        return callVoid(filen_bridge_chat_mark_as_read, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> chatOnline(const std::string& uuid) {
        return callString(filen_bridge_chat_online, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> chatUnread() { return callString(filen_bridge_chat_unread, "{}"); }
    std::shared_ptr<Promise<std::string>> chatUnreadCount(const std::string& uuid) {
        return callString(filen_bridge_chat_unread_count, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> addChatParticipant(const std::string& p) { return callVoid(filen_bridge_add_chat_participant, p); }
    std::shared_ptr<Promise<void>> removeChatParticipant(const std::string& p) { return callVoid(filen_bridge_remove_chat_participant, p); }
    std::shared_ptr<Promise<ObjArray>> fetchChatMessages(const std::string& conversation, double timestamp) {
        return callArray(filen_bridge_fetch_chat_messages, JsonBuilder().str("conversation", conversation).num("timestamp", timestamp).build());
    }
    std::shared_ptr<Promise<std::string>> fetchChatsLastFocus() { return callString(filen_bridge_fetch_chats_last_focus, "{}"); }
    std::shared_ptr<Promise<void>> updateChatsLastFocus(const std::string& p) { return callVoid(filen_bridge_update_chats_last_focus, p); }
    std::shared_ptr<Promise<void>> muteChat(const std::string& conversation, bool mute) {
        return callVoid(filen_bridge_mute_chat, JsonBuilder().str("conversation", conversation).boolean("mute", mute).build());
    }
    std::shared_ptr<Promise<std::string>> decryptChatMessage(const std::string& conversation, const std::string& message) {
        return callString(filen_bridge_decrypt_chat_message, JsonBuilder().str("conversation", conversation).str("message", message).build());
    }

    // Notes
    std::shared_ptr<Promise<std::string>> fetchNotes() { return callString(filen_bridge_fetch_notes, "{}"); }
    std::shared_ptr<Promise<std::string>> fetchNoteContent(const std::string& uuid) {
        return callString(filen_bridge_fetch_note_content, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> createNote(std::optional<std::string> title) {
        auto b = JsonBuilder();
        b.str("title", title);
        return callString(filen_bridge_create_note, b.build());
    }
    std::shared_ptr<Promise<void>> deleteNote(const std::string& uuid) {
        return callVoid(filen_bridge_delete_note, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> archiveNote(const std::string& uuid) {
        return callVoid(filen_bridge_archive_note, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> trashNote(const std::string& uuid) {
        return callVoid(filen_bridge_trash_note, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> restoreNote(const std::string& uuid) {
        return callVoid(filen_bridge_restore_note, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<std::string>> duplicateNote(const std::string& uuid) {
        return callString(filen_bridge_duplicate_note, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> renameNote(const std::string& uuid, const std::string& title) {
        return callVoid(filen_bridge_rename_note, JsonBuilder().str("uuid", uuid).str("title", title).build());
    }
    std::shared_ptr<Promise<void>> editNote(const std::string& uuid, const std::string& content, const std::string& preview) {
        return callVoid(filen_bridge_edit_note, JsonBuilder().str("uuid", uuid).str("content", content).str("preview", preview).build());
    }
    std::shared_ptr<Promise<void>> changeNoteType(const std::string& uuid, const std::string& type, std::optional<std::string> content) {
        return callVoid(filen_bridge_change_note_type, JsonBuilder().str("uuid", uuid).str("type", type).str("content", content).build());
    }
    std::shared_ptr<Promise<void>> pinNote(const std::string& uuid, bool pin) {
        return callVoid(filen_bridge_pin_note, JsonBuilder().str("uuid", uuid).boolean("pin", pin).build());
    }
    std::shared_ptr<Promise<void>> favoriteNote(const std::string& uuid, bool favorite) {
        return callVoid(filen_bridge_favorite_note, JsonBuilder().str("uuid", uuid).boolean("favorite", favorite).build());
    }
    std::shared_ptr<Promise<std::string>> fetchNoteHistory(const std::string& uuid) {
        return callString(filen_bridge_fetch_note_history, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> restoreNoteHistory(const std::string& uuid, double id) {
        return callVoid(filen_bridge_restore_note_history, JsonBuilder().str("uuid", uuid).num("id", id).build());
    }
    std::shared_ptr<Promise<void>> addNoteParticipant(const std::string& uuid, const std::string& contactUuid, bool permissionsWrite) {
        return callVoid(filen_bridge_add_note_participant, JsonBuilder().str("uuid", uuid).str("contactUuid", contactUuid).boolean("permissionsWrite", permissionsWrite).build());
    }
    std::shared_ptr<Promise<void>> removeNoteParticipant(const std::string& uuid, double userId) {
        return callVoid(filen_bridge_remove_note_participant, JsonBuilder().str("uuid", uuid).num("userId", userId).build());
    }
    std::shared_ptr<Promise<void>> changeNoteParticipantPermissions(const std::string& uuid, double userId, bool permissionsWrite) {
        return callVoid(filen_bridge_change_note_participant_permissions, JsonBuilder().str("uuid", uuid).num("userId", userId).boolean("permissionsWrite", permissionsWrite).build());
    }
    std::shared_ptr<Promise<std::string>> fetchNotesTags() { return callString(filen_bridge_fetch_notes_tags, "{}"); }
    std::shared_ptr<Promise<std::string>> createNoteTag(const std::string& name) {
        return callString(filen_bridge_create_note_tag, JsonBuilder().str("name", name).build());
    }
    std::shared_ptr<Promise<void>> deleteNoteTag(const std::string& uuid) {
        return callVoid(filen_bridge_delete_note_tag, JsonBuilder().str("uuid", uuid).build());
    }
    std::shared_ptr<Promise<void>> renameNoteTag(const std::string& uuid, const std::string& name) {
        return callVoid(filen_bridge_rename_note_tag, JsonBuilder().str("uuid", uuid).str("name", name).build());
    }
    std::shared_ptr<Promise<void>> favoriteNoteTag(const std::string& uuid, bool favorite) {
        return callVoid(filen_bridge_favorite_note_tag, JsonBuilder().str("uuid", uuid).boolean("favorite", favorite).build());
    }
    std::shared_ptr<Promise<void>> tagNote(const std::string& uuid, const std::string& tag) {
        return callVoid(filen_bridge_tag_note, JsonBuilder().str("uuid", uuid).str("tag", tag).build());
    }
    std::shared_ptr<Promise<void>> untagNote(const std::string& uuid, const std::string& tag) {
        return callVoid(filen_bridge_untag_note, JsonBuilder().str("uuid", uuid).str("tag", tag).build());
    }

    // User
    std::shared_ptr<Promise<std::string>> enableTwoFactorAuthentication(std::optional<std::string> twoFactorCode) {
        auto b = JsonBuilder();
        b.str("twoFactorCode", twoFactorCode);
        return callString(filen_bridge_enable_two_factor_authentication, b.build());
    }
    std::shared_ptr<Promise<void>> disableTwoFactorAuthentication(std::optional<std::string> twoFactorCode) {
        auto b = JsonBuilder();
        b.str("twoFactorCode", twoFactorCode);
        return callVoid(filen_bridge_disable_two_factor_authentication, b.build());
    }
    std::shared_ptr<Promise<void>> deleteAccount(std::optional<std::string> twoFactorCode) {
        auto b = JsonBuilder();
        b.str("twoFactorCode", twoFactorCode);
        return callVoid(filen_bridge_delete_account, b.build());
    }
    std::shared_ptr<Promise<std::string>> fetchUserPublicKey(const std::string& email) {
        return callString(filen_bridge_fetch_user_public_key, JsonBuilder().str("email", email).build());
    }
    std::shared_ptr<Promise<void>> didExportMasterKeys() { return callVoid(filen_bridge_did_export_master_keys, "{}"); }
    std::shared_ptr<Promise<std::string>> fetchAccount() { return callString(filen_bridge_fetch_account, "{}"); }
    std::shared_ptr<Promise<void>> changePassword(const std::string& currentPassword, const std::string& newPassword) {
        return callVoid(filen_bridge_change_password, JsonBuilder().str("currentPassword", currentPassword).str("newPassword", newPassword).build());
    }
    std::shared_ptr<Promise<void>> updatePersonalInformation(const std::string& p) { return callVoid(filen_bridge_update_personal_information, p); }
    std::shared_ptr<Promise<void>> updateNickname(const std::string& p) { return callVoid(filen_bridge_update_nickname, p); }
    std::shared_ptr<Promise<void>> changeEmail(const std::string& p) { return callVoid(filen_bridge_change_email, p); }
    std::shared_ptr<Promise<std::string>> fetchGDPR() { return callString(filen_bridge_fetch_gdpr, "{}"); }
    std::shared_ptr<Promise<void>> toggleVersioning(bool enable) {
        return callVoid(filen_bridge_toggle_versioning, JsonBuilder().boolean("enable", enable).build());
    }
    std::shared_ptr<Promise<void>> toggleLoginAlerts(bool enable) {
        return callVoid(filen_bridge_toggle_login_alerts, JsonBuilder().boolean("enable", enable).build());
    }
    std::shared_ptr<Promise<void>> deleteAllVersionedFiles() { return callVoid(filen_bridge_delete_all_versioned_files, "{}"); }
    std::shared_ptr<Promise<void>> deleteEverything() { return callVoid(filen_bridge_delete_everything, "{}"); }
    std::shared_ptr<Promise<std::string>> fetchEvents(const std::string& p) { return callString(filen_bridge_fetch_events, p); }
    std::shared_ptr<Promise<std::string>> fetchEvent(const std::string& p) { return callString(filen_bridge_fetch_event, p); }
    std::shared_ptr<Promise<void>> uploadAvatar(const std::string& uri) {
        return callVoid(filen_bridge_upload_avatar, JsonBuilder().str("uri", uri).build());
    }

    // FS
    std::shared_ptr<Promise<std::string>> readFileAsString(const std::string& path) {
        return callString(filen_bridge_read_file_as_string, JsonBuilder().str("path", path).build());
    }
    std::shared_ptr<Promise<void>> writeFileAsString(const std::string& path, const std::string& content) {
        return callVoid(filen_bridge_write_file_as_string, JsonBuilder().str("path", path).str("content", content).build());
    }

    // Transfers (complex params — keep JSON for upload/download)
    std::shared_ptr<Promise<std::string>> uploadFile(const std::string& p) { return callString(filen_bridge_upload_file, p); }
    std::shared_ptr<Promise<void>> downloadFile(const std::string& p) { return callVoid(filen_bridge_download_file, p); }
    std::shared_ptr<Promise<void>> uploadDirectory(const std::string& p) { return callVoid(filen_bridge_upload_directory, p); }
    std::shared_ptr<Promise<void>> downloadDirectory(const std::string& p) { return callVoid(filen_bridge_download_directory, p); }
    std::shared_ptr<Promise<std::string>> transferAction(const std::string& id, const std::string& action) {
        return callString(filen_bridge_transfer_action, JsonBuilder().str("id", id).str("action", action).build());
    }
    std::shared_ptr<Promise<ResultObj>> fetchTransfers() { return callResultObj(filen_bridge_fetch_transfers, "{}"); }

    // HTTP Server
    std::shared_ptr<Promise<std::string>> startHttpServer() { return callString(filen_bridge_start_http_server, "{}"); }
    std::shared_ptr<Promise<void>> stopHttpServer() { return callVoid(filen_bridge_stop_http_server, "{}"); }
    std::shared_ptr<Promise<std::string>> restartHTTPServer() { return callString(filen_bridge_restart_http_server, "{}"); }
    std::shared_ptr<Promise<std::string>> httpStatus() { return callString(filen_bridge_http_status, "{}"); }


private:
    std::shared_ptr<FilenMobileSdkBridge> bridge_;
    static constexpr auto TAG = "FilenSdkBridge";
};

} // namespace margelo::nitro::filensdk
