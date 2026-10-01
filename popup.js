const KEY = "siteCommentsForAi";
const status = document.getElementById("status");

function toMarkdown(items) {
  if (!items.length) return "";
  const blocks = items.map((item, i) => {
    const html = item.html ? "\n```html\n" + item.html + "\n```" : "";
    return [
      "### " + (i + 1) + ". " + item.comment.split("\n")[0].slice(0, 80),
      "- Page: " + item.page,
      "- Selector: `" + item.selector + "`",
      item.landmark ? "- Section: " + item.landmark : "",
      item.text ? "- Visible text: " + JSON.stringify(item.text) : "",
      item.classes ? "- Classes: `" + item.classes + "`" : "",
      "- Change: " + item.comment,
      html
    ].filter(Boolean).join("\n");
  });
  return [
    "Apply these website changes in the codebase. Match each item by visible text, nearby heading, and class names. The CSS selector describes the live page, not the source file.",
    "",
    blocks.join("\n\n")
  ].join("\n");
}

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
