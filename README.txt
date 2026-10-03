SaveNest V1
===========

What it does
- Save Instagram / YouTube / web links
- Organize into categories
- Search by title, URL, notes, category and platform
- Favorites
- Notes
- Edit/delete via your device/browser data
- Sort newest/oldest/A-Z/favorites
- Backup & restore as JSON
- PWA install support
- Android Web Share Target support: Share an Instagram/YouTube link -> SaveNest -> choose category

Important
This V1 stores your library locally in the browser/device using localStorage.
The app does NOT download or copy Instagram/YouTube videos. It saves the link.
Use Backup regularly if the saved library is important.

Running
For PWA install/share features, serve this folder from HTTPS (or localhost). After installing the PWA, Android can offer SaveNest in the Share sheet.
Opening index.html directly works for basic use, but browser security may limit PWA/service-worker features.

Suggested next upgrades
- Automatic thumbnails and video previews
- Folders + subcategories
- Drag-and-drop organization
- Cloud sync/login
- Android APK / Play Store build
- Reminder: "watch this later"
