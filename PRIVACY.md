# Privacy Policy for LazyScroll

Last Updated: September 25, 2026 (version 2.1)

## Overview
LazyScroll ("the Extension") is developed by Raisul Sohan. We believe that your privacy is fundamental. This Privacy Policy outlines how LazyScroll handles user information.

## 1. Information Collection and Use
**LazyScroll does NOT collect, store, transmit, or sell any personal information or browsing history.**

- **No Personal Data**: The Extension does not collect your name, email address, IP address, device identifier, or location.
- **No Browsing History**: The Extension does not track, log, or transmit any websites you visit.
- **No Analytics / Telemetry**: There are no third-party analytics, tracking scripts, or advertising trackers embedded in the Extension.

## 2. Local Storage
LazyScroll uses Chrome's local storage API (`chrome.storage.local`) exclusively on your own device to store:
- User preferences (such as scroll step size, minimum volume, reverse direction).
- Night mode status and night volume level.
- Per-website volume levels that you explicitly adjust using Alt + Wheel.
- Per-website enable/disable toggles.

Websites are identified only by their hostname (for example, `youtube.com`). HTML files opened from your computer are all stored under one shared label, "local files"; LazyScroll never stores their file names, folder paths, or contents.

All data remains strictly inside your local browser instance and never leaves your computer.

## 3. Web Page Access
LazyScroll interacts with web pages solely to detect HTML5 `<video>` and `<audio>` elements for adjusting and holding media playback volume when you hold `Alt` and scroll your mouse wheel. It does not read or transmit any page contents, cookies, or user credentials.

- **Web Audio**: On pages that play sound through the Web Audio API, LazyScroll inserts a volume control between the page's audio and your speakers. It only changes loudness; it does not record, analyze, or save any audio. To mark such pages, it adds one attribute (`data-qs-webaudio`) to the page's root element and changes nothing else on the page.
- **Local HTML files**: LazyScroll runs on HTML files opened from your computer only if you turn on Chrome's "Allow access to file URLs" setting for it. The popup checks only whether that setting is on; LazyScroll does not read, list, or upload your files.

## 4. Third-Party Services
LazyScroll operates completely offline. It does not communicate with any external servers, APIs, or third-party services.

## 5. Contact
If you have any questions or feedback regarding this Privacy Policy, you can reach out via:
- Website: [https://raisulsohan.com](https://raisulsohan.com)
- Email: lettertosohan@gmail.com

---

Made by [Raisul Sohan](https://raisulsohan.com)
