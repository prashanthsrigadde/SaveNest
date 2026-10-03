SaveNest V2
===========

What changed
- Premium category-first home screen
- Category cards with live saved counts
- Recently Saved section with sorting
- Library summary: saved items, categories and favorites
- Improved empty state with a clear first-save action
- Search remains available across titles, links, notes, categories and platforms
- Favorites, notes, edit and open remain available
- Added per-item delete action
- Category browsing is available from the home screen and bottom navigation
- Existing V1 localStorage keys are preserved, so existing saved data remains available
- Updated PWA/service-worker cache to V2

What it does
- Save Instagram / YouTube / web links
- Organize into categories
- Search by title, URL, notes, category and platform
- Favorites
- Notes
- Edit and delete saved links
- Sort newest/oldest/A-Z/favorites
- Backup & restore as JSON
- PWA install support
- Android Web Share Target support

Important
SaveNest stores your library locally in the browser/device using localStorage.
The app does NOT download or copy Instagram/YouTube videos. It saves the link.
Use Backup regularly if the saved library is important.

Running
For PWA install/share features, serve this folder from HTTPS (or localhost). After installing the PWA, Android can offer SaveNest in the Share sheet.
Opening index.html directly works for basic use, but browser security may limit PWA/service-worker features.
