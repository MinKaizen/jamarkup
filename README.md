# Jamarkup

A Chrome extension for teammates. They click a section, write the change, and copy a markdown block you can paste into an AI. Comments stay in the browser. Nothing is uploaded.

## Install

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked and choose this folder.
4. Pin Jamarkup in the toolbar.

## Usage

1. Open the site you want to mark up.
2. Click the Jamarkup extension icon to show the floating dock on that tab (click again to hide it).
3. Click **Comment**, click a section, then fill in the soft prompt: optional **Copy / Layout / Bug / Missing** chips, plus **Problem**, **Want**, and **Why** (all optional, but at least one of those three is required). Click **Add comment**.
4. Use **Copy for AI** to put the markdown prompt on the clipboard.
5. **Clear** asks for a second click (`Clear?`) before wiping saved comments.

Escape cancels picking and closes the comment box. The dock is per-tab and stays off until you toggle it.

## What the AI receives

Each comment includes a stable comment id, the page URL, a CSS selector, the nearest heading, the visible text, class names, a short HTML snippet, any selected tags, and the structured change (Problem / Want / Why). The copied markdown also includes a batch id for the current pile so re-copies of the same comments stay idempotent. Clear starts a new batch on the next save. The selector is a hint for the live page. The visible text and classes are what the model should use to find the source.

## Privacy

Comments stay in Chrome's local storage on this computer. See [PRIVACY.md](./PRIVACY.md).
