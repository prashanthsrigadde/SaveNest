SaveNest V10 — GitHub Pages icon/path fix, Instagram direct-open fix, and PWA install support.

CRITICAL FIX: the previous build referenced a missing #libraryCount DOM element. That caused a JavaScript TypeError during render, stopping the saved-video list from rendering. This build guards that optional element.

Deploy ALL files and the icons folder to the ROOT of an HTTPS site. If using GitHub Pages project hosting, deploy the contents of the SaveNest folder (not the outer folder) to the configured Pages source so index.html is at the site root/path. Do not open index.html via file://.

Install recovery: uninstall old SaveNest from Android; in Chrome open the exact deployed HTTPS URL and refresh. If the old install remains, Chrome > Settings > Site settings > All sites > your SaveNest site > Clear data, then reopen the site and install. This clears site-local data too, so export a backup from the old app first if possible.

Legacy data: imports URL values from url/link/href/permalink/videoUrl fields and keeps existing valid http/https links. Data is stored per browser origin; switching domains does not automatically transfer localStorage.

Playback: YouTube embed and direct MP4/WebM are supported. Instagram/TikTok/Facebook may block embedding; use Open original page fallback.


V10 CHANGES: Instagram links now open their original Instagram URL directly (so Android can hand off to the Instagram app when installed). Only YouTube links open inside the SaveNest player; other external platforms open directly. Added an Install SaveNest action and PWA install prompt handling. Manifest paths and install identity use a simple relative scope.

If an icon URL still returns 404 after deployment, check the actual GitHub Pages base URL/repository path and verify that the icons folder is uploaded beside index.html. The archive includes both icon PNG files.


GITHUB PAGES DEPLOYMENT FIX (2026-10-09): This ZIP is intentionally flattened: upload/extract the CONTENTS of this ZIP directly into the repository root selected by GitHub Pages. The repository root must contain index.html, manifest.webmanifest, sw.js, app.js, styles.css, and the icons/ folder. Do not upload an extra SaveNest/ folder. After committing, wait for Pages to finish deploying, then hard-refresh the site (Ctrl+Shift+R). If an older PWA is installed, close it and reopen the website; the service-worker cache name has been bumped.
