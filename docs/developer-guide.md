# LazyScroll Developer Guide

How the extension is put together, why it runs in two worlds, and how to work on it. Read the [user guide](user-guide.md) first if you have not used the extension yet.

## Contents

1. [Overview](#overview)
2. [File map](#file-map)
3. [Two worlds and the bridge between them](#two-worlds-and-the-bridge-between-them)
4. [Site keys](#site-keys)
5. [Storage](#storage)
6. [The volume ladder](#the-volume-ladder)
7. [What happens on Alt + wheel](#what-happens-on-alt--wheel)
8. [Volume Guard internals](#volume-guard-internals)
9. [Keeping the level applied](#keeping-the-level-applied)
10. [Unmuting](#unmuting)
11. [Alt key handling and the pause safety net](#alt-key-handling-and-the-pause-safety-net)
12. [The overlay](#the-overlay)
13. [Shadow DOM](#shadow-dom)
14. [Frames](#frames)
15. [Extension reloads](#extension-reloads)
16. [The popup](#the-popup)
17. [Working on it](#working-on-it)
18. [Permissions and compatibility](#permissions-and-compatibility)

## Overview

LazyScroll is a Manifest V3 extension in plain JavaScript with no build step, no background service worker and no dependencies. It is two content scripts that run in every frame of every page at `document_start`, plus a popup:

| File | World | Job |
|---|---|---|
| `guard.js` | MAIN (the page's own JavaScript world) | Overrides browser APIs so the page cannot change the volume behind LazyScroll's back |
| `content.js` | ISOLATED (the extension's world) | Reads settings, handles Alt + wheel, finds media, shows the overlay, tells the guard which level to hold |
| `popup.js` | Extension popup | Edits settings in storage; the content scripts pick them up live |

## File map

```
manifest.json      MV3 manifest: storage + activeTab, two content scripts in all frames
guard.js           MAIN-world guard: volume lock, play() hook, Web Audio master gain, closed shadow roots
content.js         ISOLATED-world logic: settings, wheel handling, media discovery, unmute policy, overlay
popup.html         popup UI
popup.js           popup logic
icons/             16, 32, 48 and 128 px icons
CHROMEWEBSTORE.md  store listing text, permission justifications, packaging steps
PRIVACY.md         privacy policy linked from the store listing
CHANGELOG.md       version history
docs/              this guide and the user guide
```

## Two worlds and the bridge between them

An isolated-world content script shares the DOM with the page but not its JavaScript objects, so it cannot replace `HTMLMediaElement.prototype.volume` in a way the page would see. `guard.js` therefore runs in the MAIN world (`"world": "MAIN"` in the manifest), where it patches:

- `HTMLMediaElement.prototype.volume` (setter) and `HTMLMediaElement.prototype.play`
- `AudioNode.prototype.connect` and `AudioNode.prototype.disconnect`
- `Element.prototype.attachShadow`

The MAIN world has no `chrome.*` API, so the two scripts talk through the DOM:

| Direction | Mechanism | Payload |
|---|---|---|
| content → guard | `window.dispatchEvent(new CustomEvent('qs-set-vol', { detail }))` | `detail` is a number from 0 to 1 to hold that level, or `null` to release the lock |
| guard → content | `document.documentElement.setAttribute('data-qs-webaudio', '1')` | Set once the page has connected anything to a live `AudioContext`, so the content script knows Alt + wheel has something to control even with no media element |

`content.js` dispatches `qs-set-vol` from `syncToMainWorld(v)`, which is called whenever the effective level changes or needs re-asserting.

## Site keys

Both `content.js` and `popup.js` contain the same `siteKey(url)`; keep them identical.

```
file:      → "local files"
otherwise  → hostname without a leading "www."
unparsable → ""  (popup shows "not available here")
```

Inside a frame, `frameSiteKey()` uses the last entry of `location.ancestorOrigins`, which is the top-level page, so a frame stores and reads the level of the page in the address bar. An opaque ancestor origin (`"null"`) falls back to the frame's own key.

## Storage

All keys live in `chrome.storage.local` under the `wvc:` prefix (from the original name, *QuietScroll*, "wheel volume control"). Volumes are fractions from 0 to 1, not percentages.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `wvc:step` | number | `0.005` | Step per scroll |
| `wvc:minvol` | number | `0.0025` | Minimum volume |
| `wvc:reverse` | boolean | `false` | Reverse wheel direction |
| `wvc:disabled` | string[] | `[]` | Site keys where the extension is off |
| `wvc:night` | boolean | `false` | Night mode on |
| `wvc:nightvol` | number | `0.01` | Night level |
| `wvc:<siteKey>` | number | (absent) | Saved level for that site, e.g. `wvc:youtube.com`, `wvc:local files` |

Every content script registers a `chrome.storage.onChanged` listener, so a change made in the popup or in another tab is applied to open tabs without a reload. Wheel changes are written 200 ms after the last notch (`persistVol` → `writeVol`), and flushed at once on `pagehide`, when the tab is hidden, and when the gesture was over a frame.

## The volume ladder

`buildLadder()` produces a sorted array of fractions:

1. `0` and `1`.
2. If `0 < minVol < 1`: `minVol`, `1.5 × minVol`, `0.75 × minVol`, `0.5 × minVol`.
3. `i × step` for `i = 1, 2, …` while below 1.

Values are rounded to six decimals so float noise does not create near-duplicate rungs. The ladder is rebuilt when `wvc:step` or `wvc:minvol` changes.

`onWheel` picks the rung nearest the current effective level, moves one index up or down (direction flipped by `reverseWheel`), and clamps to the array bounds.

## What happens on Alt + wheel

`onWheel` is a capturing, non-passive `wheel` listener on `window`.

1. Ignore the event if the script is dead, the site is switched off, or `altKey` is false.
2. Find a target, in this order:
   - `mediaAtPoint(x, y)`: a `<video>` or `<audio>` under the pointer, searching through shadow roots (see [Shadow DOM](#shadow-dom)).
   - `frameAtPoint(x, y)`: an `<iframe>` or `<frame>` under the pointer. Handled in this document because a page layer over the frame swallows the wheel before the frame ever sees it.
   - `findActiveMedia()`: the first media element that is playing with data, else the first with a source.
   - The `data-qs-webaudio` attribute on `<html>`: Web Audio only.
   - None of these: return without touching the event, so the page scrolls.
3. `preventDefault()` and `stopPropagation()`; set `altWasUsed` so the coming Alt keyup is swallowed. If the media was playing, arm the pause safety net.
4. Compute the next rung and call `persistVol(v)`: update `nightVol` or `savedVolume`, dispatch `qs-set-vol`, and schedule the storage write. For a frame target, `flushSave()` writes immediately because the frame only learns about the change through `storage.onChanged`.
5. `ensureUnmuted(media)` if there is a media element, then `showOverlay(v, x, y)`.

## Volume Guard internals

`guard.js` keeps one `lockedVol` per frame (`null` means unlocked).

- **Volume setter.** With a lock, any assignment to `.volume` records the value the page wanted in `element._qsSiteVol` and applies `lockedVol` instead. Without a lock, the assignment goes through unchanged.
- **Locking** (`qs-set-vol` with a number): for every media element on the page, snapshot its current volume into `_qsSiteVol` if this is the first lock, then set the locked value. Also update every Web Audio master gain.
- **Releasing** (`qs-set-vol` with `null`): restore each element to `_qsSiteVol`, or to 1 if nothing was recorded, and set the master gains to 1.
- **`play()` hook.** Re-applies `lockedVol` right before playback starts, so a player that the content script has not scanned yet never plays its first moments at 100%. It deliberately does not snapshot `_qsSiteVol`, because the element may already hold the locked value.
- **Web Audio.** `masterFor(destination)` creates one `GainNode` per live `AudioContext` (kept in a `WeakMap`, plus a `Set` of live gains that is pruned on `statechange` to `closed`), connects it to the real destination, and sets `data-qs-webaudio` on `<html>`. The patched `connect` reroutes any connection to an `AudioDestinationNode` through that gain; `disconnect` mirrors it. `OfflineAudioContext` is never touched, so offline renders keep their level.
- **Closed shadow roots.** The patched `attachShadow` stores a `WeakRef` to every closed root, so `allMedia()` in the guard can search inside them.

The guard is stateless across navigations and has no storage access; it only ever does what the last `qs-set-vol` told it.

## Keeping the level applied

`effVol()` is the single source of truth for what should be held: `nightVol` while night mode is on, else `savedVolume`, else `null` (nothing held).

`applyToAll()` sends `effVol()` to the guard (or `null` when the site is off or nothing is saved) and runs the unmute pass over every media element. It runs after the initial storage read and whenever a relevant key changes.

`scanAndApply()` is the cheaper, throttled re-assert used by:

- the `MutationObserver` on `<html>` and on every hooked shadow root, debounced 500 ms;
- the media events `loadstart`, `canplay`, `play`, `playing` and `loadedmetadata`, coalesced into one pass 150 ms later;
- YouTube's `yt-navigate-finish` event, 500 ms later.

A `volumechange` whose target drifted more than `EPS` (0.0005) from the held level re-sends the level to the guard and re-runs the unmute check for that element.

## Unmuting

`ensureUnmuted(m)` runs only when a level is held and is not 0, the element is muted, and the browser allows it (`navigator.userActivation.hasBeenActive`, with a fallback flag set by real activation events: `pointerdown`, `mousedown`, `keydown`, `touchend`, `click`; `wheel` is deliberately excluded because scrolling does not grant activation).

Per element, attempts are budgeted to avoid the mute/unmute fight that once froze YouTube tabs:

- a burst of `UNMUTE_BURST` (3) attempts spaced `UNMUTE_RETRY` (300 ms) apart, which wins against sites that re-mute a moment after each unmute (Facebook reels);
- after the burst, at most one attempt per `UNMUTE_COOLDOWN` (2.5 s);
- each `play` / `playing` event hands the element a fresh burst.

If the element was playing and is paused on the very next task, Chrome refused the unmute and paused it. `verifyUnmute` then puts it back as found (muted, playing) and marks `_qsBlockedAt = activationEpoch` so no further attempt is made until the next real interaction.

Expando properties used on media elements: `_qsSiteVol` (guard), `_qsLastUnmute`, `_qsUnmuteTries`, `_qsRetryTimer`, `_qsBlockedAt` (content).

## Alt key handling and the pause safety net

Chrome arms the menu bar on a bare Alt press and release. After an Alt + wheel gesture, `altWasUsed` is true, and the capturing `keyup` listener calls `preventDefault()` and `stopPropagation()` on Alt so focus stays on the page. Auto-repeated `keydown` events while Alt is held (`e.repeat`) keep the flag and are also cancelled; only a fresh press resets it.

As a second line of defence, an Alt + wheel on a playing element arms `resumeTarget` for `RESUME_WINDOW` (1.5 s). A `pause` event on that element inside the window is undone with `play()`, unless the user clicked, touched or pressed a non-Alt key after the gesture.

## The overlay

`showOverlay(v, x, y)` creates one fixed-position `<div>` (max z-index, pointer-events none) and re-parents it when the fullscreen element changes. `overlayHost()` returns `document.body` normally, or the innermost fullscreen element, following `shadowRoot.fullscreenElement` down through web-component players so the box is rendered inside the root that is actually fullscreen.

The box is centred above the pointer, flipped below it near the top edge, clamped horizontally, and faded out after 900 ms. `fmtPct` rounds to four decimals first so `0.29 × 100` prints as `29`, not `28.999999999999996`.

## Shadow DOM

Web-component players keep their `<video>` inside a shadow root, where `querySelectorAll`, `elementsFromPoint` and document-level media listeners do not reach, and media events are not composed, so they stop at the root.

- `shadowOf(el)` returns `el.shadowRoot`, or for custom elements (`localName` containing `-`) the closed root via `chrome.dom.openOrClosedShadowRoot`.
- `allMedia()` walks the document and every shadow root it finds, recursively, and calls `hookRoot(root)` on each new root: the media event listeners and the `MutationObserver` are attached to that root as well (the `hookedRoots` WeakSet prevents duplicates).
- `atPoint(x, y, match)` calls `elementsFromPoint` on the document and then on each shadow root under the pointer, so a player behind a shadow host is found.

## Frames

The manifest injects both scripts with `all_frames: true` and `match_origin_as_fallback: true`, so `about:blank` and `srcdoc` frames get them too. Each frame runs its own guard and its own content script with the top-level page's site key (see [Site keys](#site-keys)), reads the same storage, and applies the level itself. The top document handles Alt + wheel over a frame that it covers with its own layer and writes the level to storage immediately; the frame's `storage.onChanged` listener applies it.

## Extension reloads

When the extension is reloaded or updated, the old content script keeps running in open tabs with a dead `chrome.*` connection. `extAlive()` checks `chrome.runtime.id`; `safeSet()` and the initial `storage.get` are wrapped so the first failure calls `shutdown()`, which sets `dead = true` and disconnects the observer. Every handler checks `dead` first, so the old script goes quiet instead of throwing on every event. The guard keeps whatever lock it last had until the tab is reloaded.

## The popup

`popup.js` is a thin editor over storage:

- On open it reads the global keys and renders the sliders and toggles, then queries the active tab, derives the site key with the same `siteKey()` as the content script, and reads `wvc:disabled` and `wvc:<siteKey>`.
- Sliders write fractions (`pct / 100`). The step slider is 0.5 to 10 in 0.5 steps; the minimum slider 0 to 1 in 0.25 steps.
- `renderQuick()` decides what the VOLUME block targets: the night level when night mode is on, else the site level, and disables the block when there is no site key. Presets, **Set** and **Reset** write `wvc:nightvol` or `wvc:<siteKey>` accordingly.
- **Extension active** adds or removes the site key in `wvc:disabled`.
- On a `file://` tab, `chrome.extension.isAllowedFileSchemeAccess` decides whether to show the notice; its link opens `chrome://extensions/?id=<extension id>`.

No script injection is done from the popup; `activeTab` is only needed to read the active tab's URL for the site key.

## Working on it

### Load unpacked and iterate

Load the folder at `chrome://extensions` with Developer mode on. After editing `guard.js` or `content.js`, click the reload icon on the extension card, then reload the pages you test on (an old script instance in an open tab shuts itself down but cannot be replaced without a reload). Popup changes only need the popup to be reopened after the extension reload.

### Debugging

- **Content script**: in the page's DevTools, switch the console context from `top` to **LazyScroll** for the isolated world. `chrome.storage.local.get(null, console.log)` shows every setting and saved level.
- **Guard**: in the `top` context, `document.documentElement.hasAttribute('data-qs-webaudio')` tells you whether Web Audio was detected, and `window.dispatchEvent(new CustomEvent('qs-set-vol', { detail: 0.01 }))` exercises the lock directly.
- **Popup**: right-click the icon and choose **Inspect popup**.
- **Frames**: pick the frame in the DevTools context selector; each frame has its own copy of both scripts.

Useful test pages: YouTube (playlists and in-page navigation), YouTube Music (hidden `<audio>`), Facebook and X feeds (muted autoplay, blur-pause), Reddit (shadow DOM player), Google Drive video preview (frame plus covering layer), a Web Audio demo or browser game, and a local `.html` file with a `<video>`.

### Conventions

- Keep `siteKey()` in `content.js` and `popup.js` identical.
- Storage values are fractions; convert to percent only for display.
- The `wvc:` and `qs` / `_qs` prefixes are kept from the original name for backwards-compatible storage; do not rename keys, or users lose their saved levels.
- Comments that explain a past bug (`FIX:` blocks) are intentional; keep them when touching that code.

### Releasing

1. Bump `version` in `manifest.json`; update the version and date in `CHROMEWEBSTORE.md` and `PRIVACY.md`, and the release file name in `README.md`.
2. Add the changes to `CHANGELOG.md`.
3. Build `LazyScroll-vX.Y.zip` with `manifest.json`, `popup.html`, `popup.js`, `content.js`, `guard.js`, `LICENSE` and `icons/` at the top level (no wrapping folder). The Chrome Web Store upload is the same without `LICENSE`, as described in `CHROMEWEBSTORE.md`.
4. Tag `vX.Y`, push the tag, and create a GitHub release with `LazyScroll-vX.Y.zip` attached.

## Permissions and compatibility

| Permission | Why |
|---|---|
| `storage` | Settings and per-site levels |
| `activeTab` | The popup reads the active tab's URL to derive the site key |
| `content_scripts` on `<all_urls>`, all frames | Media can be on any page; `match_origin_as_fallback` covers `about:blank` and `srcdoc` frames |

Requires Chromium 111 or newer: `"world": "MAIN"` in a manifest content script was added in Chrome 111. `chrome.dom.openOrClosedShadowRoot` (Chrome 88) and `match_origin_as_fallback` (Chrome 79) are older. No network requests are made.
