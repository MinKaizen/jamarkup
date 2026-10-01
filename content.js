(() => {
  if (window.__siteCommentsForAi) return;
  window.__siteCommentsForAi = true;

  const KEY = "siteCommentsForAi";
  const DEVICE_KEY = "jamarkupDeviceId";
  const BATCH_KEY = "jamarkupBatchId";
  const TAGS = ["Copy", "Layout", "Bug", "Missing"];
  const SHORT_PROBLEM = 12;
  const host = document.createElement("div");
  host.setAttribute("data-site-comments-root", "1");
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);

  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      .dock, .box, .hl, .count { all: initial; font-family: ui-sans-serif, system-ui, sans-serif; }
      .dock {
        position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
        display: none; align-items: center; gap: 6px;
      }
      .dock.visible { display: flex; }
      .count {
        font: 12px/1 system-ui, sans-serif;
        color: #57534e; background: white; border-radius: 999px;
        padding: 10px 12px; box-shadow: 0 6px 20px rgba(0,0,0,.2);
        white-space: nowrap;
      }
      button {
        font: 13px/1 system-ui, sans-serif;
        border: 0; border-radius: 999px; padding: 10px 12px; cursor: pointer;
        background: #1c1917; color: white; box-shadow: 0 6px 20px rgba(0,0,0,.2);
      }
      button.ghost { background: white; color: #1c1917; }
      button.muted { background: #f5f5f4; color: #57534e; box-shadow: 0 4px 14px rgba(0,0,0,.12); }
      button:disabled { opacity: 0.55; cursor: default; }
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
      .meta { font-size: 11px; color: #78716c; margin: 0 0 8px; word-break: break-all; }
      .chips {
        display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px;
      }
      .chip {
        font: 12px/1 system-ui, sans-serif;
        border: 1px solid #e7e5e4; border-radius: 999px;
        padding: 6px 10px; cursor: pointer;
        background: #f5f5f4; color: #57534e;
        box-shadow: none;
      }
      .chip.on {
        background: #1c1917; color: white; border-color: #1c1917;
      }
      .fields { display: flex; flex-direction: column; gap: 6px; }
      .fields label {
        display: block; font: 11px/1.2 system-ui, sans-serif; color: #78716c; margin: 0;
      }
      .fields textarea {
        width: 100%; min-height: 44px; resize: vertical; font: 13px/1.4 system-ui, sans-serif;
        border: 1px solid #e7e5e4; border-radius: 8px; padding: 8px;
        color: #1c1917; background: white;
      }
      .hint {
        display: none; margin: 8px 0 0; font: 11px/1.35 system-ui, sans-serif; color: #a16207;
      }
      .hint.show { display: block; }
      .row { display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; }
      .row button { padding: 8px 10px; }
    </style>
    <div class="hl"></div>
    <div class="box">
      <p class="meta"></p>
      <div class="chips">
        ${TAGS.map((tag) => `<button class="chip" type="button" data-tag="${tag}">${tag}</button>`).join("")}
      </div>
      <div class="fields">
        <label>Problem
          <textarea data-field="problem" placeholder="what's wrong or missing" rows="2"></textarea>
        </label>
        <label>Want
          <textarea data-field="want" placeholder="what it should do or look like" rows="2"></textarea>
        </label>
        <label>Why
          <textarea data-field="why" placeholder="optional context for priority" rows="2"></textarea>
        </label>
      </div>
      <p class="hint" data-hint></p>
      <div class="row">
        <button class="ghost" type="button" data-act="cancel">Cancel</button>
        <button type="button" data-act="save">Add comment</button>
      </div>
    </div>
    <div class="dock">
      <span class="count" data-count>0 comments</span>
      <button class="muted" type="button" data-act="clear">Clear</button>
      <button class="ghost" type="button" data-act="copy">Copy for AI</button>
      <button type="button" data-act="pick">Comment</button>
    </div>
  `;

  const hl = shadow.querySelector(".hl");
  const box = shadow.querySelector(".box");
  const dock = shadow.querySelector(".dock");
  const meta = shadow.querySelector(".meta");
  const problemEl = shadow.querySelector('[data-field="problem"]');
  const wantEl = shadow.querySelector('[data-field="want"]');
  const whyEl = shadow.querySelector('[data-field="why"]');
  const hintEl = shadow.querySelector("[data-hint]");
  const chipEls = [...shadow.querySelectorAll(".chip")];
  const countEl = shadow.querySelector("[data-count]");
  const pickBtn = shadow.querySelector('[data-act="pick"]');
  const copyBtn = shadow.querySelector('[data-act="copy"]');
  const clearBtn = shadow.querySelector('[data-act="clear"]');
  const saveBtn = shadow.querySelector('[data-act="save"]');
  let picking = false;
  let current = null;
  let dockVisible = false;
  let copyBtnReset = null;
  let clearArmed = false;
  let clearArmReset = null;
  let shortNudgeArmed = false;
  let saving = false;

  function flashCopy(label) {
    if (copyBtnReset) clearTimeout(copyBtnReset);
    copyBtn.textContent = label;
    copyBtnReset = setTimeout(() => {
      copyBtn.textContent = "Copy for AI";
      copyBtnReset = null;
    }, 1200);
  }

  function resetClearArm() {
    clearArmed = false;
    clearBtn.textContent = "Clear";
    if (clearArmReset) {
      clearTimeout(clearArmReset);
      clearArmReset = null;
    }
  }

  function selectedTags() {
    return chipEls.filter((el) => el.classList.contains("on")).map((el) => el.dataset.tag);
  }

  function fieldValues() {
    return {
      problem: problemEl.value.trim(),
      want: wantEl.value.trim(),
      why: whyEl.value.trim()
    };
  }

  function resetCommentForm() {
    problemEl.value = "";
    wantEl.value = "";
    whyEl.value = "";
    chipEls.forEach((el) => el.classList.remove("on"));
    hintEl.textContent = "";
    hintEl.classList.remove("show");
    shortNudgeArmed = false;
  }

  function assembleComment(fields) {
    const lines = [];
    if (fields.problem) lines.push("Problem: " + fields.problem);
    if (fields.want) lines.push("Want: " + fields.want);
    if (fields.why) lines.push("Why: " + fields.why);
    return lines.join("\n");
  }

  function showHint(text) {
    hintEl.textContent = text;
    hintEl.classList.toggle("show", Boolean(text));
  }

  function own(node) {
    return node === host || host.contains(node);
  }

  function newUuid() {
    return crypto.randomUUID();
  }

  async function ensureDeviceId() {
    const data = await chrome.storage.local.get(DEVICE_KEY);
    if (data[DEVICE_KEY]) return data[DEVICE_KEY];
    const id = newUuid();
    await chrome.storage.local.set({ [DEVICE_KEY]: id });
    return id;
  }

  function makeBatchId(deviceId) {
    return "jamarkup:" + deviceId + "-" + Date.now();
  }

  async function loadPile() {
    const data = await chrome.storage.local.get([KEY, BATCH_KEY, DEVICE_KEY]);
    let items = data[KEY] || [];
    let batchId = data[BATCH_KEY] || null;
    let dirty = false;

    for (const item of items) {
      if (!item.commentId) {
        item.commentId = newUuid();
        dirty = true;
      }
    }

    if (items.length && !batchId) {
      const deviceId = data[DEVICE_KEY] || await ensureDeviceId();
      batchId = makeBatchId(deviceId);
      dirty = true;
    }

    if (dirty) {
      const patch = { [KEY]: items };
      if (batchId) patch[BATCH_KEY] = batchId;
      await chrome.storage.local.set(patch);
    }

    return { items, batchId };
  }

  async function refreshCount() {
    try {
      const { items } = await loadPile();
      const n = items.length;
      countEl.textContent = n + " comment" + (n === 1 ? "" : "s");
    } catch (err) {
      // Extension context invalidated — ignore.
    }
  }

  function setDockVisible(visible) {
    dockVisible = visible;
    dock.classList.toggle("visible", visible);
    if (!visible) {
      cancelUi();
      resetClearArm();
    } else {
      refreshCount();
    }
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
    const top = Math.min(y + 8, window.innerHeight - 360);
    box.style.left = Math.max(8, left) + "px";
    box.style.top = Math.max(8, top) + "px";
    problemEl.focus();
  }

  function stopPicking() {
    picking = false;
    hl.style.display = "none";
    pickBtn.textContent = "Comment";
  }

  function closeBox() {
    box.style.display = "none";
    current = null;
    resetCommentForm();
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
    resetCommentForm();
    placeBox(event.clientX, event.clientY);
    stopPicking();
  }, true);

  shadow.addEventListener("click", async (event) => {
    const tag = event.target?.dataset?.tag;
    if (tag) {
      event.target.classList.toggle("on");
      showHint("");
      shortNudgeArmed = false;
      return;
    }

    const act = event.target?.dataset?.act;
    if (act === "pick") {
      resetClearArm();
      box.style.display = "none";
      picking = !picking;
      pickBtn.textContent = picking ? "Picking…" : "Comment";
      if (!picking) hl.style.display = "none";
    }
    if (act === "cancel") closeBox();
    if (act === "save") {
      if (!current || saving) return;
      const tags = selectedTags();
      const fields = fieldValues();
      const hasField = Boolean(fields.problem || fields.want || fields.why);
      if (!hasField) {
        showHint(tags.length
          ? "Add a Problem, Want, or Why — tags alone aren’t enough."
          : "Add a Problem, Want, or Why before saving.");
        shortNudgeArmed = false;
        return;
      }

      const shortProblemOnly =
        fields.problem &&
        fields.problem.length < SHORT_PROBLEM &&
        !fields.want;
      if (shortProblemOnly && !shortNudgeArmed) {
        shortNudgeArmed = true;
        showHint("Add what you Want, or click Add comment again.");
        return;
      }

      const comment = assembleComment(fields);
      if (!comment) return;

      saving = true;
      saveBtn.disabled = true;
      try {
        const deviceId = await ensureDeviceId();
        const { items, batchId: existingBatch } = await loadPile();
        let batchId = existingBatch;
        if (!items.length || !batchId) {
          batchId = makeBatchId(deviceId);
        }
        const item = {
          commentId: newUuid(),
          page: location.href,
          selector: cssPath(current),
          landmark: landmark(current),
          text: (current.innerText || "").trim().replace(/\s+/g, " ").slice(0, 180),
          classes: [...current.classList].slice(0, 6).join(" "),
          html: snippet(current),
          comment,
          tags,
          at: new Date().toISOString()
        };
        items.push(item);
        await chrome.storage.local.set({ [KEY]: items, [BATCH_KEY]: batchId });
        closeBox();
        pickBtn.textContent = "Added " + items.length;
        setTimeout(() => { pickBtn.textContent = "Comment"; }, 1200);
        refreshCount();
      } catch (err) {
        console.warn("Jamarkup save failed", err);
      } finally {
        saving = false;
        saveBtn.disabled = false;
      }
    }
    if (act === "copy") {
      resetClearArm();
      try {
        const { items, batchId } = await loadPile();
        if (!items.length) {
          flashCopy("Nothing yet");
          return;
        }
        try {
          await navigator.clipboard.writeText(toMarkdown(items, batchId));
          flashCopy("Copied " + items.length);
        } catch (err) {
          flashCopy("Copy failed");
          console.warn("Jamarkup clipboard write failed", err);
        }
        refreshCount();
      } catch (err) {
        flashCopy("Copy failed");
        console.warn("Jamarkup copy failed", err);
      }
    }
    if (act === "clear") {
      if (!clearArmed) {
        clearArmed = true;
        clearBtn.textContent = "Clear?";
        clearArmReset = setTimeout(resetClearArm, 2500);
        return;
      }
      resetClearArm();
      try {
        await chrome.storage.local.set({ [KEY]: [] });
        await chrome.storage.local.remove(BATCH_KEY);
        await refreshCount();
        clearBtn.textContent = "Cleared";
        setTimeout(() => { clearBtn.textContent = "Clear"; }, 1200);
      } catch (err) {
        console.warn("Jamarkup clear failed", err);
      }
    }
  });

  try {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message || message.type !== "jamarkup-toggle") return;
      try {
        setDockVisible(!dockVisible);
        sendResponse({ ok: true, visible: dockVisible });
      } catch (err) {
        sendResponse({ ok: false });
      }
      return true;
    });
  } catch (err) {
    // Extension context may already be invalidated.
  }
})();
