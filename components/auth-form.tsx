"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, send } from "@/lib/http";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const body = {
      email: data.get("email"),
      password: data.get("password"),
      ...(signup ? { name: data.get("name") } : {}),
    };
    try {
      await api(signup ? "/auth/register" : "/auth/login", send("POST", body));
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="auth-page">
      <Link className="brand" href="/">
        <span className="brand-icon">↗</span>MarketPilot AI
      </Link>
      <div className="auth-card">
        <p className="eyebrow">YOUR MARKETING WORKSPACE</p>
        <h1>{signup ? "Make room for better marketing." : "Welcome back."}</h1>
        <p>
          {signup
            ? "Create your account and start with your first client."
            : "Sign in to pick up where you left off."}
        </p>
        <form onSubmit={submit}>
          {signup && (
            <label>
              Your name
              <input name="name" autoComplete="name" required maxLength={120} />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 12 : 1}
              maxLength={128}
              required
            />
          </label>
          {signup && (
            <small>
              Use at least 12 characters. A memorable passphrase works well.
            </small>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account ↗" : "Sign in ↗"}
          </button>
        </form>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "New to MarketPilot?"}{" "}
          <Link href={signup ? "/login" : "/signup"}>
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
