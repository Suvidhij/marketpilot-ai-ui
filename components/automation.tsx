"use client";
import { useEffect, useState } from "react";
import { api, send } from "@/lib/http";
import { useWorkspace } from "@/components/workspace";
import {
  ErrorNotice,
  Loading,
  message,
  PageHeading,
} from "@/components/workspace-common";
import type { Action } from "@/types/workspace";
interface WorkflowEvent {
  id: number;
  event_id: string;
  kind: string;
  created_at: string;
  result: Record<string, unknown>;
}
export function Automation() {
  const { clients } = useWorkspace();
  const [actions, setActions] = useState<Action[]>([]);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [configured, setConfigured] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      api<Action[]>("/automation/actions", { signal: c.signal }),
      api<WorkflowEvent[]>("/automation/events", { signal: c.signal }),
      api<{ workflow_token_configured: boolean }>("/automation/status", {
        signal: c.signal,
      }),
    ])
      .then(([a, e, s]) => {
        setActions(a);
        setEvents(e);
        setConfigured(s.workflow_token_configured);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(message(e));
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [reload]);
  async function rotate() {
    if (
      configured &&
      !window.confirm(
        "Rotate the workflow key? Workflows using the old key will stop until you update them.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ token: string }>(
        "/automation/token",
        send("POST"),
      );
      setToken(result.token);
      setConfigured(true);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function revoke() {
    if (
      !window.confirm(
        "Revoke the workflow key? Connected workflows will stop authenticating.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api("/automation/token", send("DELETE"));
      setConfigured(false);
      setToken("");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function decide(id: number, decision: string) {
    setBusy(true);
    setError("");
    try {
      await api(
        `/automation/actions/${id}/decision`,
        send("POST", { decision }),
      );
      setReload((n) => n + 1);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="AUTOMATION CENTRE"
        title="Keep the work moving. Stay in control."
        description="Connect n8n securely, review consequential actions, and track incoming workflow events."
      >
        <button
          className="small-button"
          onClick={() => setReload((n) => n + 1)}
        >
          Refresh
        </button>
      </PageHeading>
      <ErrorNotice message={error} />
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Your n8n connection key</h2>
            <p>
              {configured
                ? "A workflow credential is active."
                : "No workflow credential has been created."}{" "}
              External n8n connectivity is not checked here.
            </p>
          </div>
          <span className="tag">
            {configured ? "Key active" : "Setup needed"}
          </span>
        </div>
        <p>
          Store this key as an n8n Header Auth credential named{" "}
          <code>X-Workflow-Key</code>. Workflow exports and setup instructions
          are in the backend repository.
        </p>
        <div className="actions">
          <button
            className="primary"
            disabled={busy}
            onClick={() => void rotate()}
          >
            {configured ? "Rotate key" : "Create workflow key"}
          </button>
          {configured && (
            <button
              className="danger-link"
              disabled={busy}
              onClick={() => void revoke()}
            >
              Revoke key
            </button>
          )}
        </div>
        {token && (
          <div className="token-box">
            <label>
              Copy now — this value is shown only in this session
              <input
                readOnly
                value={token}
                onFocus={(e) => e.currentTarget.select()}
              />
            </label>
            <button className="small-button" onClick={() => setToken("")}>
              I’ve saved it · Hide key
            </button>
            <p className="note">
              Treat this as a password. It permits workflow access to your
              clients. Never put it in a URL or a public workflow export.
            </p>
          </div>
        )}
      </section>
      <section className="panel">
        <div className="panel-title">
          <h2>Human approval queue</h2>
          <span className="tag">Publishing & budget changes</span>
        </div>
        <p className="note">
          Approving allows a separately configured executor to claim the exact
          saved action. Approval alone does not publish content or change an
          external budget.
        </p>
        {loading ? (
          <Loading />
        ) : actions.length === 0 ? (
          <div className="empty-inline">
            <h3>You’re in control.</h3>
            <p>
              Publication and budget requests from Content Studio and Campaign
              Intelligence appear here.
            </p>
          </div>
        ) : (
          actions.map((action) => (
            <article key={action.id} className="approval-card">
              <div className="panel-title">
                <div>
                  <p className="eyebrow">
                    {clients.find((c) => c.id === action.client_id)
                      ?.company_name || `Client #${action.client_id}`}
                  </p>
                  <h3>
                    {action.action === "publish_content"
                      ? "Publish content"
                      : "Change advertising budget"}
                  </h3>
                </div>
                <span className="tag">
                  {action.status.replaceAll("_", " ")}
                </span>
              </div>
              <dl>
                {Object.entries(action.payload).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replaceAll("_", " ")}</dt>
                    <dd>{String(value ?? "—")}</dd>
                  </div>
                ))}
              </dl>
              {action.external_reference && (
                <p>External receipt: {action.external_reference}</p>
              )}
              {["pending_approval", "approved"].includes(action.status) && (
                <div className="actions">
                  {action.status === "pending_approval" && (
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => void decide(action.id, "approve")}
                    >
                      Approve handoff
                    </button>
                  )}
                  <button
                    className="small-button"
                    disabled={busy}
                    onClick={() => void decide(action.id, "reject")}
                  >
                    {action.status === "approved"
                      ? "Revoke approval"
                      : "Reject"}
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </section>
      <section className="panel">
        <h2>Workflow activity</h2>
        {events.length === 0 ? (
          <p>
            No incoming workflow events yet. Send a test lead or report webhook
            from your configured n8n workflow.
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Kind</th>
                  <th>Received</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.event_id}</td>
                    <td>{e.kind}</td>
                    <td>{new Date(e.created_at).toLocaleString()}</td>
                    <td>
                      <code>{JSON.stringify(e.result)}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
