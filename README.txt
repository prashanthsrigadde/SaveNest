SaveNest V8 FINAL — rebuilt from V7 features with V4 compatibility fixes.

Included: category/subcategory management, smart title/reminder, V1/V2/V3 data compatibility, YouTube embedded player, direct MP4/WebM playback, Instagram embed attempt with original-page fallback, and fresh service-worker cache version.

Deploy all files to the root of an HTTPS static site (GitHub Pages, Netlify, etc.). Do not open index.html with file://.

After deployment: uninstall the old SaveNest PWA, open the new HTTPS URL in Chrome, refresh once, then install/add to Home Screen. LocalStorage data is per-origin; export a backup from the old app before changing domains if you need to preserve existing saves.

Platform limitation: Instagram/TikTok/Facebook may block embedded playback. SaveNest provides an Open original page fallback; it cannot bypass platform restrictions.
