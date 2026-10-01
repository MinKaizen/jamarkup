const KEY = "siteCommentsForAi";
const status = document.getElementById("status");

document.getElementById("copy").addEventListener("click", async () => {
  const data = await chrome.storage.local.get(KEY);
  const items = data[KEY] || [];
  if (!items.length) {
    status.textContent = "No comments yet.";
    return;
  }
  await navigator.clipboard.writeText(toMarkdown(items));
  status.textContent = "Copied " + items.length + " comment" + (items.length === 1 ? "" : "s") + ".";
});

document.getElementById("clear").addEventListener("click", async () => {
  await chrome.storage.local.set({ [KEY]: [] });
  status.textContent = "Cleared.";
});
