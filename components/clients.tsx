"use client";
import { FormEvent, useState } from "react";
import { api, send } from "@/lib/http";
import { useWorkspace } from "@/components/workspace";
import {
  ErrorNotice,
  Loading,
  message,
  PageHeading,
} from "@/components/workspace-common";
import type { Client } from "@/types/workspace";
export function Clients() {
  const { clients, reloadClients, selectClient, loading } = useWorkspace();
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const record = await api<Client>(
        editing === "new" ? "/clients" : `/clients/${editing?.id}`,
        send(editing === "new" ? "POST" : "PUT", {
          company_name: form.get("company_name"),
          website: form.get("website") || null,
          industry: form.get("industry"),
          description: form.get("description"),
        }),
      );
      selectClient(String(record.id));
      await reloadClients();
      setEditing(null);
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(client: Client) {
    if (
      !window.confirm(
        `Delete ${client.company_name} and all its leads, campaigns, content and reports? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api(`/clients/${client.id}`, send("DELETE"));
      await reloadClients();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const values = editing && editing !== "new" ? editing : null;
  return (
    <>
      <PageHeading
        eyebrow="CLIENT MANAGEMENT"
        title="Good work starts with context."
        description="Give each client a dedicated home for their marketing."
      >
        <button
          className="primary"
          onClick={() => {
            setEditing("new");
            setError("");
          }}
        >
          Add client +
        </button>
      </PageHeading>
      <ErrorNotice message={error} />
      {editing && (
        <section className="panel editor">
          <div className="panel-title">
            <h2>{editing === "new" ? "Add a client" : "Edit client"}</h2>
            <button
              className="small-button"
              onClick={() => setEditing(null)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
          <form key={values?.id || "new"} onSubmit={save}>
            <div className="form-grid">
              <label>
                Company name
                <input
                  name="company_name"
                  required
                  maxLength={200}
                  defaultValue={values?.company_name}
                />
              </label>
              <label>
                Website
                <input
                  name="website"
                  type="url"
                  maxLength={2048}
                  placeholder="https://example.com"
                  defaultValue={values?.website || ""}
                />
              </label>
              <label>
                Industry
                <input
                  name="industry"
                  maxLength={120}
                  defaultValue={values?.industry}
                />
              </label>
              <label className="wide">
                Business description
                <textarea
                  name="description"
                  maxLength={10000}
                  rows={4}
                  defaultValue={values?.description}
                  placeholder="What do they offer, who do they serve, and what are their marketing goals?"
                />
              </label>
            </div>
            <button className="primary" disabled={busy}>
              {busy ? "Saving…" : "Save client"}
            </button>
          </form>
        </section>
      )}
      <div className="list-tools">
        <label className="search-label">
          Find a client
          <input
            type="search"
            placeholder="Search company or industry"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span>
          {clients.length} client{clients.length !== 1 && "s"}
        </span>
      </div>
      {loading ? (
        <Loading />
      ) : clients.length === 0 ? (
        <section className="empty-state">
          <span>▦</span>
          <h2>Your first client starts here.</h2>
          <p>Add their business context. Everything else connects to it.</p>
          <button className="primary" onClick={() => setEditing("new")}>
            Add client +
          </button>
        </section>
      ) : (
        <div className="client-grid">
          {clients
            .filter((c) =>
              `${c.company_name} ${c.industry}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((c) => (
              <article key={c.id} className="panel client-card">
                <div className="client-monogram">
                  {c.company_name.slice(0, 2).toUpperCase()}
                </div>
                <span className="tag">{c.industry || "Client workspace"}</span>
                <h2>{c.company_name}</h2>
                <p>
                  {c.description ||
                    "Add a description to give your work more context."}
                </p>
                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    Visit website ↗
                  </a>
                )}
                <div className="card-actions">
                  <button
                    className="small-button"
                    onClick={() => setEditing(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-link"
                    disabled={busy}
                    onClick={() => void remove(c)}
                  >
                    Delete client
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}
      {clients.length >= 1000 && (
        <p className="note">
          Showing the latest 1,000 clients. Use the paginated API for older
          records.
        </p>
      )}
    </>
  );
}
