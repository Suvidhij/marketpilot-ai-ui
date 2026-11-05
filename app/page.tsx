import Link from "next/link";
import { Header } from "@/components/header";
const stages = [
  [
    "01",
    "A connected foundation",
    "A responsive workspace, secure accounts, and your clients in one place.",
    "Available",
  ],
  [
    "02",
    "Your clients. One workspace.",
    "Manage leads, campaigns, content, and reports with a client-specific view.",
    "Available",
  ],
  [
    "03",
    "Intelligence that leads to action",
    "Connect OpenAI for six agents. Use n8n for workflows with human approval.",
    "Available",
  ],
];
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="dot" /> THE MARKETING WORKSPACE, REIMAGINED
            </p>
            <h1>
              Less scattered.
              <br />
              More <em>strategic.</em>
            </h1>
            <p className="intro">
              A new home for your clients, insights, and next big move.
              MarketPilot AI brings your client context, campaign metrics, and
              AI-assisted planning into one clear workspace.
            </p>
            <div className="actions">
              <Link className="primary" href="/signup">
                Create your workspace <span aria-hidden="true">↗</span>
              </Link>
              <a className="text-link" href="#roadmap">
                See what’s next <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="note">
              Your data. Your decisions. One connected workspace.
            </p>
          </div>
          <div
            className="workspace-preview"
            aria-label="Illustration of the planned marketing workspace"
          >
            <div className="preview-bar">
              <span className="mini-brand">↗ MARKETPILOT</span>
              <span className="preview-badge">WORKSPACE CONCEPT</span>
            </div>
            <div className="preview-body">
              <div className="preview-heading">
                <span>YOUR NEXT CHAPTER</span>
                <span>✳</span>
              </div>
              <h2>
                A little clarity.
                <br />A lot of possibility.
              </h2>
              <div className="orbit">
                <div className="orbit-ring" />
                <span className="orbit-center">↗</span>
                <span className="orbit-label label-one">Research</span>
                <span className="orbit-label label-two">Strategy</span>
                <span className="orbit-label label-three">Execution</span>
              </div>
              <div className="preview-foot">
                <span className="dot" />
                One connected marketing workspace
              </div>
            </div>
          </div>
        </section>
        <section id="roadmap" className="roadmap">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">BUILT WITH INTENTION</p>
                <h2>
                  A strong start.
                  <br />A clear way forward.
                </h2>
              </div>
              <p>
                A practical foundation for your everyday work.
                <br />
                Connect your data, explore insights, approve your next action.
              </p>
            </div>
            <div className="stages">
              {stages.map(([number, title, description, status]) => (
                <article key={number}>
                  <span className="stage-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className={"tag active"}>{status}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="closing wrap">
          <span className="brand-icon" aria-hidden="true">
            ↗
          </span>
          <div>
            <h2>Great marketing starts with a good foundation.</h2>
            <p>Create an account and bring your first client into focus.</p>
          </div>
          <Link className="small-button" href="/signup">
            Create your account ↗
          </Link>
        </section>
      </main>
      <footer className="wrap footer">
        <span>© {new Date().getFullYear()} MarketPilot AI</span>
        <span>Thoughtful systems. Better marketing.</span>
      </footer>
    </>
  );
}
