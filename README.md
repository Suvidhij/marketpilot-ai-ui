# MarketPilot AI — UI

Phase 1 of the project brief: a Next.js + React + TypeScript + Tailwind CSS foundation. Includes a responsive landing page and a real backend connection check at `/status`. Signup, login, dashboard, clients, and AI modules are future milestones; there is no simulated user data.

## A. What are we building?
The browser interface for MarketPilot AI. This repository is separate from `marketpilot-ai-backend`, the Python API.

## B. Why do we need it?
The UI presents information and lets people interact with the API. Keeping the projects separate lets each have its own dependencies, tests, and deployment.

## C. How it works
The `/status` page calls `GET /api/v1/health` on the backend. It handles loading, success, timeout, and connection errors. The backend explicitly permits the local UI origin through CORS.

## D–E. Run it
Prerequisites: Node.js 24 LTS, npm, and Git. Open a terminal in this repository:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open http://localhost:3000. Start the backend using its README in a separate terminal, then visit http://localhost:3000/status and select **Run connection check**.

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

## F. Verify

```bash
npm run typecheck
npm run build
npm start
```

Stop `npm run dev` before running `npm start` on the same port. The production server also uses http://localhost:3000. Check the landing page on a narrow screen; use Tab to navigate links and the connection button. With the backend running, the check should succeed. Stop the backend and retry: it should show an actionable connection error.

## G. Important files

- `app/page.tsx`: public landing page and clearly marked roadmap.
- `app/status/page.tsx`: connection-check page.
- `components/connection-check.tsx`: client-side request state and timeout.
- `lib/api.ts`: API address, HTTP request, and response validation.
- `types/api.ts`: the shared health response shape.
- `app/globals.css`: responsive styling and Tailwind entry point.
- `.env.example`: safe configuration template; `.env.local` stays outside Git.

Only `NEXT_PUBLIC_API_BASE_URL` is exposed to the browser. Never add passwords or API keys to variables beginning `NEXT_PUBLIC_`. Rebuild the UI after changing this address in production.

## H. Troubleshooting

- **Connection unavailable:** run the backend on port 8000 and test its health URL directly.
- **CORS error:** the backend's `CORS_ORIGINS` must match the UI origin exactly. `localhost` and `127.0.0.1` are different origins.
- **Port in use:** stop the other process or select a different port and update the backend's allowed origin.
- **Node version error:** switch to Node 24 LTS and run `npm ci` again.
- **Remote deployment:** `localhost` refers to the visitor's computer. Set the public HTTPS backend address before building. Do not deploy this starter as an authenticated application.

See `docs/architecture.md` and `docs/project-brief.md`. Complete and verify Phase 1 before starting the database milestone.
