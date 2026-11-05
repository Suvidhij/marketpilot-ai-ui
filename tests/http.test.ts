import test from "node:test";
import assert from "node:assert/strict";
import { api, ApiError, errorMessage } from "../lib/http.ts";

test("validation errors are readable without reflecting submitted values", () => {
  assert.equal(
    errorMessage([
      { loc: ["body", "email"], msg: "Invalid email", input: "private" },
    ]),
    "Invalid email",
  );
  assert.equal(
    errorMessage({ unexpected: "private" }),
    "The request could not be completed.",
  );
});
test("non-JSON upstream errors produce a safe message", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("<html>internal debug information</html>", { status: 502 });
  try {
    await assert.rejects(
      api("/clients"),
      (e: unknown) =>
        e instanceof ApiError &&
        e.status === 502 &&
        !e.message.includes("debug"),
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("session expiry retains status for sign-in handling", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({ detail: "Session expired" }, { status: 401 });
  try {
    await assert.rejects(
      api("/auth/me"),
      (e: unknown) =>
        e instanceof ApiError &&
        e.status === 401 &&
        e.message === "Session expired",
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("successful logout supports an empty 204 response", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 204 });
  try {
    assert.equal(await api("/auth/logout", { method: "POST" }), undefined);
  } finally {
    globalThis.fetch = original;
  }
});
