import React, { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { Header } from "../components/header";
import { Workspace } from "../components/workspace";
import { Overview } from "../components/overview";
import { Clients } from "../components/clients";
import { Records } from "../components/records";
import { Reports } from "../components/reports";
import { Intelligence } from "../components/intelligence";
import { Automation } from "../components/automation";
import { Settings } from "../components/settings";
import { getPreviewUser, getVersion, resetPreview, subscribe } from "./api";
import { usePathname, useRouter } from "./navigation";
import Link from "./link";
class PreviewError extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main id="main" className="status-page wrap">
        <h1>The preview couldn’t load.</h1>
        <p>
          Your stored preview data may be out of date. Reset the sample
          workspace and try again.
        </p>
        <button
          className="primary"
          onClick={() => {
            resetPreview();
            window.location.reload();
          }}
        >
          Reset preview
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Preview() {
  const path = usePathname();
  const router = useRouter();
  useSyncExternalStore(subscribe, getVersion, () => 0);
  const dashboard = path.startsWith("/dashboard");
  const module = path.split("/")[2] || "";
  let content: React.ReactNode;
  if (dashboard) {
    content =
      module === "clients" ? (
        <Clients />
      ) : ["leads", "campaigns", "content"].includes(module) ? (
        <Records resource={module} />
      ) : module === "reports" ? (
        <Reports />
      ) : module === "research" ? (
        <Intelligence />
      ) : module === "assistant" ? (
        <Intelligence assistant />
      ) : module === "automation" ? (
        <Automation />
      ) : module === "settings" ? (
        <Settings />
      ) : (
        <Overview />
      );
    content = <Workspace user={getPreviewUser()}>{content}</Workspace>;
  } else if (path === "/login" || path === "/signup") {
    content = (
      <>
        <Header />
        <main id="main" className="auth-page">
          <div className="auth-card">
            <p className="eyebrow">LIVE INTERACTIVE PREVIEW</p>
            <h1>Take a look around.</h1>
            <p>
              No signup or password needed. Explore the actual React screens
              using illustrative client data.
            </p>
            <p>
              Changes are saved only in this browser. This preview has no live
              Python, OpenAI, or n8n connection.
            </p>
            <button
              className="primary"
              onClick={() => router.push("/dashboard")}
            >
              Enter demo workspace ↗
            </button>
            <p className="note">
              Please use sample business information, not real client records or
              credentials.
            </p>
          </div>
        </main>
      </>
    );
  } else if (path === "/status") {
    content = (
      <>
        <Header />
        <main id="main" className="status-page wrap">
          <h1>Interactive preview is online.</h1>
          <p className="intro">
            The screens run in your browser using sample data. The production
            FastAPI backend is not connected to this preview.
          </p>
          <Link className="primary" href="/dashboard">
            Open demo workspace ↗
          </Link>
        </main>
      </>
    );
  } else content = <Home />;
  return (
    <>
      <div className="preview-banner">
        <div>
          <strong>INTERACTIVE PREVIEW</strong>
          <span>
            Sample data · saved in this browser · AI & automation offline
          </span>
        </div>
        <div>
          <Link href="/dashboard">Open workspace ↗</Link>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reset sample data and discard your preview edits?",
                )
              ) {
                resetPreview();
                window.location.reload();
              }
            }}
          >
            Reset demo
          </button>
        </div>
      </div>
      <PreviewError key={dashboard ? "workspace" : "public"}>
        {content}
      </PreviewError>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
