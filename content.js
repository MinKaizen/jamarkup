(() => {
  if (window.__siteCommentsForAi) return;
  window.__siteCommentsForAi = true;

  const KEY = "siteCommentsForAi";
  const host = document.createElement("div");
  host.setAttribute("data-site-comments-root", "1");
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      .dock, .box, .hl { all: initial; font-family: ui-sans-serif, system-ui, sans-serif; }
      .dock {
        position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
        display: flex; gap: 6px;
      }
      button {
        font: 13px/1 system-ui, sans-serif;
        border: 0; border-radius: 999px; padding: 10px 12px; cursor: pointer;
        background: #1c1917; color: white; box-shadow: 0 6px 20px rgba(0,0,0,.2);
      }
      button.ghost { background: white; color: #1c1917; }
      .hl {
        position: fixed; pointer-events: none; z-index: 2147483646;
        border: 2px solid #0f766e; background: rgba(15,118,110,.12);
        display: none;
      }
      .box {
        position: fixed; z-index: 2147483647; width: 320px;
        background: white; color: #1c1917; border-radius: 12px;
        box-shadow: 0 16px 40px rgba(0,0,0,.22); padding: 12px; display: none;
      }
      textarea {
        width: 100%; min-height: 88px; resize: vertical; font: 13px/1.4 system-ui, sans-serif;
        border: 1px solid #e7e5e4; border-radius: 8px; padding: 8px;
      }
      .meta { font-size: 11px; color: #78716c; margin: 0 0 8px; word-break: break-all; }
      .row { display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; }
      .row button { padding: 8px 10px; }
    </style>
    <div class="hl"></div>
    <div class="box">
      <p class="meta"></p>
      <textarea placeholder="What should change in this section?"></textarea>
      <div class="row">
        <button class="ghost" type="button" data-act="cancel">Cancel</button>
        <button type="button" data-act="save">Add comment</button>
      </div>
    </div>
    <div class="dock">
      <button class="ghost" type="button" data-act="copy">Copy for AI</button>
      <button type="button" data-act="pick">Comment</button>
    </div>
  `;

  const hl = shadow.querySelector(".hl");
  const box = shadow.querySelector(".box");
  const meta = shadow.querySelector(".meta");
  const textarea = shadow.querySelector("textarea");
  const pickBtn = shadow.querySelector('[data-act="pick"]');
  const copyBtn = shadow.querySelector('[data-act="copy"]');
  let picking = false;
  let current = null;
  let copyBtnReset = null;

  function flashCopy(label) {
    if (copyBtnReset) clearTimeout(copyBtnReset);
    copyBtn.textContent = label;
    copyBtnReset = setTimeout(() => {
      copyBtn.textContent = "Copy for AI";
      copyBtnReset = null;
    }, 1200);
  }

  function own(node) {
    return node === host || host.contains(node);
  }

  function cssPath(el) {
    if (!(el instanceof Element)) return "";
    if (el.id && document.querySelectorAll("#" + CSS.escape(el.id)).length === 1) {
      return "#" + CSS.escape(el.id);
    }
    const testid = el.getAttribute("data-testid") || el.getAttribute("data-test");
    if (testid) return `[data-testid="${CSS.escape(testid)}"]`;
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body && parts.length < 5) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift("#" + CSS.escape(node.id));
        break;
      }
      const classes = [...node.classList]
        .filter((c) => c && c.length < 40 && !/^(css-|sc-|jsx-|emotion-|svelte-)/.test(c))
        .slice(0, 2);
      if (classes.length) part += "." + classes.map((c) => CSS.escape(c)).join(".");
      const parent = node.parentElement;
      if (parent) {
        const same = [...parent.children].filter((n) => n.tagName === node.tagName);
        if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.join(" > ");
  }

  function landmark(el) {
    let node = el;
    while (node && node !== document.body) {
      const heading = node.querySelector?.("h1, h2, h3");
      if (heading && heading !== el && node.contains(el)) {
        const text = heading.innerText.trim().replace(/\s+/g, " ").slice(0, 80);
        if (text) return text;
      }
      const labelled = node.getAttribute?.("aria-label");
      if (labelled) return labelled.slice(0, 80);
      node = node.parentElement;
    }
    return "";
  }

  function snippet(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll("script, style").forEach((n) => n.remove());
    return clone.outerHTML.replace(/\s+/g, " ").trim().slice(0, 700);
  }

  function placeBox(x, y) {
    box.style.display = "block";
    const width = 320;
    const left = Math.min(x, window.innerWidth - width - 12);
    const top = Math.min(y + 8, window.innerHeight - 220);
    box.style.left = Math.max(8, left) + "px";
    box.style.top = Math.max(8, top) + "px";
    textarea.focus();
  }

  function stopPicking() {
    picking = false;
    hl.style.display = "none";
    pickBtn.textContent = "Comment";
  }

  function closeBox() {
    box.style.display = "none";
    current = null;
  }

  function cancelUi() {
    stopPicking();
    closeBox();
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!picking && box.style.display !== "block") return;
    event.preventDefault();
    cancelUi();
  }, true);

  document.addEventListener("mousedown", (event) => {
    if (picking) return;
    if (box.style.display !== "block") return;
    if (own(event.target)) return;
    closeBox();
  }, true);

  document.addEventListener("mousemove", (event) => {
    if (!picking || own(event.target)) return;
    const rect = event.target.getBoundingClientRect();
    hl.style.display = "block";
    hl.style.left = rect.left + "px";
    hl.style.top = rect.top + "px";
    hl.style.width = rect.width + "px";
    hl.style.height = rect.height + "px";
  }, true);

  document.addEventListener("click", (event) => {
    if (!picking || own(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    current = event.target;
    meta.textContent = cssPath(current);
    textarea.value = "";
    placeBox(event.clientX, event.clientY);
    stopPicking();
  }, true);

  shadow.addEventListener("click", async (event) => {
    const act = event.target?.dataset?.act;
    if (act === "pick") {
      box.style.display = "none";
      picking = !picking;
      pickBtn.textContent = picking ? "Picking…" : "Comment";
      if (!picking) hl.style.display = "none";
    }
    if (act === "cancel") closeBox();
    if (act === "save") {
      const comment = textarea.value.trim();
      if (!comment || !current) return;
      const item = {
        page: location.href,
        selector: cssPath(current),
        landmark: landmark(current),
        text: (current.innerText || "").trim().replace(/\s+/g, " ").slice(0, 180),
        classes: [...current.classList].slice(0, 6).join(" "),
        html: snippet(current),
        comment,
        at: new Date().toISOString()
      };
      const data = await chrome.storage.local.get(KEY);
      const items = data[KEY] || [];
      items.push(item);
      await chrome.storage.local.set({ [KEY]: items });
      closeBox();
      pickBtn.textContent = "Added " + items.length;
      setTimeout(() => { pickBtn.textContent = "Comment"; }, 1200);
    }
    if (act === "copy") {
      const data = await chrome.storage.local.get(KEY);
      const items = data[KEY] || [];
      if (!items.length) {
        flashCopy("Nothing yet");
        return;
      }
      try {
        await navigator.clipboard.writeText(toMarkdown(items));
        flashCopy("Copied " + items.length);
      } catch (err) {
        flashCopy("Copy failed");
        console.warn("Jamarkup clipboard write failed", err);
      }
    }
  });
})();
