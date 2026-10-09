SaveNest V9 RECOVERY — built from V7 features with runtime-render fix, legacy-link migration, and a distinct PWA installation identity.

CRITICAL FIX: the previous build referenced a missing #libraryCount DOM element. That caused a JavaScript TypeError during render, stopping the saved-video list from rendering. This build guards that optional element.

Deploy ALL files and the icons folder to the ROOT of an HTTPS site. If using GitHub Pages project hosting, deploy the contents of the SaveNest folder (not the outer folder) to the configured Pages source so index.html is at the site root/path. Do not open index.html via file://.

Install recovery: uninstall old SaveNest from Android; in Chrome open the exact deployed HTTPS URL and refresh. If the old install remains, Chrome > Settings > Site settings > All sites > your SaveNest site > Clear data, then reopen the site and install. This clears site-local data too, so export a backup from the old app first if possible.

Legacy data: imports URL values from url/link/href/permalink/videoUrl fields and keeps existing valid http/https links. Data is stored per browser origin; switching domains does not automatically transfer localStorage.

Playback: YouTube embed and direct MP4/WebM are supported. Instagram/TikTok/Facebook may block embedding; use Open original page fallback.
