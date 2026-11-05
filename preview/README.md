# Interactive browser preview

This package bundles the actual application React components into a standalone static preview. It replaces Next.js routing with hash navigation and replaces HTTP calls with a browser-local sample-data adapter. Production Next.js and Python behavior is unchanged.

All starting clients and figures are illustrative. No password is requested to enter the preview. Password fields are hidden, no real account is created, and no OpenAI/n8n/provider request is made. Profile and record edits are stored in this browser's localStorage; use Reset demo to restore sample data. This is an interface preview, not a deployment of FastAPI or its authentication/database security.

From the UI repository:

```bash
npm ci --prefix preview
npm run build --prefix preview
npm test --prefix preview
```

The bundle lives in `preview/dist`. It can be hosted on a static host. Preview-specific source lives here; shared screens remain under the application's `components` and `app` directories. Hosted preview assets and Site identity are also retained in the separate Sites source repository.
