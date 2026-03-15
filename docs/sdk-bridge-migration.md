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

### Phase 2: Chats, Notes, Contacts, User — MOSTLY DONE
65 handlers migrated (2a–2d). 12 handlers deferred (2e).

- **2a: Contacts (10)** — DONE
- **2b: Chats + decryptChatMessage (21)** — DONE
- **2c: Notes (25)** — DONE
- **2d: User subset + FS (9)** — DONE (`enable/disableTwoFactorAuthentication`, `deleteAccount`, `fetchUserPublicKey`, `didExportMasterKeys`, `fetchAccount`, `changePassword`, `readFileAsString`, `writeFileAsString`)
- **2e: User rest (11) + crypto (1)** — DEFERRED (see [Phase 2e deferred](#phase-2e-deferred) below)

### Phase 3: Transfers — DONE
6 handlers migrated. See [Phase 3 details](#phase-3-details) below.

### Phase 4: HTTP Streaming Server — DONE
hyper 1.x server replacing Express (video/audio playback with range requests).
Handlers: `startHttpServer`, `stopHttpServer`, `restartHTTPServer`, `httpStatus`.
See [Phase 4 details](#phase-4-details) below.

### Phase 5: Remove Node Worker — NOT STARTED
- Migrate remaining ~20 Node-only handlers (Phase 2e deferred + cloud edge cases)
- Remove `nodejs-mobile-react-native` dependency
- Remove `nodejs-assets/nodejs-project/`
- Remove adapter pattern fallback in `lib/filenBridge/`

### Progress Summary

| Phase | Handlers | Status |
|-------|----------|--------|
| Phase 0: Auth | 5 | DONE |
| Phase 1: Cloud | 31 | DONE |
| Phase 2a: Contacts | 10 | DONE |
| Phase 2b: Chats + Crypto | 21 | DONE |
| Phase 2c: Notes | 25 | DONE |
| Phase 2d: User + FS | 9 | DONE |
| Phase 2e: User rest | 12 | DEFERRED |
| Phase 3: Transfers | 6 | DONE |
| Phase 4: HTTP Server | 4 | DONE |
| **Total migrated** | **111** | |
| **Remaining on Node** | **~20** | Cloud edge cases (shareItems, publicLinkInfo, fileVersions) + Phase 2e deferred |

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

## Phase 2e Deferred

These handlers stay on the Node worker because they need new type definitions in `filen-types` and/or new API call modules in `filen-sdk-rs`.

| Handler | Reason | Fix |
|---------|--------|-----|
| `updatePersonalInformation` | No public SDK method, needs `filen-types` type | Add type + public method |
| `updateNickname` | No public SDK method, needs `filen-types` type | Add type + public method |
| `changeEmail` | No public SDK method, needs `filen-types` type | Add type + public method |
| `fetchGDPR` | No public SDK method, needs `filen-types` type | Add type + public method |
| `toggleVersioning` | No public SDK method, needs `filen-types` type | Add type + public method |
| `toggleLoginAlerts` | No public SDK method, needs `filen-types` type | Add type + public method |
| `deleteAllVersionedFiles` | No public SDK method, needs `filen-types` type | Add type + public method |
| `deleteEverything` | No public SDK method, needs `filen-types` type | Add type + public method |
| `fetchEvents` | No public SDK method, needs `filen-types` type | Add type + public method |
| `fetchEvent` | No public SDK method, needs `filen-types` type | Add type + public method |
| `uploadAvatar` | Needs file I/O + SDK method, `filen-types` type | Add type + public method |
| `decryptDirectoryPublicLinkKey` | No Rust SDK equivalent for `folderLinkKey` decryption | Investigate SDK support |

---

## Phase 3 Details

### Architecture

Transfer state lives entirely in Rust (`TransferManager` in `transfers.rs`). The JS side polls via `fetchTransfers` every 3 seconds (same interval as the Node worker approach).

```
JS (filenBridge.proxy) → Expo Module (Swift/Kotlin) → uniffi FFI → Rust TransferManager
                                                                      ├── upload_file: tokio::fs::File → FileWriter (SDK)
                                                                      ├── download_file: client.get_file_reader → tokio::fs::File
                                                                      ├── upload_directory: walk dir → create_dir + FileWriter per file
                                                                      ├── download_directory: list_dir_recursive → download per file
                                                                      ├── transfer_action: cancel/pause/resume via AtomicBool + Notify
                                                                      └── fetch_transfers: read state → JSON (speed, remaining, progress)
```

### Migrated Handlers

| Function | Description | Returns |
|----------|-------------|---------|
| `uploadFile` | Upload single file with progress, cancel/pause | `DriveCloudItem` JSON |
| `downloadFile` | Download single file with progress, cancel/pause | `void` |
| `uploadDirectory` | Recursive directory upload with aggregated progress | `void` |
| `downloadDirectory` | Recursive directory download (semaphore-limited concurrency) | `void` |
| `transferAction` | Stop/pause/resume a transfer by ID | `"true"` / `"false"` |
| `fetchTransfers` | Poll current transfer state | JSON with transfers, finished, speed, remaining, progress |

### Cancel / Pause / Resume

Each transfer gets a `TransferHandle` with:
- `cancelled: Arc<AtomicBool>` — checked before each I/O read/write
- `paused: Arc<AtomicBool>` + `pause_notify: Arc<Notify>` — blocks the read/write loop until resumed or cancelled

### Path Normalization

File paths from JS may have `file://` or `file:///` prefixes (iOS convention). The Rust `normalize_path()` function strips these to produce POSIX paths before any `tokio::fs` operations.

### What's NOT in Phase 3

- **Push-based progress events** — uniffi 0.29.4 proc-macro callback interfaces don't support `Arc<dyn Trait>` as method parameters. Polling via `fetchTransfers` is used instead (functionally equivalent to the Node worker approach).
- **Background transfers** — `upload.file.background` and `download.file.background` use the JS Filen SDK directly, not the Node worker proxy. They are unaffected by this migration.

---

## Phase 4 Details

### Architecture

The HTTP streaming server now runs in Rust via `hyper 1.x` (already a transitive dependency of `reqwest`). It replaces the Express.js server that ran inside the Node worker.

```
JS (filenBridge.start)  → Expo Module → uniffi FFI → HttpServer::start()
                                                       └── hyper HTTP/1.1 server on 127.0.0.1:<port>
                                                            ├── GET /ping → 200 "pong"
                                                            └── GET /stream?file=<base64> → 200/206 streaming decrypted file
```

### Routes

| Route | Auth | Response |
|-------|------|----------|
| `GET /ping` | Bearer token or `?auth=` | 200 `pong` |
| `GET /stream?file=<base64(json)>` | Bearer token or `?auth=` | 200 (full) or 206 (range) streaming body |

### Streaming

The `/stream` endpoint parses `Range` headers for partial content (206 responses with `Content-Range`). This enables scrubbing/seeking in video and audio players. The SDK's `get_file_reader_for_range` returns `impl futures::io::AsyncRead` which handles chunk download and decryption in Rust. Since the reader borrows the SDK client, streaming happens in a spawned task that sends decrypted bytes through an `mpsc` channel. The channel receiver is wrapped in `StreamBody` for the hyper response.

### Key Implementation Details

- **No new crate trees**: hyper 1.x, http-body-util, hyper-util are already transitive dependencies of reqwest
- **Shared client**: `Arc<RwLock<Option<Client>>>` shared between `FilenMobileSdkBridge` and `HttpServer` (avoids circular Arc)
- **Port selection**: Tries 49152–65000 sequentially, binds first available on `127.0.0.1`
- **Auth token**: 64-char hex (32 random bytes), validated via Bearer header or `?auth=` query param
- **Graceful shutdown**: oneshot channel to accept loop; existing streams finish naturally
- **Range semantics**: HTTP ranges are inclusive (`bytes=0-499`), SDK reader uses exclusive end — handler converts with `end + 1`
- **Connection cleanup**: When client disconnects, `mpsc::send()` fails, streaming task exits, SDK read lock released

### Verified on iOS Simulator

| Test | Result |
|------|--------|
| Server starts on app launch | Port 49153 |
| `GET /ping` with Bearer token | 200 "pong" |
| `GET /ping` with `?auth=` query param | 200 "pong" |
| Request without auth | 401 Unauthorized |
| Request with wrong token | 401 Unauthorized |
| Unknown route | 404 Not Found |
| `/stream` without file param | 500 (graceful error) |

### Call Site Migration

| File | Change |
|------|--------|
| `hooks/useHTTPServer.tsx` | `nodeWorker` → `filenBridge` |
| `components/listeners.tsx` | `nodeWorker.proxy("restartHTTPServer")` → `filenBridge.proxy("restartHTTPServer")` |
| `lib/thumbnails.ts` | `nodeWorker.httpServerPort/httpAuthToken/httpServerAlive()` → `filenBridge.*` |
| `queries/useChatEmbedVideoThumbnail.query.ts` | `nodeWorker.httpServerAlive()` → `filenBridge.httpServerAlive()` |
| `lib/filenBridge/index.ts` | Added HTTP server lifecycle, `buildStreamURL`, `httpServerAlive`, port/token storage |

---

## Key Files

| File | Purpose |
|------|---------|
| `filen-rs/filen-mobile-sdk-bridge/src/` | Rust crate: auth.rs, cloud.rs, contacts.rs, chats.rs, notes.rs, user.rs, fs_ops.rs, transfers.rs, http_server.rs, state.rs, env.rs, error.rs |
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
- `services/user.service.ts` — Phase 2e deferred handlers (`updatePersonalInformation`, `updateNickname`, etc.)
- Various event/GDPR query files — Phase 2e

Files switched from `nodeWorker` to `filenBridge` in Phase 3:
- `lib/upload.ts` — foreground `uploadFile` / `uploadDirectory`
- `lib/download.ts` — foreground `downloadFile` / `downloadDirectory`
- `components/authedListeners.tsx` — `updateTransfers()` polling

Files switched from `nodeWorker` to `filenBridge` in Phase 4:
- `hooks/useHTTPServer.tsx` — HTTP server port/token/ready state
- `components/listeners.tsx` — `restartHTTPServer` on app resume
- `lib/thumbnails.ts` — video thumbnail streaming via HTTP server
- `queries/useChatEmbedVideoThumbnail.query.ts` — HTTP server alive check
