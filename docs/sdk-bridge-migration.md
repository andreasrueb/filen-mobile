# Rust SDK Bridge Migration — COMPLETE

All phases finished. The Node.js worker (`nodejs-mobile-react-native`) has been fully replaced by a Rust SDK bridge via uniffi + Expo Module.

## Architecture

```
RN JS  --[Expo Module]--> Swift/Kotlin (uniffi) --> filen-mobile-sdk-bridge (Rust) --> filen-sdk-rs
```

## Migration Phases

### Phase 0: Foundation — DONE
Auth handlers: `login`, `register`, `reinitSDK`, `resendConfirmation`, `forgotPassword`

### Phase 1: Cloud Operations — DONE
31 cloud handlers migrated to Rust.

| Category | Functions |
|----------|-----------|
| **Directory CRUD** | `createDirectory`, `getDirectory`, `deleteDirectory`, `trashDirectory`, `restoreDirectory` |
| **Directory ops** | `renameDirectory`, `moveDirectory`, `changeDirectoryColor`, `favoriteDirectory`, `editDirectoryMetadata` |
| **Directory info** | `fetchDirectorySize`, `getDirectoryTree`, `directoryUUIDToPath`, `directoryExists` |
| **File CRUD** | `getFile`, `deleteFile`, `trashFile`, `restoreFile` |
| **File ops** | `renameFile`, `moveFile`, `favoriteFile`, `editFileMetadata` |
| **File info** | `fileUUIDToPath`, `fileExists` |
| **Listing** | `fetchCloudItems` (drive, sharedIn, sharedOut, photos, favorites, recents, trash, links, offline) |
| **Search** | `queryGlobalSearch` |
| **Public links** | `filePublicLinkStatus`, `directoryPublicLinkStatus`, `toggleItemPublicLink` |
| **Sharing** | `stopSharingItem`, `removeSharedItem` |

### Phase 2: Chats, Notes, Contacts, User — DONE
77 handlers migrated (2a–2e).

- **2a: Contacts (10)** — DONE
- **2b: Chats + decryptChatMessage (21)** — DONE
- **2c: Notes (25)** — DONE
- **2d: User subset + FS (9)** — DONE
- **2e: User rest (12)** — DONE (completed in Phase 5)

### Phase 3: Transfers — DONE
6 handlers migrated.

| Function | Description | Returns |
|----------|-------------|---------|
| `uploadFile` | Upload single file with progress, cancel/pause | `DriveCloudItem` JSON |
| `downloadFile` | Download single file with progress, cancel/pause | `void` |
| `uploadDirectory` | Recursive directory upload with aggregated progress | `void` |
| `downloadDirectory` | Recursive directory download (semaphore-limited concurrency) | `void` |
| `transferAction` | Stop/pause/resume a transfer by ID | `"true"` / `"false"` |
| `fetchTransfers` | Poll current transfer state | JSON with transfers, finished, speed, remaining, progress |

Transfer state lives entirely in Rust (`TransferManager`). Cancel/pause/resume via `AtomicBool` + `Notify`.

### Phase 4: HTTP Streaming Server — DONE
hyper 1.x server replacing Express (video/audio playback with range requests).

| Route | Auth | Response |
|-------|------|----------|
| `GET /ping` | Bearer token or `?auth=` | 200 `pong` |
| `GET /stream?file=<base64(json)>` | Bearer token or `?auth=` | 200 (full) or 206 (range) streaming body |

Key details: shared `Arc<RwLock<Option<Client>>>`, port selection 49152–65000, 64-char hex auth token, graceful shutdown via oneshot channel.

### Phase 5: Remove Node Worker — DONE
- Migrated remaining ~20 handlers to Rust bridge via direct API calls (`authed_post`, `unauthed_post`, `authed_get` helpers in `state.rs`)
- Cloud: `shareItems`, `editItemPublicLink`, `filePublicLinkInfo`, `filePublicLinkHasPassword`, `directoryPublicLinkInfo`, `directorySizePublicLink`, `fetchFileVersions`, `restoreFileVersion`, `decryptDirectoryPublicLinkKey`
- User: `updatePersonalInformation`, `updateNickname`, `changeEmail`, `fetchGDPR`, `toggleVersioning`, `toggleLoginAlerts`, `deleteAllVersionedFiles`, `deleteEverything`, `fetchEvents`, `fetchEvent`, `uploadAvatar`
- Fixed `fetchAccount` to call `v3/user/account` (includes `subs`, `plans`, `personal`) instead of `v3/user/info`
- Migrated all ~40 call sites from `nodeWorker` to `filenBridge`
- Routed background upload/download through `filenBridge.proxy()` (removed JS SDK runtime dependency)
- Removed `nodejs-mobile-react-native` dependency
- Deleted `nodejs-assets/nodejs-project/`, `lib/nodeWorker/`, `lib/sdk.ts`, `buildNodeThread.js`
- Simplified `lib/filenBridge/index.ts` (removed MIGRATED_FUNCTIONS, Node fallback paths)
- Moved ambient types to `lib/types/global.d.ts`

### Progress Summary

| Phase | Handlers | Status |
|-------|----------|--------|
| Phase 0: Auth | 5 | DONE |
| Phase 1: Cloud | 31 | DONE |
| Phase 2a: Contacts | 10 | DONE |
| Phase 2b: Chats + Crypto | 21 | DONE |
| Phase 2c: Notes | 25 | DONE |
| Phase 2d: User + FS | 9 | DONE |
| Phase 2e: User rest | 12 | DONE (Phase 5) |
| Phase 3: Transfers | 6 | DONE |
| Phase 4: HTTP Server | 4 | DONE |
| Phase 5: Remove Node | 20 | DONE |
| **Total** | **~131** | **COMPLETE** |

---

## Key Files

| File | Purpose |
|------|---------|
| `filen-rs/filen-mobile-sdk-bridge/src/` | Rust crate: auth.rs, cloud.rs, contacts.rs, chats.rs, notes.rs, user.rs, fs_ops.rs, transfers.rs, http_server.rs, state.rs, env.rs, error.rs |
| `modules/filen-sdk-bridge/` | Expo Module: Swift, Kotlin, JS bindings |
| `lib/filenBridge/index.ts` | JS adapter: routes all calls to Rust Expo Module |
| `lib/types/global.d.ts` | Ambient type declarations (DriveCloudItem, Transfer, etc.) |
| `plugins/withSdkBridge.ts` | Build plugin: compiles Rust, creates xcframework |
