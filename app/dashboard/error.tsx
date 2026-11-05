"use client";
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="status-page wrap">
      <h1>We couldn’t load your workspace.</h1>
      <p>Check the backend connection and try again.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
