"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/workspace";
import {
  ErrorNotice,
  message,
  PageHeading,
} from "@/components/workspace-common";
import { api, send } from "@/lib/http";
export function Settings() {
  const { user } = useWorkspace();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function save(event: FormEvent<HTMLFormElement>, password = false) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(
        password ? "/auth/password" : "/auth/me",
        send(
          password ? "POST" : "PATCH",
          password
            ? {
                current_password: form.get("current_password"),
                new_password: form.get("new_password"),
              }
            : { name: form.get("name") },
        ),
      );
      setSuccess(
        password
          ? "Password updated. All other sessions have been signed out."
          : "Profile saved.",
      );
      if (password) element.reset();
      router.refresh();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ACCOUNT SETTINGS"
        title="Make yourself at home."
        description="Manage your profile and keep your account secure."
      />
      <ErrorNotice message={error} />
      {success && (
        <p role="status" className="success-box">
          {success}
        </p>
      )}
      <div className="settings-grid">
        <section className="panel">
          <h2>Your profile</h2>
          <form onSubmit={(e) => void save(e)}>
            <label>
              Name
              <input
                name="name"
                defaultValue={user.name}
                required
                maxLength={120}
              />
            </label>
            <label>
              Email
              <input value={user.email} type="email" readOnly />
            </label>
            <small>
              Email changes require a verified-email flow and aren’t enabled.
            </small>
            <button className="primary" disabled={busy}>
              Save profile
            </button>
          </form>
        </section>
        <section className="panel">
          <h2>Change password</h2>
          <form onSubmit={(e) => void save(e, true)}>
            <label>
              Current password
              <input
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </label>
            <label>
              New password
              <input
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
            </label>
            <small>
              At least 12 characters. Other sessions are revoked after a change.
            </small>
            <button className="primary" disabled={busy}>
              Update password
            </button>
          </form>
        </section>
      </div>
      <section className="panel">
        <h2>AI and integrations</h2>
        <p>
          AI requests run on the backend. Your OpenAI key stays in backend
          environment variables and is never sent to this browser.
        </p>
        <p>
          Set <code>AI_ENABLED=true</code>, <code>OPENAI_API_KEY</code>, and an
          available <code>OPENAI_MODEL</code> on the backend. Use Automation
          Centre to create a separate n8n workflow credential.
        </p>
        <p className="note">
          Forgotten-password recovery and email verification need an email
          provider and are documented as remaining production work.
        </p>
      </section>
    </>
  );
}
