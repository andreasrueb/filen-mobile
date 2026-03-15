# Rust SDK Bridge Migration

Replacing the Node.js worker (`nodejs-mobile-react-native`) with a Rust SDK bridge via uniffi + Expo Module.

## Architecture

```
Current:  RN JS  --[message IPC]--> nodejs-mobile --> @filen/sdk (TS) + Express HTTP server
Target:   RN JS  --[Expo Module]--> Swift/Kotlin (uniffi) --> filen-mobile-sdk-bridge (Rust) --> filen-sdk-rs
```

## Migration Phases

### Phase 0: Foundation — DONE
Auth handlers: `login`, `register`, `reinitSDK`, `resendConfirmation`, `forgotPassword`

### Phase 1: Cloud Operations — DONE
30 cloud handlers migrated to Rust. See [Phase 1 details](#phase-1-details) below.

### Phase 2: Chats, Notes, Contacts, User — NOT STARTED
- 20 chat handlers
- 25 note handlers
- 10 contact handlers
- 18 user/account handlers
- 2 crypto handlers, 2 fs handlers

### Phase 3: Transfers — NOT STARTED
- `uploadFile`, `downloadFile`, `uploadDirectory`, `downloadDirectory`
- `transferAction` (stop/pause/resume), `fetchTransfers`
- TransferManager in Rust with abort/pause/resume via tokio channels
- TransferStateCallback → Expo Module events → Zustand store

### Phase 4: HTTP Streaming Server — NOT STARTED
- Axum server replacing Express (video/audio playback with range requests)
- `startHttpServer`, `stopHttpServer`, `restartHTTPServer`, `httpStatus`

### Phase 5: Remove Node Worker — NOT STARTED
- Remove `nodejs-mobile-react-native` dependency
- Remove `nodejs-assets/nodejs-project/`
- Remove adapter pattern fallback in `lib/filenBridge/`

---

## Phase 1 Details

### Migrated (going through Rust bridge)

| Category | Functions |
|----------|-----------|
| **Directory CRUD** | `createDirectory`, `getDirectory`, `deleteDirectory`, `trashDirectory`, `restoreDirectory` |
| **Directory ops** | `renameDirectory`, `moveDirectory`, `changeDirectoryColor`, `favoriteDirectory`, `editDirectoryMetadata` |
| **Directory info** | `fetchDirectorySize`, `getDirectoryTree`, `directoryUUIDToPath`, `directoryExists` |
| **File CRUD** | `getFile`, `deleteFile`, `trashFile`, `restoreFile` |
| **File ops** | `renameFile`, `moveFile`, `favoriteFile`, `editFileMetadata` |
| **File info** | `fileUUIDToPath`, `fileExists` |
| **Listing** | `fetchCloudItems` (drive, sharedIn, photos, favorites, recents, trash, links) |
| **Search** | `queryGlobalSearch` |
| **Public links** | `filePublicLinkStatus`, `directoryPublicLinkStatus`, `toggleItemPublicLink` |
| **Sharing** | `stopSharingItem`, `removeSharedItem` |

### Still on Node Worker (Phase 1 scope)

These functions remain on the Node worker because the Rust SDK's internal API layer (`api` module) is `pub(crate)` and can't be called from the bridge crate.

| Function | Reason | Fix |
|----------|--------|-----|
| `fetchCloudItems("sharedOut")` | Needs `Contact` struct with full fields for `list_out_shared_dir` | Add a `list_out_shared_by_id(uuid, receiver_id)` method to SDK |
| `shareItems` | Needs `Contact` with RSA public key for metadata encryption | Add a `share_items_by_email(items, email)` method to SDK |
| `editItemPublicLink` | API call via `pub(crate)` `post_auth_request_empty` | Expose as public method on Client |
| `filePublicLinkInfo` | API call + metadata decryption, `pub(crate)` API layer | Expose as public method on Client |
| `filePublicLinkHasPassword` | API call via `pub(crate)` layer | Expose as public method on Client |
| `directoryPublicLinkInfo` | API call + metadata decryption, `pub(crate)` API layer | Expose as public method on Client |
| `directorySizePublicLink` | API call, type not defined in filen-types | Add type + expose method |
| `fileVersions` | API call, type not defined in filen-types | Add type + expose method |
| `restoreFileVersion` | API call + `editFileMetadata`, type not defined | Add type + expose method |

**How to fix all of these:** Add public wrapper methods to `filen-sdk-rs` (we own the submodule). Each is a thin wrapper around an existing `pub(crate)` API call. The types mostly already exist in `filen-types`.

### Not cloud operations (stay on Node worker regardless)

| Function | Reason |
|----------|--------|
| `fetchCloudItems("offline")` | Local SQLite query in JS, never hits Node worker |
| `ping` | Node worker health check, irrelevant after Phase 5 |

---

## Key Files

| File | Purpose |
|------|---------|
| `filen-rs/filen-mobile-sdk-bridge/src/` | Rust crate: auth.rs, cloud.rs, state.rs, env.rs, error.rs |
| `modules/filen-sdk-bridge/` | Expo Module: Swift, Kotlin, JS bindings |
| `lib/filenBridge/index.ts` | JS adapter: routes to Rust or Node worker |
| `plugins/withSdkBridge.ts` | Build plugin: compiles Rust, creates xcframework |

## Call Site Migration Status

Files fully switched to `filenBridge.proxy()`:
- `queries/useDriveItems.query.ts`
- `queries/useItemPath.query.ts`
- `queries/useItemPublicLinkStatus.query.ts`
- `queries/useDirectorySize.query.ts`
- `queries/usePlaylists.query.ts`
- `queries/useCameraUploadParent.query.ts`
- `components/drive/header/search.tsx`
- `components/drive/list/listItem/index.tsx`
- `components/trackPlayer/item.tsx`
- `app/photosSettings/index.tsx`

Files using both `filenBridge` and `nodeWorker`:
- `services/drive.service.ts` — `shareItems` still on Node
- `services/chats.service.ts` — chat handlers still on Node
- `components/editPublicLink/content.tsx` — `editItemPublicLink`, `decryptDirectoryPublicLinkKey` still on Node
- `components/fileVersionHistory/list/item/rightView.tsx` — `restoreFileVersion` still on Node
- `lib/cameraUpload.ts` — `ping` still on Node

Files still using `nodeWorker` only (not yet migrated handler categories):
- `services/contacts.service.ts` — Phase 2
- `services/notes.service.ts` — Phase 2
- `services/user.service.ts` — Phase 2
- `lib/upload.ts` / `lib/download.ts` — Phase 3
- Various chat/note/user query files — Phase 2
