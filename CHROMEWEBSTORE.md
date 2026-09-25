# Chrome Web Store Listing — LazyScroll

> Last Updated: 2026-09-25  
> Extension Version: 2.2  
> Author: Made by Raisul Sohan (https://raisulsohan.com)

---

## Store Listing Metadata

**Extension Name**  
LazyScroll

**Short Description** (128 characters)  
Smart per-site volume control with Alt + Wheel. Features night mode, ultra-low presets, and volume guard for peaceful browsing.

**Detailed Description** (Formatted for Chrome Web Store)  
```text
Take complete control of web audio with your mouse wheel. LazyScroll lets you adjust the volume of any video or audio player using Alt + Mouse Wheel, and automatically remembers your preferred volume separately for every website.

KEY FEATURES:
- Alt + Mouse Wheel Volume Control: Hold Alt and scroll over any video/audio player to adjust volume smoothly. Normal scrolling remains completely unaffected.
- Web Audio Support: Also controls pages that play sound without a video or audio element, such as canvas animations, games and custom players. Audio a page renders offline for export keeps its full volume.
- Local HTML Files: Works on HTML pages opened straight from your computer. All local files share one remembered volume.
- Per-Site Volume Memory: Set your desired level once; LazyScroll remembers it every time you visit that domain.
- Ultra-Low Night Listening: Scroll down as quiet as 0.125% for ultra-sensitive headphones and late-night listening.
- One-Click Night Mode: Flip Night Mode to instantly lower every website to a gentle, quiet level without losing individual site preferences.
- Quick Presets: Instant one-click presets for ultra-low volume levels: 0.125%, 0.1875%, 0.25%, 0.375%, 0.5%, and 1%.
- Custom Volume Input: Type any custom percentage (0% to 100%) and apply it immediately.
- Preset Reset Menu: Easily reset your volume back to any preset level with a single click.
- Volume Guard: Prevents autoplay-heavy websites from forcibly overriding your custom volume level.
- Per-Site Toggle: Easily enable or disable the extension on any specific site with a single click.
- Completely Private: Operates 100% offline. All settings are stored locally on your device. Zero tracking, zero telemetry.

HOW TO USE:
1. Hover your cursor over any video or audio player.
2. Hold down the Alt key and scroll your mouse wheel up or down.
3. An on-screen volume overlay will display the exact percentage.
4. Click the extension toolbar icon anytime to access presets, step size adjustments, and Night Mode.

On pages that play sound through Web Audio (no visible player), hold Alt and scroll anywhere on the page.

LOCAL HTML FILES:
Chrome blocks extensions on local files by default. To use LazyScroll there, open chrome://extensions, click Details under LazyScroll, turn on "Allow access to file URLs", then reload the page. The popup shows a reminder with a direct link while this is off.

PERMISSIONS & PRIVACY:
LazyScroll respects your privacy. It does not collect, store, or transmit any personal data, browsing history, or analytics. Everything stays strictly inside your browser.

Made by Raisul Sohan (https://raisulsohan.com).
```

**Category**  
Productivity (or Accessibility)

**Single Purpose**  
Control and remember the volume of media and Web Audio playback on any website or local HTML file using Alt and the mouse wheel.

**Primary Language**  
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Location / Filename |
|-------|------------|--------|---------------------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Small Icon | 48×48 PNG | ✅ Ready | `icons/icon-48.png` |
| UI Icon | 32×32 PNG | ✅ Ready | `icons/icon-32.png` |
| Favicon Icon | 16×16 PNG | ✅ Ready | `icons/icon-16.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | 🟡 User to take | Extension popup with preset buttons |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | 🟡 User to take | On-screen volume overlay in action |
| Small Promo Tile [RECOMMENDED] | 440×280 PNG/JPEG | 🟡 Optional | Custom banner graphic |

---

## Permissions Justification

Chrome Web Store review requires an explicit, plain-English justification for each permission:

| Permission | Type | Exact Justification for Chrome Web Store Dashboard |
|------------|------|----------------------------------------------------|
| `storage` | permissions | Used solely to save the user's volume settings, scroll step preferences, night mode status, and per-site volume levels locally via chrome.storage.local. No data leaves the device. |
| `activeTab` | permissions | Used exclusively when the user clicks the toolbar popup icon to identify the current website's hostname so that site-specific volume preferences and on/off status can be displayed and adjusted. |
| `<all_urls>` | content_scripts | Required to detect HTML5 `<video>` and `<audio>` elements and Web Audio playback across all websites and local HTML files where users play media, enabling the Alt + Wheel volume adjustment and Volume Guard feature. The scripts also run in `about:blank` and `srcdoc` frames (`match_origin_as_fallback`) so embedded players are covered. Only volume is changed; no page content is read or sent anywhere. |

---

## Privacy & Data Use Disclosure (For Developer Dashboard)

**Privacy Policy URL for Dashboard:**  
`https://github.com/raisulsohan/LazyScroll/blob/main/PRIVACY.md`

**Does the extension collect user data?**  
**NO** — LazyScroll collects zero user data.

- **Personally Identifiable Information**: Not collected.
- **Health Information**: Not collected.
- **Financial Information**: Not collected.
- **Authentication Information**: Not collected.
- **Personal Communications**: Not collected.
- **Location**: Not collected.
- **Web History**: Not collected.
- **User Activity**: Not collected.
- **Website Content**: Not collected.

**Single Purpose Certification:**  
I confirm that this extension complies with the Chrome Web Store Single Purpose Policy: it exists solely to allow users to control media playback volume using mouse wheel gestures and save their preferred volume levels per domain.

---

## Packaging & Submission Instructions

When creating the ZIP file for submission to the Chrome Web Store Developer Dashboard:

### Files to INCLUDE in the ZIP:
- `manifest.json`
- `popup.html`
- `popup.js`
- `content.js`
- `guard.js`
- `icons/` folder (`icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`)

### Files to EXCLUDE from the ZIP:
- `.git/` directory
- `.gitattributes`
- `README.md`
- `CHROMEWEBSTORE.md`
- `PRIVACY.md`
- Any temporary or scratch files
