# Jamarkup

Jamarkup is a Chrome extension that lets you click parts of a website, write what should change, and copy a ready-made note for a teammate or AI — nothing is uploaded.

Repo: https://github.com/MinKaizen/jamarkup

---

## Setup with your AI (copy everything below)

Copy the block below and paste it into Cursor, ChatGPT, Claude, or another AI helper. It will walk you through installing Jamarkup even if you have never used Chrome Developer mode.

```
Please help me install the Jamarkup Chrome extension from
https://github.com/MinKaizen/jamarkup

I may not know Chrome Developer mode. Guide me step by step in plain language.

1) Get the files
- Prefer: download the repo as a ZIP from GitHub (Code → Download ZIP), then unzip it somewhere easy to find (for example Desktop).
- Or: if I already have the folder (cloned or shared), help me open / find that folder.
- I need the folder that contains manifest.json (that is the extension root).

2) Load it in Chrome
- Open a new Chrome tab and go to: chrome://extensions
- Turn on "Developer mode" (usually a toggle in the top-right). Explain what that means briefly: it only lets me load a local extension I trust; it is not a general hacking mode.
- Click "Load unpacked".
- Choose the Jamarkup folder (the one with manifest.json). Confirm it appears in the extensions list.

3) Pin it
- Click the puzzle-piece Extensions icon in Chrome’s toolbar.
- Find Jamarkup and pin it so the icon stays visible.

4) First use
- Open any normal website (not chrome:// pages or the Chrome Web Store).
- Click the Jamarkup icon once. A floating dock should appear in the bottom-right.
- The first time, a short "Quick tour" card may appear. I can click "Got it" so it never shows again, or "Remind me later" to hide it for now.
- Click Comment → click a section on the page → fill Problem / Want / Why (optional tag chips like Bug or Layout) → Add comment.
- Click Copy for AI, then paste into chat with my teammate or AI.
- Click the Jamarkup icon again anytime to hide the dock.

If something fails (Load unpacked greyed out, folder rejected, dock missing), diagnose with me and give the next fix — don’t assume I know DevTools.
```

---

## Quick reminder after it’s installed

1. Open the site you want to mark up.
2. Click the Jamarkup icon to show the dock (click again to hide).
3. **Comment** → click a section → fill **Problem / Want / Why** (optional chips) → **Add comment**.
4. **Copy for AI** puts the markdown on your clipboard.
5. **Clear** needs a second click (`Clear?`) before it wipes saved comments.

Escape cancels picking / closes the comment box / dismisses the tour for this session. Comments stay only on this computer.

Privacy details: [PRIVACY.md](./PRIVACY.md).

---

## For developers

- Manifest V3; content scripts `markdown.js` + `content.js`; icon toggle via `background.js`.
- Local storage keys include the comment pile, batch id, device id, and `jamarkupTourDismissed`.
- Reload the extension on `chrome://extensions` after pulling changes.
- Build a distributable zip (tracked files only, no `.git`):
  - Mac / Linux: `./build` or `node build.mjs`
  - Windows: `build.cmd` or `node build.mjs`
  - Output: `builds/jamarkup.zip` (folder is gitignored)
