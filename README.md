# Bách & Thư — Page 01 Opening

Static mobile-first page for GitHub Pages.

## Files
- `index.html`
- `styles.css`
- `script.js`
- `assets/page01-bg.webp`
- `assets/envelope-closed.png`

## GitHub Pages
Upload the contents of this folder to the repository root (the folder that contains `index.html`).
Then go to **Settings → Pages → Build and deployment → Deploy from a branch → main / root**.

All asset paths are relative (`./assets/...`) so the page works both on `username.github.io` and `username.github.io/repository-name/`.

## Current interaction
Tap/click the envelope to preview the opening motion. It can be tapped again to close during review. The custom browser event `wedding-invitation-opened` is already emitted so Page 02 can be connected later without rebuilding Page 01.
