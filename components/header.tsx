import Link from "next/link";
export function Header() {
  return (
    <header className="header wrap">
      <Link className="brand" href="/" aria-label="MarketPilot AI home">
        <span className="brand-icon" aria-hidden="true">
          ↗
        </span>
        MarketPilot<span className="ai">AI</span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/login">Sign in</Link>
        <Link className="small-button" href="/signup">
          Get started <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
