import Link from "next/link";
import { Header } from "@/components/header";
import { ConnectionCheck } from "@/components/connection-check";
export default function StatusPage() { return <><Header/><main id="main" className="status-page wrap"><p className="eyebrow">PHASE 1 · PROJECT SETUP</p><h1>Let’s get connected.</h1><p className="intro">Two independent projects. One shared foundation.</p><ConnectionCheck/><p className="note">This checks connectivity only. Accounts and client data arrive in later milestones.</p><Link className="text-link" href="/">← Back to MarketPilot</Link></main></>; }
