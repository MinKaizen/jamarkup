# Jamarkup

A Chrome extension for teammates. They click a section, write the change, and copy a markdown block you can paste into an AI. Comments stay in the browser. Nothing is uploaded.

## Install

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked and choose this folder.
4. Open the site, click Comment, click the section, write the change, then Copy for AI.

Pin the extension if you also want Copy all / Clear from the toolbar popup.

## What the AI receives

Each comment includes the page URL, a CSS selector, the nearest heading, the visible text, class names, a short HTML snippet, and the requested change. The selector is a hint for the live page. The visible text and classes are what the model should use to find the source.

## Privacy

Comments stay in Chrome's local storage on this computer. See [PRIVACY.md](./PRIVACY.md).
