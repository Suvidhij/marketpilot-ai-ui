"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="status-page wrap">
      <h1>Something interrupted the connection.</h1>
      <p>Try again after checking the backend service.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
