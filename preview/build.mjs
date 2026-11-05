import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const ui = path.resolve(here, "..");
const out = path.join(here, "dist");
fs.mkdirSync(out, { recursive: true });
await build({
  absWorkingDir: ui,
  entryPoints: [path.join(here, "entry.tsx")],
  outfile: path.join(out, "app.js"),
  bundle: true,
  minify: true,
  format: "esm",
  jsx: "automatic",
  target: ["es2022"],
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": path.join(here, "link.tsx"),
    "next/navigation": path.join(here, "navigation.tsx"),
    "@/lib/http": path.join(here, "api.ts"),
    react: path.join(here, "node_modules/react"),
    "react-dom": path.join(here, "node_modules/react-dom"),
  },
  tsconfig: path.join(ui, "tsconfig.json"),
  logLevel: "info",
});
const source = fs
  .readFileSync(path.join(ui, "app/globals.css"), "utf8")
  .replace(/@import\s+["']tailwindcss["'];?/, "");
// The application uses semantic custom classes; include the same reset used by its Tailwind build.
const reset =
  "*,:before,:after{box-sizing:border-box}html{line-height:1.5;-webkit-text-size-adjust:100%}body{margin:0}button,input,select,textarea{font:inherit}button{cursor:pointer}h1,h2,h3,p{margin-top:0}a{color:inherit;text-decoration:inherit}";
fs.writeFileSync(
  path.join(out, "app.css"),
  reset +
    "\n" +
    source +
    "\n" +
    fs.readFileSync(path.join(here, "preview.css"), "utf8"),
);
fs.writeFileSync(
  path.join(out, "index.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>MarketPilot AI — Interactive Preview</title><meta name="description" content="Explore the MarketPilot AI interface with sample data. No signup required."><link rel="stylesheet" href="./app.css"></head><body class="preview-mode"><a class="skip" href="#main">Skip to content</a><div id="root"></div><script type="module" src="./app.js"></script></body></html>',
);
console.log(
  "Built a self-contained preview from the application’s actual React components.",
);
