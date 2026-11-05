"use client";
import { useEffect, useRef, useState } from "react";
import { getHealth } from "@/lib/api";
import type { HealthResponse } from "@/types/api";
type Result =
  | { state: "idle" | "loading" }
  | { state: "success"; data: HealthResponse }
  | { state: "error"; message: string };
export function ConnectionCheck() {
  const [result, setResult] = useState<Result>({ state: "idle" });
  const active = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );
  async function check() {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setResult({ state: "loading" });
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const data = await getHealth(controller.signal);
      if (active.current === controller) setResult({ state: "success", data });
    } catch (error) {
      if (active.current === controller)
        setResult({
          state: "error",
          message: controller.signal.aborted
            ? "The connection timed out. Make sure the backend is running."
            : error instanceof Error
              ? error.message
              : "Could not connect to the API.",
        });
    } finally {
      clearTimeout(timeout);
    }
  }
  return (
    <div className="check-card">
      <div className="check-title">
        <span className="brand-icon" aria-hidden="true">
          ⇄
        </span>
        <div>
          <h2>Frontend → Backend</h2>
          <p>A live check of your FastAPI service.</p>
        </div>
      </div>
      <div className="status-result" role="status" aria-live="polite">
        {result.state === "idle" && (
          <p>
            Ready when you are. Start the backend, then run a connection check.
          </p>
        )}
        {result.state === "loading" && <p>Connecting to the API…</p>}
        {result.state === "success" && (
          <>
            <p className="success">✓ Connected successfully</p>
            <p>
              {result.data.service} · v{result.data.version}
            </p>
          </>
        )}
        {result.state === "error" && (
          <>
            <p className="error">Connection unavailable</p>
            <p>{result.message}</p>
            <p>
              Check the backend address in .env.local and the allowed frontend
              origin in the backend’s .env file.
            </p>
          </>
        )}
      </div>
      <button
        className="primary"
        onClick={check}
        disabled={result.state === "loading"}
      >
        {result.state === "loading" ? "Checking…" : "Run connection check"}
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
