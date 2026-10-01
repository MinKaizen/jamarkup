# Jamarkup privacy

Jamarkup is a Chrome extension. You click a section of a page, write the change you want, and copy those notes for an AI.

## What stays on this computer

When you save a comment, Jamarkup stores it in Chrome's local storage on that browser profile:

- the comment you typed
- the page URL
- a CSS selector for the element you clicked
- the nearest heading, the visible text, the class names, and a short HTML snippet of that element
- a per-comment id, a batch id for the current pile, and a local device id (created once in this browser profile)

Nothing is uploaded. There is no account, no analytics, and no server. Jamarkup does not send page content, comments, or identifiers to the developer or to anyone else.

Copying uses the clipboard on your machine. Clearing comments deletes the pile and its batch id from local storage; the device id stays so later piles can keep stable batch ids.

## Why it can run on every site

The floating dock, highlight, and note box have to appear on the page you are reviewing when you click the extension icon. That page can be any site, so the extension is allowed to run on all URLs. It does not read a page until you show the dock, click Comment, and choose a section.

## Contact

Questions about this policy go to the repository that ships the extension: https://github.com/MinKaizen/jamarkup
