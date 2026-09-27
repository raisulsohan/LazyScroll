# Changelog

All notable changes to LazyScroll are listed here. Version numbers follow the `version` field in `manifest.json`. Releases from 2.1 on are tagged and have a ZIP attached on the [releases page](https://github.com/raisulsohan/LazyScroll/releases).

## [2.3] — 2026-09-27

### Added

- Players inside frames follow the page they are on: a frame now uses the site key of the page in the address bar, so the popup, the presets, night mode and the per-site switch reach embedded players. Google Drive's video preview (a `youtube.googleapis.com` frame) follows `drive.google.com`; a YouTube embed on a blog follows the blog.
- Alt + wheel over a layer that a page draws over a frame (Google Drive's own controls) is handled by the page and written to storage at once, so the frame applies it.

## [2.2] — 2026-09-25

### Added

- Web-component players such as Reddit's `<shreddit-player>`: media inside open and closed shadow roots is found for the volume lock and its release, for Alt + wheel targeting and for unmuting. Every shadow root found gets the media event listeners and the MutationObserver, since media events are not composed.
- The locked volume is applied when `play()` is called, so a player added later never starts at 100% before the next scan finds it.
- The volume overlay is drawn inside the innermost fullscreen shadow root, so it shows in fullscreen on web-component players.

## [2.1] — 2026-09-25

### Added

- Web Audio support: every node a live `AudioContext` connects to its destination is routed through one master gain per context that carries the locked level, so pages without a `<video>` or `<audio>` element (canvas animations, games, custom players) follow the volume. `OfflineAudioContext` rendering is left untouched. Alt + wheel works on such pages.
- Local HTML files: `file://` pages share one *local files* site so the popup controls work; the popup warns, with a link, when *Allow access to file URLs* is off.
- Content scripts also run in `about:blank` and `srcdoc` frames (`match_origin_as_fallback`).

## Rename — 2026-09-17

The extension was renamed from **QuietScroll** to **LazyScroll**. The version number did not change. The rename updated the manifest name, the docs, the store listing and the repository links, and linked the *Made by Raisul Sohan* credit.

## [2.0] — 2026-09-10

### Added

- Custom volume input: type any value from 0% to 100% and click **Set**, with live validation.
- **Reset ▾** menu to jump back to any preset.
- Both act on the night level while night mode is on and on the site's volume otherwise, and are disabled on pages without a site (`chrome://` and similar).

## [1.7] — 2026-09-04

### Changed

- Alt is now always required: the wheel never changes volume on its own. The *Require Alt key* setting (global, and per site) was removed.

### Added

- 0.375% preset.
- Icons in four sizes, privacy policy and Chrome Web Store listing text; the credit links to raisulsohan.com.

## [1.6] — 2026-08-14

### Added

- Night mode: one switch holds every site at a single quiet level without rewriting per-site volumes; switching it off restores every site exactly. Scrolling during night mode tunes the night level and the overlay shows a moon.
- Quick presets in the popup: 0.125%, 0.1875%, 0.25%, 0.5% and 1%.

### Fixed

- Volumes set from the popup reach open tabs (the storage listener now watches `wvc:<host>`).
- Volume Guard snapshots the volume the page wanted when the lock starts and hands it back when the lock is released, so a site with no saved volume no longer stays at the night level after night mode is switched off.
- Unmuting no longer fights Chrome's autoplay policy: only real activation events count, `navigator.userActivation` is consulted first, and a refused unmute is undone (element left playing and muted) instead of letting Chrome pause it.
- Alt gesture: Chrome's auto-repeated `keydown` no longer clears the flag that suppresses menu-bar focus on Alt release, so Facebook no longer pauses video after Alt + wheel. As a safety net, a pause within 1.5 s of an Alt + wheel change on a playing element is resumed unless the user clicked or typed after the scroll.
- Facebook feed reels no longer play silent on the first hover: unmute retries in a bounded burst (3 attempts, 300 ms apart) before falling back to one attempt per 2.5 s.

## [1.5] — 2026-05-18 to 2026-05-20

First public version, as **QuietScroll**. All changes in May 2026 shipped under version 1.5.

### Added

- Per-site volume memory: the mouse wheel over a video or audio player changes its volume and the level is saved per hostname.
- Volume ladder with a configurable **Step per scroll** and **Minimum volume**; ultra-low listening down to 0.25%.
- Optional *Require Alt key* setting, global or per site; per-site on/off switch; on-screen volume overlay.
- Volume Guard (`guard.js`, 2026-05-18): a MAIN-world override of the media volume setter so autoplay-heavy sites cannot re-assert their own level; fixed a hang on YouTube playlists.
- Reverse wheel direction setting (2026-05-18).
- Ladder rungs at 0.75 × and 0.5 × the minimum, reaching 0.1875% and 0.125% (2026-05-20).
- Alt + wheel fallback to the active media element on audio-only sites such as YouTube Music and Suno, descending into open shadow roots (2026-05-20).

### Fixed

- Alt release after Alt + wheel no longer moves focus to the browser menu bar, which made Facebook pause autoplay video (2026-05-20).
- The overlay appears next to the pointer instead of at the top of the screen, and percentages no longer show float noise such as `29.0000%` (2026-05-20).
- A content script left behind by an extension reload shuts itself down instead of throwing on every event (2026-05-20).
