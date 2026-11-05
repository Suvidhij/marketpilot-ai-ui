import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Window } from "happy-dom";
const pause = () => new Promise((resolve) => setTimeout(resolve, 80));
test("compiled preview mounts, navigates, edits clients and opens reports", async () => {
  const window = new Window({
    url: "https://preview.example/",
    settings: {
      disableCSSFileLoading: true,
      disableJavaScriptFileLoading: true,
    },
  });
  (window as any).structuredClone = globalThis.structuredClone;
  const errors: string[] = [];
  window.addEventListener("error", (event) =>
    errors.push(String(event.error || event.message)),
  );
  window.fetch = async () => {
    throw Error("Unexpected external request in browser-only preview");
  };
  window.document.write(
    '<!doctype html><html><body class="preview-mode"><div id="root"></div></body></html>',
  );
  try {
    window.eval(
      fs.readFileSync(new URL("../dist/app.js", import.meta.url), "utf8"),
    );
    await pause();
    assert(window.document.body.textContent.includes("INTERACTIVE PREVIEW"));
    const open = window.document.querySelector(".preview-banner a") as any;
    assert(open);
    open.click();
    await pause();
    await pause();
    assert(
      window.document.body.textContent.includes("Northstar Studio"),
      window.document.body.textContent,
    );
    const nav = (route: string) => {
      const link = window.document.querySelector(
        `nav a[href="#/dashboard/${route}"]`,
      ) as any;
      assert(link, route);
      link.click();
    };
    nav("clients");
    await pause();
    const add = Array.from(window.document.querySelectorAll("button")).find(
      (b: any) => b.textContent.includes("Add client"),
    ) as any;
    assert(add);
    add.click();
    await pause();
    const input = window.document.querySelector(
      'input[name="company_name"]',
    ) as any;
    assert(input);
    input.value = "UI smoke sample";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    const form = input.closest("form");
    form.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );
    await pause();
    await pause();
    assert(window.document.body.textContent.includes("UI smoke sample"));
    nav("reports");
    await pause();
    await pause();
    const snapshot = Array.from(
      window.document.querySelectorAll("button"),
    ).find((b: any) =>
      b.textContent.includes("Save performance snapshot"),
    ) as any;
    assert(snapshot);
    snapshot.click();
    await pause();
    await pause();
    assert(
      window.document.body.textContent.includes("Saved performance snapshot."),
    );
    nav("automation");
    await pause();
    await pause();
    assert(window.document.body.textContent.includes("Human approval queue"));
    assert.deepEqual(errors, []);
  } finally {
    await window.happyDOM.close();
  }
});
