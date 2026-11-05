"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/workspace";
import {
  EmptyClient,
  ErrorNotice,
  Loading,
  message,
  PageHeading,
} from "@/components/workspace-common";
import { api } from "@/lib/http";
import type { Context } from "@/types/workspace";
export function Overview() {
  const { user, selected, clients, loading } = useWorkspace();
  const [context, setContext] = useState<Context | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setContext(null);
    setError("");
    if (!selected) return;
    const controller = new AbortController();
    api<Context>(`/clients/${selected.id}/overview`, {
      signal: controller.signal,
    })
      .then(setContext)
      .catch((e) => {
        if (!controller.signal.aborted) setError(message(e));
      });
    return () => controller.abort();
  }, [selected]);
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE OVERVIEW"
        title={`Hello, ${user.name.split(" ")[0]}.`}
        description="A clear view of your work. A better place to plan your next move."
      >
        <Link className="primary" href="/dashboard/clients">
          Manage clients ↗
        </Link>
      </PageHeading>
      {loading ? (
        <Loading />
      ) : !selected ? (
        <EmptyClient />
      ) : (
        <>
          <ErrorNotice message={error} />
          <div className="overview-banner">
            <div>
              <p className="eyebrow">
                IN FOCUS · {selected.industry || "YOUR CLIENT"}
              </p>
              <h2>{selected.company_name}</h2>
              <p>
                {selected.description ||
                  "Add a business description to help your AI agents understand this client."}
              </p>
            </div>
            <span className="banner-orbit" aria-hidden="true">
              ↗
            </span>
          </div>
          {!context && !error ? (
            <Loading />
          ) : (
            context && (
              <>
                <div className="stat-grid">
                  {[
                    ["Client workspaces", clients.length],
                    ["Leads", context.lead_summary.total],
                    ["Content drafts", context.content_summary.drafts],
                    [
                      "Campaign spend",
                      context.metrics.spend.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      }),
                    ],
                  ].map(([label, value]) => (
                    <article className="stat-card" key={label}>
                      <p>{label}</p>
                      <strong>{value}</strong>
                      <small>
                        {label === "Client workspaces"
                          ? "Across your account"
                          : "For selected client"}
                      </small>
                    </article>
                  ))}
                </div>
                <div className="dashboard-columns">
                  <section className="panel">
                    <div className="panel-title">
                      <h2>Campaign performance</h2>
                      <Link className="text-link" href="/dashboard/campaigns">
                        View campaigns ↗
                      </Link>
                    </div>
                    <div className="metric-list">
                      {[
                        ["Click-through rate", context.metrics.ctr, "%"],
                        ["Cost per click", context.metrics.cpc, ""],
                        ["Cost per 1,000 impressions", context.metrics.cpm, ""],
                        ["Cost per lead", context.metrics.cpl, ""],
                        ["Return on ad spend", context.metrics.roas, "×"],
                      ].map(([label, value, suffix]) => (
                        <div key={String(label)}>
                          <span>{label}</span>
                          <strong>
                            {value === null
                              ? "—"
                              : `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <p className="note">
                      Based on entered campaign totals. A dash means there isn’t
                      enough data to calculate a metric. Use one currency
                      consistently per client.
                    </p>
                  </section>
                  <section className="panel next-moves">
                    <p className="eyebrow">MAKE YOUR NEXT MOVE</p>
                    <h2>Turn context into clarity.</h2>
                    <p>
                      Ask an agent to review your saved client data and suggest
                      a practical next step.
                    </p>
                    <Link className="primary" href="/dashboard/research">
                      Explore market intelligence ↗
                    </Link>
                    <Link className="text-link" href="/dashboard/reports">
                      Build a performance report →
                    </Link>
                  </section>
                </div>
              </>
            )
          )}
        </>
      )}
    </>
  );
}
