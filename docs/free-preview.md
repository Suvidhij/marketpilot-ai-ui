# Live interactive preview

[Open MarketPilot AI](https://marketpilot-ai-preview-f6k2.funnyflask4.chatgpt.site)

Use the same ChatGPT account that owns the Site. Hosting is through the connected Sites service; no paid Vercel/Render service, cloud server, OpenAI usage, or external automation has been provisioned for this preview.

Choose **Open workspace** in the banner. You can browse the real React screens, switch between sample clients, add/edit/delete preview records, create performance snapshots, download reports, and review simulated approval requests. **Reset demo** restores the initial samples.

All starting companies, people, campaigns and figures are illustrative. Edits stay in this browser's localStorage. Clearing browser storage removes them. No password is required, no real account is created, and no Python database, live AI, n8n, publishing, or advertising service is connected. Use sample information rather than real customer records. Password entry is disabled and attempts to generate real credentials or AI results return an explicit preview message.

The preview package is isolated under `preview/`; production Next.js and FastAPI remain unchanged. It reuses the application components with a preview-only browser data adapter and hash routing. The production TypeScript configuration excludes this independent package.

To rebuild from this repository:

```bash
npm ci --prefix preview
npm run build --prefix preview
npm test --prefix preview
```

Deployable assets are generated in `preview/dist` and are ignored by Git. Four checks passed, including a simulated DOM run of the actual compiled bundle that navigates to the dashboard, creates a client, saves a report, and opens approvals. HTML, CSS and JavaScript also passed local HTTP checks. The Sites deployment reported success. Full browser visual/keyboard QA has not been run.

The hosted Site has its own managed source repository containing the exact source snapshot and committed static assets. Its retained local checkout is `/workspace/sites/marketpilot-preview`; the Site identity is in that checkout's `.openai/hosting.json`. Future edits should reuse that Site rather than register another one. The FastAPI deployment described in `vercel-render.md` remains a separate full-application hosting option.
