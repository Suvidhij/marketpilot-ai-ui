"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, ApiError, send } from "@/lib/http";
import type { Client, User } from "@/types/workspace";
const navigation = [
  ["", "◈", "Overview"],
  ["clients", "▦", "Clients"],
  ["research", "◎", "Market Intelligence"],
  ["content", "✎", "Content Studio"],
  ["campaigns", "↗", "Campaign Intelligence"],
  ["leads", "♧", "Lead Management"],
  ["reports", "▤", "Reports"],
  ["assistant", "✳", "AI Assistant"],
  ["automation", "⇄", "Automation Centre"],
  ["settings", "⚙", "Settings"],
];
interface WorkspaceState {
  user: User;
  clients: Client[];
  selected: Client | null;
  selectClient: (id: string) => void;
  reloadClients: () => Promise<void>;
  error: string;
  loading: boolean;
}
const WorkspaceContext = createContext<WorkspaceState | null>(null);
export function useWorkspace() {
  const state = useContext(WorkspaceContext);
  if (!state) throw new Error("Workspace context missing");
  return state;
}
export function Workspace({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const reloadClients = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const rows = await api<Client[]>("/clients?limit=1000");
      setClients(rows);
      setSelectedId((current) =>
        rows.some((c) => String(c.id) === current)
          ? current
          : String(rows[0]?.id ?? ""),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/login");
        router.refresh();
      } else
        setError(e instanceof Error ? e.message : "Unable to load clients");
    } finally {
      setLoading(false);
    }
  }, [router]);
  useEffect(() => {
    void reloadClients();
  }, [reloadClients]);
  useEffect(() => {
    const expired = () => {
      router.replace("/login");
      router.refresh();
    };
    window.addEventListener("marketpilot:unauthorized", expired);
    return () =>
      window.removeEventListener("marketpilot:unauthorized", expired);
  }, [router]);
  async function logout() {
    setSigningOut(true);
    try {
      await api("/auth/logout", send("POST"));
      router.replace("/login");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign out");
      setSigningOut(false);
    }
  }
  const selected = clients.find((c) => String(c.id) === selectedId) || null;
  return (
    <WorkspaceContext.Provider
      value={{
        user,
        clients,
        selected,
        selectClient: setSelectedId,
        reloadClients,
        error,
        loading,
      }}
    >
      <div className="workspace-shell">
        <aside className={menu ? "sidebar open" : "sidebar"}>
          <Link className="brand" href="/dashboard">
            <span className="brand-icon">↗</span>MarketPilot
            <span className="ai">AI</span>
          </Link>
          <p className="sidebar-label">WORKSPACE</p>
          <nav aria-label="Workspace navigation">
            {navigation.map(([path, icon, title]) => (
              <Link
                key={path}
                onClick={() => setMenu(false)}
                className={
                  pathname === `/dashboard${path ? "/" + path : ""}`
                    ? "nav-item selected"
                    : "nav-item"
                }
                href={`/dashboard${path ? "/" + path : ""}`}
              >
                <span aria-hidden="true">{icon}</span>
                {title}
              </Link>
            ))}
          </nav>
          <div className="sidebar-account">
            <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="logout" onClick={logout} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </aside>
        <div className="workspace-main">
          <header className="workspace-header">
            <button
              className="mobile-menu small-button"
              aria-expanded={menu}
              aria-label="Toggle navigation"
              onClick={() => setMenu(!menu)}
            >
              ☰
            </button>
            <span className="workspace-caption">
              Your marketing, connected.
            </span>
            <label className="client-picker">
              Client workspace
              <select
                aria-label="Selected client"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={loading || clients.length === 0}
              >
                {clients.length === 0 && (
                  <option value="">No clients yet</option>
                )}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </label>
          </header>
          <main id="main" className="workspace-content">
            {error && (
              <div className="form-error" role="alert">
                {error}
                <button onClick={() => void reloadClients()}>Retry</button>
              </div>
            )}
            {children}
          </main>
          <footer className="workspace-footer">
            MarketPilot AI · Make your next move count.
          </footer>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
