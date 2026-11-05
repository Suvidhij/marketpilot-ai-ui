import test from "node:test";
import assert from "node:assert/strict";
import { api, ApiError, resetPreview, send } from "../api.ts";
test("demo records and calculated metrics remain consistent after edits", async () => {
  resetPreview();
  const context = await api<any>("/clients/1/overview");
  assert.equal(context.metrics.roas, 3.6667);
  assert(context.limitations[0].includes("sample"));
  const c = await api<any>(
    "/clients",
    send("POST", {
      company_name: "Sample added client",
      website: null,
      industry: "Test",
      description: "Sample",
    }),
  );
  const lead = await api<any>(
    `/clients/${c.id}/leads`,
    send("POST", {
      name: "Test",
      email: "test@example.com",
      source: "manual",
      status: "new",
      lead_score: 50,
    }),
  );
  assert.equal((await api<any[]>(`/clients/${c.id}/leads`)).length, 1);
  await api(`/clients/${c.id}`, send("DELETE"));
  await assert.rejects(
    api(`/clients/${c.id}/leads/${lead.id}`),
    (e: unknown) => e instanceof ApiError && e.status === 404,
  );
});
test("approval never publishes externally and edits cancel the preview approval", async () => {
  resetPreview();
  const approved = await api<any>(
    "/automation/actions/501/decision",
    send("POST", { decision: "approve" }),
  );
  assert.equal(approved.status, "approved");
  assert.equal(approved.external_reference, null);
  await api(
    "/clients/1/content/301",
    send("PUT", {
      title: "Edited sample",
      platform: "LinkedIn",
      body: "New draft",
    }),
  );
  const actions = await api<any[]>("/automation/actions");
  assert.equal(actions[0].status, "cancelled");
  assert.equal((await api<any>("/clients/1/content/301")).status, "draft");
});
test("live accounts, AI and workflow credentials remain explicitly disabled", async () => {
  resetPreview();
  for (const path of [
    "/auth/register",
    "/clients/1/agents/run",
    "/automation/token",
  ]) {
    await assert.rejects(
      api(path, send("POST", {})),
      (e: unknown) => e instanceof ApiError && e.status === 503,
    );
  }
  await assert.rejects(
    api("/health"),
    (e: unknown) => e instanceof ApiError && e.status === 503,
  );
});
