"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, send } from "@/lib/http";
import { useWorkspace } from "@/components/workspace";
import { AgentPanel } from "@/components/agent-panel";
import {
  EmptyClient,
  ErrorNotice,
  Loading,
  message,
  PageHeading,
} from "@/components/workspace-common";
import type { BusinessRecord } from "@/types/workspace";
type Field = {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  default?: string;
  required?: boolean;
  max?: number;
};
const configs: Record<
  string,
  {
    title: string;
    description: string;
    singular: string;
    name: string;
    agent: string;
    fields: Field[];
    columns: string[];
  }
> = {
  leads: {
    title: "Every relationship starts somewhere.",
    description: "Keep a clear view of your leads and their next step.",
    singular: "lead",
    name: "name",
    agent: "lead",
    columns: ["name", "email", "source", "status", "lead_score"],
    fields: [
      { key: "name", label: "Name", required: true, max: 120 },
      { key: "email", label: "Email", type: "email", required: true, max: 254 },
      {
        key: "source",
        label: "Source",
        default: "manual",
        required: true,
        max: 120,
      },
      {
        key: "status",
        label: "Status",
        options: ["new", "qualified", "contacted", "won", "lost"],
      },
      {
        key: "lead_score",
        label: "Lead score (0–100)",
        type: "number",
        default: "0",
        max: 100,
      },
    ],
  },
  campaigns: {
    title: "Know what’s moving the needle.",
    description:
      "Track campaign plans and enter performance totals in one currency per client.",
    singular: "campaign",
    name: "campaign_name",
    agent: "campaign",
    columns: [
      "campaign_name",
      "platform",
      "status",
      "budget",
      "spend",
      "revenue",
    ],
    fields: [
      {
        key: "campaign_name",
        label: "Campaign name",
        required: true,
        max: 200,
      },
      { key: "platform", label: "Platform", required: true, max: 80 },
      { key: "objective", label: "Objective", max: 200 },
      {
        key: "budget",
        label: "Planning budget",
        type: "decimal",
        default: "0",
      },
      {
        key: "status",
        label: "Status",
        options: ["draft", "active", "paused", "completed"],
      },
      ...[
        ["impressions", "Impressions"],
        ["clicks", "Clicks"],
        ["conversions", "Conversions"],
        ["lead_count", "Leads generated"],
        ["spend", "Spend"],
        ["revenue", "Revenue"],
      ].map(([key, label]) => ({
        key,
        label,
        type: ["spend", "revenue"].includes(key) ? "decimal" : "number",
        default: "0",
      })),
    ],
  },
  content: {
    title: "Create with a little more direction.",
    description:
      "Write, refine, and prepare content for a human-approved publishing handoff.",
    singular: "content item",
    name: "title",
    agent: "content",
    columns: ["title", "platform", "content_type", "status", "scheduled_at"],
    fields: [
      { key: "title", label: "Title", required: true, max: 200 },
      { key: "platform", label: "Platform", required: true, max: 80 },
      {
        key: "content_type",
        label: "Content type",
        default: "social_post",
        required: true,
        max: 80,
      },
      {
        key: "scheduled_at",
        label: "Planned publishing time (your local timezone)",
        type: "datetime-local",
      },
      {
        key: "body",
        label: "Content body",
        type: "textarea",
        required: true,
        max: 50000,
      },
    ],
  },
};
export function Records({ resource }: { resource: string }) {
  const config = configs[resource];
  const { selected, loading: clientsLoading } = useWorkspace();
  const router = useRouter();
  const [rows, setRows] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<BusinessRecord | "new" | null>(null);
  const [offset, setOffset] = useState(0);
  const [reload, setReload] = useState(0);
  const [budgetTarget, setBudgetTarget] = useState<BusinessRecord | null>(null);
  useEffect(() => {
    setRows([]);
    setEditing(null);
    setBudgetTarget(null);
    setOffset(0);
  }, [selected?.id, resource]);
  useEffect(() => {
    if (!selected) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api<BusinessRecord[]>(
      `/clients/${selected.id}/${resource}?offset=${offset}&limit=25`,
      { signal: controller.signal },
    )
      .then(setRows)
      .catch((e) => {
        if (!controller.signal.aborted) setError(message(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selected, resource, offset, reload]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = String(form.get(field.key) || "");
      body[field.key] =
        field.type === "number"
          ? Number(value)
          : field.type === "datetime-local"
            ? value
              ? new Date(value).toISOString()
              : null
            : value;
    }
    setBusy(true);
    setError("");
    try {
      await api(
        `/clients/${selected.id}/${resource}${editing !== "new" ? `/${editing?.id}` : ""}`,
        send(editing === "new" ? "POST" : "PUT", body),
      );
      setEditing(null);
      setReload((n) => n + 1);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: BusinessRecord) {
    if (
      !selected ||
      !window.confirm(`Delete this ${config.singular}? This cannot be undone.`)
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api(
        `/clients/${selected.id}/${resource}/${row.id}`,
        send("DELETE"),
      );
      setReload((n) => n + 1);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function requestAction(row: BusinessRecord, newBudget?: string) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api(
        "/automation/actions",
        send("POST", {
          client_id: selected.id,
          resource_id: row.id,
          action: resource === "content" ? "publish_content" : "change_budget",
          ...(newBudget !== undefined ? { new_budget: newBudget } : {}),
        }),
      );
      router.push("/dashboard/automation");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  function defaultValue(field: Field) {
    const value =
      editing && editing !== "new"
        ? editing[field.key]
        : (field.default ?? field.options?.[0] ?? "");
    if (field.type === "datetime-local" && value) {
      const d = new Date(String(value));
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    return String(value ?? "");
  }
  return (
    <>
      <PageHeading
        eyebrow={
          resource === "content"
            ? "CONTENT STUDIO"
            : resource === "campaigns"
              ? "CAMPAIGN INTELLIGENCE"
              : "LEAD MANAGEMENT"
        }
        title={config.title}
        description={config.description}
      >
        <button
          className="primary"
          disabled={!selected}
          onClick={() => setEditing("new")}
        >
          Add {config.singular} +
        </button>
      </PageHeading>
      {clientsLoading ? (
        <Loading />
      ) : !selected ? (
        <EmptyClient />
      ) : (
        <>
          <ErrorNotice message={error} />
          {editing && (
            <section className="panel editor">
              <div className="panel-title">
                <h2>
                  {editing === "new" ? "Add" : "Edit"} {config.singular}
                </h2>
                <button
                  className="small-button"
                  onClick={() => setEditing(null)}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>
              <form
                key={editing === "new" ? "new" : editing.id}
                onSubmit={save}
              >
                <div className="form-grid">
                  {config.fields.map((field) => (
                    <label
                      key={field.key}
                      className={field.type === "textarea" ? "wide" : ""}
                    >
                      {field.label}
                      {field.options ? (
                        <select
                          name={field.key}
                          defaultValue={defaultValue(field)}
                        >
                          {field.options.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          name={field.key}
                          rows={6}
                          required={field.required}
                          maxLength={field.max}
                          defaultValue={defaultValue(field)}
                        />
                      ) : (
                        <input
                          name={field.key}
                          type={
                            field.type === "decimal"
                              ? "number"
                              : field.type || "text"
                          }
                          step={
                            field.type === "decimal"
                              ? "0.01"
                              : field.type === "number"
                                ? "1"
                                : undefined
                          }
                          min={
                            ["decimal", "number"].includes(field.type || "")
                              ? 0
                              : undefined
                          }
                          max={field.type === "number" ? field.max : undefined}
                          maxLength={
                            !["decimal", "number"].includes(field.type || "")
                              ? field.max
                              : undefined
                          }
                          required={field.required}
                          defaultValue={defaultValue(field)}
                        />
                      )}
                    </label>
                  ))}
                </div>
                <button className="primary" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </button>
                {resource === "content" && (
                  <p className="note">
                    Editing returns content to draft and cancels its pending
                    approvals.
                  </p>
                )}
              </form>
            </section>
          )}
          {budgetTarget && (
            <section className="panel editor">
              <h2>
                Request budget change: {String(budgetTarget.campaign_name)}
              </h2>
              <p>
                This creates a request for approval. It does not change an
                external advertising budget.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  void requestAction(
                    budgetTarget,
                    String(data.get("new_budget")),
                  );
                }}
              >
                <label>
                  New budget
                  <input
                    name="new_budget"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={String(budgetTarget.budget)}
                  />
                </label>
                <button className="primary" disabled={busy}>
                  Submit for approval
                </button>
                <button
                  type="button"
                  className="small-button"
                  onClick={() => setBudgetTarget(null)}
                >
                  Cancel
                </button>
              </form>
            </section>
          )}
          <section className="panel record-panel">
            <div className="panel-title">
              <h2>Saved {resource}</h2>
              <span className="tag">{selected.company_name}</span>
            </div>
            {loading ? (
              <Loading />
            ) : rows.length === 0 ? (
              <div className="empty-inline">
                <h3>No {resource} here yet.</h3>
                <p>
                  Add your first {config.singular} to start building a picture.
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {config.columns.map((key) => (
                        <th key={key}>{key.replaceAll("_", " ")}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        {config.columns.map((key) => (
                          <td key={key}>
                            {key === "status" ? (
                              <span className="tag">{String(row[key])}</span>
                            ) : key === "scheduled_at" ? (
                              row[key] ? (
                                new Date(String(row[key])).toLocaleString()
                              ) : (
                                "—"
                              )
                            ) : (
                              String(row[key] ?? "—")
                            )}
                          </td>
                        ))}
                        <td className="row-actions">
                          <button
                            disabled={busy}
                            onClick={() => setEditing(row)}
                          >
                            Edit
                          </button>
                          <button
                            className="danger-link"
                            disabled={busy}
                            onClick={() => void remove(row)}
                          >
                            Delete
                          </button>
                          {resource === "content" &&
                            row.status !== "published" && (
                              <button
                                disabled={busy}
                                onClick={() => void requestAction(row)}
                              >
                                Request publication
                              </button>
                            )}
                          {resource === "campaigns" && (
                            <button
                              disabled={busy}
                              onClick={() => setBudgetTarget(row)}
                            >
                              Request budget change
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination">
              <button
                className="small-button"
                disabled={offset === 0 || loading}
                onClick={() => setOffset((n) => Math.max(0, n - 25))}
              >
                ← Previous
              </button>
              <span>Page {offset / 25 + 1}</span>
              <button
                className="small-button"
                disabled={rows.length < 25 || loading}
                onClick={() => setOffset((n) => n + 25)}
              >
                Next →
              </button>
            </div>
          </section>
          <AgentPanel
            key={`${selected.id}-${resource}`}
            agent={config.agent}
            title={`${config.agent.charAt(0).toUpperCase() + config.agent.slice(1)} intelligence agent`}
            description="Get grounded recommendations from this client’s saved business data."
          />
        </>
      )}
    </>
  );
}
