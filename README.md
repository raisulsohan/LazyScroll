# LazyScroll

Smart per-site volume control for peaceful browsing.

LazyScroll is a lightweight Chrome/Edge extension that lets you control the
volume of any video or audio player with your mouse wheel — and remembers your
preferred volume separately for every website.

> **Note:** Pure Web-Audio-API players (Spotify, SoundCloud) are not supported — they route audio outside `<video>`/`<audio>` entirely; users fall back to the site's own volume control there.

## Features

* **Alt + Wheel volume control** — hold Alt and scroll over any player to adjust the volume
* **Per-site volume memory** — your volume is saved separately for each website
* **Ultra-low volume** — go as quiet as 0.125%, ideal for late-night listening
* **Night mode** — one switch drops every site to a single quiet level, and switches back
* **Quick presets** — jump straight to 0.125% / 0.1875% / 0.25% / 0.375% / 0.5% / 1% from the popup
* **Custom volume input** — enter any custom volume percentage (0%–100%) and set it instantly
* **Preset reset menu** — easily reset your volume to any of the 6 presets with one click
* **Adjustable step** — choose how much each scroll changes the volume (0.5%–10%)
* **Reverse direction** — optionally flip scroll-up / scroll-down
* **Per-site on/off** — disable the extension on any site you choose
* **Volume Guard** — holds your volume steady on autoplay-heavy sites that keep re-asserting their own
* **Fullscreen-safe** — never breaks a site's fullscreen
* **Lightweight & private** — all settings stay on your device; nothing is sent anywhere

## How It Works

Hold **Alt** and scroll the **mouse wheel** up or down over a video or audio
player to change the volume.

`Alt + Mouse Wheel`

LazyScroll remembers the volume you set for each website, so the next time you
visit, it starts where you left off.

## Night Mode

Flip **Night mode** in the popup and every site drops to one quiet level — no
need to visit each site and scroll it down. Flip it back and each site returns
to its own remembered volume.

* Your per-site volumes are never overwritten while night mode is on, so
  switching it off restores them exactly
* Scrolling the wheel during night mode tunes the **night level** itself, and
  the overlay shows a 🌙 so you can tell which one you are changing
* The quick presets and custom volume set the night level while night mode is on, and the current
  site's volume otherwise
* Sites you turned off under **Extension active** stay untouched

## Quick Presets & Custom Volume

The popup provides fast, precise volume control:
* **One-Click Presets:** Six ultra-low levels where scrolling notch-by-notch is slowest: **0.125%**, **0.1875%**, **0.25%**, **0.375%**, **0.5%**, and **1%**. The buttons display compact numbers to fit neatly; hover over any button to see the tooltip.
* **Custom Value Input:** Need a specific number? Type any exact percentage (e.g., `0.35` or `12`) into the input box and click **Set**.
* **Reset ▾ Menu:** Click the Reset dropdown anytime to quickly reset your volume back to any preset level.

## Settings

Open the popup (toolbar icon) to adjust:

* **Step per scroll** — volume change per wheel notch (0.5%–10%)
* **Minimum volume** — the lowest non-zero level on the volume ladder (down to 0.25%)
* **Reverse wheel direction** — scroll down to increase volume
* **Night mode** — hold every site at one quiet level
* **Quick presets** — 0.125% / 0.1875% / 0.25% / 0.375% / 0.5% / 1%
* **Custom volume & Reset** — input exact volume percentage or reset to a preset
* **This site: Extension active** — turn LazyScroll on/off for the current site

## A Note on Volume Guard

While LazyScroll is active on a site, it keeps the volume locked to your
chosen level — so the site's own volume slider may not take effect. If you want
to use a site's native volume controls instead, turn off **Extension active**
for that site in the popup.

## Supported Browsers

* Google Chrome
* Microsoft Edge
* Brave

Requires a Chromium-based browser, version 111 or newer (LazyScroll relies on
`MAIN`-world content scripts for the Volume Guard).

## Installation

1. Download or clone this repository
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the LazyScroll folder

## Privacy Policy

LazyScroll does not collect or transmit any user data. Read our full [Privacy Policy](PRIVACY.md).

## Author

Made by [Raisul Sohan](https://raisulsohan.com)
