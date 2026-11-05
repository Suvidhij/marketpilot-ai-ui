"use client";
import { useEffect, useState } from "react";
import { api, send } from "@/lib/http";
import { useWorkspace } from "@/components/workspace";
import { AgentPanel } from "@/components/agent-panel";
import {
  EmptyClient,
  ErrorNotice,
  Loading,
  message,
  PageHeading,
  ReportView,
} from "@/components/workspace-common";
import type { Report } from "@/types/workspace";
export function Reports() {
  const { selected, loading: clientsLoading } = useWorkspace();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    setOffset(0);
  }, [selected?.id]);
  useEffect(() => {
    setReports([]);
    if (!selected) return;
    const c = new AbortController();
    setLoading(true);
    setError("");
    api<Report[]>(`/clients/${selected.id}/reports?offset=${offset}&limit=25`, {
      signal: c.signal,
    })
      .then(setReports)
      .catch((e) => {
        if (!c.signal.aborted) setError(message(e));
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [selected, offset, reload]);
  async function snapshot() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api(
        `/clients/${selected.id}/reports`,
        send("POST", {
          report_name: `Performance snapshot · ${new Date().toLocaleDateString()}`,
        }),
      );
      setOffset(0);
      setReload((n) => n + 1);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!selected || !window.confirm("Delete this saved report?")) return;
    setBusy(true);
    setError("");
    try {
      await api(`/clients/${selected.id}/reports/${id}`, send("DELETE"));
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
        eyebrow="MARKETING REPORTS"
        title="Make the story behind the numbers clear."
        description="Save a point-in-time snapshot or ask an agent for a grounded performance summary."
      >
        <button
          className="primary"
          onClick={() => void snapshot()}
          disabled={busy || !selected}
        >
          {busy ? "Saving…" : "Save performance snapshot +"}
        </button>
      </PageHeading>
      <ErrorNotice message={error} />
      {clientsLoading ? (
        <Loading />
      ) : !selected ? (
        <EmptyClient />
      ) : (
        <>
          <AgentPanel
            key={selected.id}
            agent="reporting"
            title="Marketing reporting agent"
            description="Summarize performance, identify evidence gaps, and recommend next steps."
          />
          <section className="panel">
            <div className="panel-title">
              <h2>Saved reports</h2>
              <button
                className="small-button"
                onClick={() => setReload((n) => n + 1)}
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <Loading />
            ) : reports.length === 0 ? (
              <div className="empty-inline">
                <h3>No reports yet.</h3>
                <p>
                  Create a snapshot using the campaign and lead data you’ve
                  entered.
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="report-item">
                  <ReportView report={report} />
                  <button
                    disabled={busy}
                    className="danger-link"
                    onClick={() => void remove(report.id)}
                  >
                    Delete report
                  </button>
                </div>
              ))
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
                disabled={reports.length < 25 || loading}
                onClick={() => setOffset((n) => n + 25)}
              >
                Next →
              </button>
            </div>
          </section>
        </>
      )}
    </>
  );
}
