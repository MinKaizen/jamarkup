# Jamarkup privacy

Jamarkup is a Chrome extension. You click a section of a page, write the change you want, and copy those notes for an AI.

## What stays on this computer

When you save a comment, Jamarkup stores it in Chrome's local storage on that browser profile:

- the comment you typed
- the page URL
- a CSS selector for the element you clicked
- the nearest heading, the visible text, the class names, and a short HTML snippet of that element

Nothing is uploaded. There is no account, no analytics, and no server. Jamarkup does not send page content, comments, or identifiers to the developer or to anyone else.

Copying uses the clipboard on your machine. Clearing comments deletes them from local storage.

## Why it can run on every site

The comment button, highlight, and note box have to appear on the page you are reviewing. That page can be any site, so the extension is allowed to run on all URLs. It does not read a page until you click Comment and choose a section.

## Contact

Questions about this policy go to the repository that ships the extension: https://github.com/MinKaizen/jamarkup
