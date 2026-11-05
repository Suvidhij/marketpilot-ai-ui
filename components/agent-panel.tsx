"use client";
import { FormEvent, useState } from "react";
import { api, send } from "@/lib/http";
import { useWorkspace } from "@/components/workspace";
import {
  ErrorNotice,
  message,
  ReportView,
} from "@/components/workspace-common";
import type { Report } from "@/types/workspace";
export function AgentPanel({
  agent,
  title,
  description,
}: {
  agent: string;
  title: string;
  description: string;
}) {
  const { selected } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [question, setQuestion] = useState(
    "Recommend the next best marketing actions for this client.",
  );
  async function run(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setReport(null);
    try {
      setReport(
        await api<Report>(
          `/clients/${selected.id}/agents/run`,
          send("POST", { agent, question }),
        ),
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel agent-panel">
      <div className="agent-heading">
        <span className="agent-icon" aria-hidden="true">
          ✳
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="tag">AI · Human review</span>
      </div>
      <form onSubmit={run}>
        <label>
          Your brief
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            minLength={1}
            maxLength={2000}
          />
        </label>
        <div className="agent-actions">
          <small>
            Uses saved data for{" "}
            {selected?.company_name || "your selected client"}. No live website
            crawl or competitor feed.
          </small>
          <button className="primary" disabled={busy || !selected}>
            {busy ? "Preparing insights…" : "Generate insights ↗"}
          </button>
        </div>
      </form>
      <ErrorNotice message={error} />
      {busy && (
        <p role="status" className="note">
          Reading your client context and preparing a structured response. This
          can take a minute.
        </p>
      )}
      {report && selected?.id === report.client_id && (
        <ReportView report={report} />
      )}
    </section>
  );
}
