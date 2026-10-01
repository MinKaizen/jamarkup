function toMarkdown(items, batchId) {
  if (!items.length) return "";
  const blocks = items.map((item, i) => {
    const html = item.html ? "\n```html\n" + item.html + "\n```" : "";
    const tags = Array.isArray(item.tags) && item.tags.length
      ? "- Tags: " + item.tags.join(", ")
      : "";
    return [
      "### " + (i + 1) + ". " + item.comment.split("\n")[0].slice(0, 80),
      item.commentId ? "- Id: `" + item.commentId + "`" : "",
      "- Page: " + item.page,
      "- Selector: `" + item.selector + "`",
      item.landmark ? "- Section: " + item.landmark : "",
      item.text ? "- Visible text: " + JSON.stringify(item.text) : "",
      item.classes ? "- Classes: `" + item.classes + "`" : "",
      tags,
      "- Change: " + item.comment,
      html
    ].filter(Boolean).join("\n");
  });
  return [
    "Apply these website changes in the codebase. Match each item by visible text, nearby heading, and class names. The CSS selector describes the live page, not the source file.",
    "",
    batchId ? "- Batch: `" + batchId + "`" : "",
    batchId ? "" : null,
    blocks.join("\n\n")
  ].filter((line) => line != null).join("\n");
}
