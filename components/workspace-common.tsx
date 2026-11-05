"use client";
import Link from "next/link";
import type { Report } from "@/types/workspace";
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function EmptyClient() {
  return (
    <section className="empty-state">
      <span aria-hidden="true">◎</span>
      <h2>Start with a client.</h2>
      <p>
        Create a client workspace to connect your leads, campaigns, content and
        insights.
      </p>
      <Link className="primary" href="/dashboard/clients">
        Add your first client ↗
      </Link>
    </section>
  );
}
export function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="form-error">
      {message}
    </p>
  ) : null;
}
export function Loading() {
  return (
    <p role="status" className="loading-state">
      Loading your saved data…
    </p>
  );
}
export const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
export function DownloadReport({ report }: { report: Report }) {
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketpilot-report-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button className="small-button" onClick={download}>
      Download JSON ↓
    </button>
  );
}
export function ReportView({ report }: { report: Report }) {
  const data = report.report_data;
  const result = data.result as Record<string, unknown> | undefined;
  const metrics =
    data.metrics !== null && typeof data.metrics === "object"
      ? data.metrics
      : null;
  return (
    <article className="insight-result">
      <div className="panel-title">
        <div>
          <span className="tag">{report.report_type}</span>
          <h3>{report.report_name}</h3>
          <small>{new Date(report.created_at).toLocaleString()}</small>
        </div>
        <DownloadReport report={report} />
      </div>
      {result ? (
        <>
          <p className="report-summary">{String(result.summary || "")}</p>
          {["insights", "recommendations", "evidence", "limitations"].map(
            (key) =>
              Array.isArray(result[key]) && (
                <section key={key}>
                  <h4>{key.replaceAll("_", " ")}</h4>
                  <ul>
                    {(result[key] as unknown[]).map((text, i) => (
                      <li key={i}>{String(text)}</li>
                    ))}
                  </ul>
                </section>
              ),
          )}
          {typeof result.draft_content === "string" && (
            <section>
              <h4>Draft for human review</h4>
              <p className="draft-text">{result.draft_content}</p>
            </section>
          )}
        </>
      ) : (
        <div>
          <p>Saved performance snapshot.</p>
          {metrics && (
            <div className="metric-list">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key}>
                  <span>{key.replaceAll("_", " ").toUpperCase()}</span>
                  <strong>{value === null ? "—" : String(value)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {Array.isArray(data.limitations) && (
        <ul className="source-notes">
          {data.limitations.map((line, i) => (
            <li key={i}>{String(line)}</li>
          ))}
        </ul>
      )}
      <details>
        <summary>Saved data and sources</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </article>
  );
}
