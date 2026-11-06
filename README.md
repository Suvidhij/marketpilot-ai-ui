# MarketPilot AI — UI

[Open the live interactive preview](https://marketpilot-ai-preview-f6k2.funnyflask4.chatgpt.site) — sample data stays in your browser. Real accounts, Python, OpenAI, and n8n are not connected to this preview. See [preview instructions](docs/free-preview.md).

Next.js, React, TypeScript, and Tailwind CSS interface for the MarketPilot AI backend. Includes landing, signup/login, a protected dashboard, clients, market intelligence, content, campaigns, leads, reports, AI assistant, automation approvals, and account settings.

## A. What are we building?
A marketing workspace using actual saved backend records. New accounts start with empty states. AI results appear only after a successful configured provider request; no generated demo insights are presented as real.

## B. Why do we need it?
The UI turns client context, metrics, records, reports, and human approvals into a coherent workflow. The backend remains responsible for storage and authorization.

## C. How it works
The browser calls the same-origin `/api/backend/*` proxy. The proxy talks to FastAPI using a server-only backend URL and forwards a scoped HttpOnly session cookie. Both the server layout and backend protect authenticated work. No login token is stored in localStorage and no OpenAI key is sent to the browser.

## Windows quick start

Open PowerShell in this repository and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Start-UI.ps1
```

This process-only policy setting handles Windows script restrictions without changing the saved execution policy. The script works from any current directory, preserves existing environment files, and installs dependencies when needed. First-time setup needs internet access. It requires Node.js 24 or newer LTS and starts Next.js on port 3000. Start the backend in a separate PowerShell window first. Leave the window open and press **Ctrl+C** to stop.

To prepare dependencies without starting the server, add `-SetupOnly`. To repair dependency installation, add `-ReinstallDependencies`. These switches go after the script filename. If port 3000 is busy, stop the existing server first; the script does not silently switch ports. Existing configuration is retained, so keep the local UI address set to `http://localhost:3000` in both projects. Back up a populated database before applying future schema changes.

The scripts use Windows PowerShell 5.1-compatible syntax. Windows CI parses them with both Windows PowerShell and PowerShell 7; this Linux workspace cannot run the Windows server commands.

## D–E. Run
Use Node.js 24 LTS. Clone this and `marketpilot-ai-backend` side by side. From this repository:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Start the backend using its README, then open http://localhost:3000/signup. Create an account, add a client, select it in the header, and add records. Windows PowerShell: `Copy-Item .env.example .env.local`.

`APP_ORIGIN` must exactly match the URL you open. `localhost` and `127.0.0.1` are different origins. `API_BACKEND_URL` is read on the server; never prefix secrets with `NEXT_PUBLIC_`.

## F. Verify

```bash
npm test
npm run typecheck
npm run build
npm start
```

Stop the development server before starting production on port 3000. Docker uses the standalone server instead. From the backend directory, `python scripts/smoke.py --ui-dir ../marketpilot-ai-ui` tests both built services together against a temporary database.

Browser checks: use Tab through forms and navigation, verify narrow-screen navigation, add/edit/delete records, switch clients, generate a report, inspect an approval payload, and sign out. AI requires backend provider configuration. Workflow keys are shown once in Automation Centre and should be saved in n8n credentials.

## G. Important files

- `app/login`, `app/signup`: account forms.
- `app/dashboard/layout.tsx`: server-side session check.
- `app/dashboard/[module]`: the feature pages.
- `app/api/backend/[...path]/route.ts`: bounded same-origin API proxy and cookie forwarding.
- `components/workspace.tsx`: navigation, client selection, and account context.
- `components/records.tsx`: validated lead, content, and campaign editors.
- `components/agent-panel.tsx`: AI request state and saved result display.
- `components/automation.tsx`: credential rotation and approval queue.
- `lib/http.ts`: shared HTTP and safe error handling.
- `lib/server-api.ts`: server-only backend configuration and user lookup.
- `types/workspace.ts`: frontend contracts.
- `app/globals.css`: responsive styles, keyboard focus, and reduced-motion support.

## H. Troubleshooting

- **Backend unavailable:** start FastAPI and check `API_BACKEND_URL`.
- **Origin invalid:** match `APP_ORIGIN` to the UI URL and update backend `CORS_ORIGINS`.
- **Redirected to login:** your session expired, was revoked, or is missing.
- **No data:** select a client; new accounts contain no preloaded records.
- **AI not configured:** set the key on the backend, not in this repository.
- **Action approved but not published:** approval is permission for your configured n8n/provider executor. No external publishing service is connected by approval alone.
- **Cookie missing in production:** use HTTPS and the backend's `COOKIE_SECURE=true` setting.

Architecture: `docs/architecture.md`. Deployment is coordinated from the backend repository's `docs/deployment.md`. See `docs/milestones.md` for verified work and external dependencies.

Recommended managed hosting: [Vercel + Render](docs/vercel-render.md). Verification details and limits: [docs/verification.md](docs/verification.md).
