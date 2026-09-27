# LazyScroll User Guide

LazyScroll changes the volume of whatever is playing in a tab when you hold **Alt** and turn the mouse wheel, and remembers the level you chose for every site. This guide covers every feature of version 2.3.

## Contents

1. [Install](#install)
2. [The basics](#the-basics)
3. [The volume ladder](#the-volume-ladder)
4. [Per-site memory](#per-site-memory)
5. [Volume Guard](#volume-guard)
6. [Night mode](#night-mode)
7. [Presets, custom volume and reset](#presets-custom-volume-and-reset)
8. [The popup, control by control](#the-popup-control-by-control)
9. [Special cases](#special-cases)
10. [Troubleshooting](#troubleshooting)
11. [Supported browsers](#supported-browsers)

## Install

**From a release**

1. Download `LazyScroll-v2.3.zip` from the [latest release](https://github.com/raisulsohan/LazyScroll/releases/latest) and unzip it somewhere permanent. The browser loads the files from that folder, so do not move or delete it afterwards.
2. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and pick the folder that contains `manifest.json`.

**From source**: clone the repository and load its folder the same way.

Pages that were already open before you installed or updated LazyScroll do not have its scripts yet. Reload them.

To use LazyScroll on HTML files opened from your computer, open the extension's **Details** page and turn on **Allow access to file URLs**. See [Local HTML files](#local-html-files).

## The basics

1. Point at a video or audio player.
2. Hold **Alt** and turn the mouse wheel. Wheel up is louder, wheel down is quieter. **Reverse wheel direction** in the popup flips that.
3. A small box appears next to the pointer with the new level, for example `🔊 0.5%`, and fades out after about a second. It shows `🔇` at 0% and `🌙` while night mode is on.
4. The level is saved for the site a moment later. The next time you open that site, its players start at that level.

Without Alt, the wheel scrolls the page as usual. LazyScroll never touches a wheel event unless Alt is held.

Alt + wheel also works when the pointer is not over a player:

- If the page has a player somewhere, LazyScroll controls the media that is currently playing, or the first one with a loaded source. This is what makes it work on audio-only sites such as YouTube Music, where the `<audio>` element is hidden.
- If the page has no player but plays sound through the Web Audio API (games, canvas animations, custom players), Alt + wheel anywhere on the page controls that sound.
- If nothing on the page can play sound, the gesture is left alone and the page scrolls.

Pressing and releasing Alt on its own normally moves keyboard focus to the browser's menu bar. LazyScroll swallows the Alt release that ends a wheel gesture, so the page keeps focus. Some sites (Facebook, for one) pause video the moment the page loses focus; if a pause still slips through within 1.5 seconds of the gesture, LazyScroll resumes playback, unless you clicked or typed in between.

## The volume ladder

Each wheel notch moves one rung on a ladder built from two settings in the popup:

- **Step per scroll** (0.5% to 10%, default 0.5%): the regular rungs are multiples of the step, so with the default they are 0.5%, 1%, 1.5% … 99.5%.
- **Minimum volume** (0% to 1%, default 0.25%): four extra rungs in the ultra-quiet range, at half the minimum, three quarters of it, the minimum itself and one and a half times the minimum. With the default that is 0.125%, 0.1875%, 0.25% and 0.375%. Set the minimum to 0% to remove these rungs.

0% and 100% are always on the ladder. With the defaults, the bottom of the ladder reads:

```
0 → 0.125 → 0.1875 → 0.25 → 0.375 → 0.5 → 1 → 1.5 → 2 → … → 99.5 → 100   (%)
```

A notch first finds the rung nearest the current level, then moves one rung up or down. After you type a custom value such as 0.3%, the next notch lands on 0.375% or 0.25%.

## Per-site memory

A site is its hostname with any leading `www.` removed. `youtube.com` and `music.youtube.com` are different sites with their own volume. Two special cases:

- **Frames.** A player inside an embedded frame uses the site of the page in the address bar, not the frame's own address. A YouTube video embedded on a blog follows the blog's volume; Google Drive's video preview, which plays in a frame from `youtube.googleapis.com`, follows `drive.google.com`.
- **Local files.** Every `file://` page shares one site called `local files`.

A site with no saved volume plays at whatever level the site itself sets; the popup shows *site default*. The first Alt + wheel, preset or custom value on that site saves a level. Night mode applies to such sites too.

## Volume Guard

While LazyScroll holds a level for a site, it keeps the site's players there:

- Any attempt by the page to change the volume (its own slider, an autoplay reset, a playlist or ad transition) is overridden at once. The site's own volume control therefore appears not to work. That is intended; turn off **Extension active** for the site in the popup to hand control back.
- A player added to the page later (the next video in a feed) starts at your level, not at 100%.
- Once you have clicked or pressed a key on the page, muted autoplay videos are unmuted at your level (Facebook, X and Instagram feeds, for example). Before your first interaction the browser refuses to unmute, so LazyScroll leaves those videos muted rather than letting the browser pause them.
- When the hold is released (the site switched off in the popup, or night mode switched off on a site without a saved volume), players get back the volume the site last asked for.

## Night mode

Flip **🌙 Night mode** in the popup and every site is held at one global **night level** (default 1%). Per-site volumes are never rewritten, so switching night mode off puts every site back exactly where it was.

While night mode is on:

- Alt + wheel changes the night level, not the site's volume, and the overlay shows 🌙.
- The presets, the custom value and **Reset** set the night level. The popup heading reads *NIGHT LEVEL: all sites*.
- Sites switched off under **Extension active** stay untouched.

## Presets, custom volume and reset

The **VOLUME** block of the popup acts on the current site, or on the night level while night mode is on.

- **Presets**: six buttons for 0.125, 0.1875, 0.25, 0.375, 0.5 and 1 (all in %). The labels drop the % sign to fit; hover a button for its tooltip. The lit button is the current level.
- **Custom**: type any value from 0 to 100 (decimals are fine: `0.3`, `12.5`) and click **Set**. A red border means the value is out of range.
- **Reset ▾**: a menu with the six preset levels.

On pages that have no site (`chrome://` pages, the Web Store, a new tab) these controls are disabled and the popup shows *not available here*.

## The popup, control by control

| Control | What it does |
|---|---|
| **Step per scroll** | Volume change per wheel notch, 0.5% to 10% in 0.5% steps |
| **Minimum volume** | Anchor of the ultra-quiet rungs, 0% to 1% in 0.25% steps. The wheel goes down to half this value, with one stop between |
| **Reverse wheel direction** | Wheel down increases the volume |
| **🌙 Night mode** | Hold every site at the night level |
| **VOLUME / NIGHT LEVEL** | Current level of this site, or the night level; *site default* when nothing is saved yet |
| Preset buttons | Set the level to 0.125% … 1% |
| Custom input and **Set** | Set any level from 0% to 100% |
| **Reset ▾** | Set the level to one of the presets |
| **THIS SITE** | The site name the current tab is stored under |
| **Extension active** | Turn LazyScroll off or on for this site only. Off means the site's own controls work and nothing is held |
| Local files notice | Shown on `file://` pages while **Allow access to file URLs** is off, with a link to the setting |

All settings take effect in open tabs immediately; no reload is needed.

## Special cases

### Web-component players (Reddit and others)

Some sites build their player as a web component and keep the real `<video>` inside a shadow root, where ordinary page scripts cannot see it. Reddit's player is one. LazyScroll looks inside open and closed shadow roots, so the saved volume, Alt + wheel, the presets and night mode work on them. A player that the site adds later, such as the next post in a feed, gets your level the moment it starts playing. The overlay is also shown when such a player is in fullscreen.

### Embedded players (Google Drive, YouTube embeds)

Players in frames follow the volume of the page they are on (see [Per-site memory](#per-site-memory)). Alt + wheel also works when the site draws its own controls over the frame, as Google Drive does: the page handles the gesture and passes the level to the frame.

### Web Audio pages

Pages that play sound through the Web Audio API, with no `<video>` or `<audio>` element, are routed through a volume control that LazyScroll inserts between the page's audio and your speakers. Hold Alt and scroll anywhere on the page. Audio that a page renders offline, for example when exporting a WAV file or a video soundtrack, is not touched, so exports keep their full volume.

### Local HTML files

LazyScroll works on HTML files opened from your computer once **Allow access to file URLs** is on:

1. Open `chrome://extensions`.
2. Click **Details** under LazyScroll.
3. Turn on **Allow access to file URLs**.
4. Reload the page.

All local files share one saved level, shown in the popup as *local files*. While the setting is off, the popup shows a notice with a link to it.

### Fullscreen

Alt + wheel and the overlay work in fullscreen, including inside web-component players. LazyScroll never leaves fullscreen or blocks it.

### Sites that navigate without reloading (YouTube)

When YouTube moves to another video without a page load, the saved level is applied again half a second after the navigation finishes, so the new video does not start at YouTube's own level.

## Troubleshooting

**Nothing happens; the page just scrolls.**

- Alt is not held. The wheel only changes volume with Alt.
- **Extension active** is off for this site. Check the popup.
- The page was open before LazyScroll was installed or updated. Reload it.
- Nothing on the page can play sound yet. Start playback, then try again.
- The tab is a `chrome://` page, the Web Store, or a `file://` page without **Allow access to file URLs**.

**The overlay appears but the volume does not change.** Another extension or the site may be fighting over the volume. Turn **Extension active** off and on for the site; if that does not help, reload the page.

**The site's own volume slider does not work.** That is Volume Guard holding your level. Turn off **Extension active** for the site to use the site's controls.

**A video stays muted.** The browser only allows unmuting after you have clicked or pressed a key on the page. Click anywhere once.

**The volume jumped back to 100% after an extension update.** The tab still runs the old script. Reload the tab.

**The popup says *not available here*.** The page has no hostname (a browser page or a blank tab). Open a website.

**Two pages of the same site have different volumes.** They are on different hostnames, for example `example.com` and `app.example.com`. Each hostname is its own site.

**Each notch changes the volume too much or too little.** Adjust **Step per scroll**.

**The wheel cannot go below 0.5%.** **Minimum volume** is set to 0%, which removes the ultra-quiet rungs. Set it back to 0.25%.

**Night mode is on but one site is loud.** That site is switched off under **Extension active**; night mode leaves such sites alone.

**Pressing Alt pauses the video.** LazyScroll resumes a pause that arrives within 1.5 seconds of an Alt + wheel gesture unless you clicked or typed after it. If the video still pauses, another extension may be intercepting the Alt key.

## Supported browsers

Chromium 111 or newer: Google Chrome, Microsoft Edge, Brave and other Chromium-based browsers. LazyScroll relies on content scripts that run in the page's main world, which Chromium added in version 111. Firefox and Safari are not supported.
