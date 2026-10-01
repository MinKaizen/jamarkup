chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "jamarkup-toggle" });
  } catch (err) {
    // No content script (chrome://, Web Store, etc.) — ignore gracefully.
  }
});
