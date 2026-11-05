export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
type Row = { id: number; client_id?: number; [key: string]: any };
interface Store {
  user: { id: number; name: string; email: string; created_at: string };
  clients: Row[];
  leads: Row[];
  campaigns: Row[];
  content: Row[];
  reports: Row[];
  actions: Row[];
  nextId: number;
}
const key = "marketpilot-interactive-preview-v1";
let current: Store | null = null;
let version = 0;
const now = () => new Date().toISOString();
function seed(): Store {
  const date = now();
  return {
    user: {
      id: 1,
      name: "Demo Marketer",
      email: "demo@example.com",
      created_at: date,
    },
    nextId: 1000,
    clients: [
      {
        id: 1,
        company_name: "Northstar Studio",
        website: "https://example.com",
        industry: "Design & digital services",
        description:
          "Sample client: a design studio helping small businesses build clearer brands. Goal: generate qualified enquiries and grow an engaged audience.",
        created_at: date,
        updated_at: date,
      },
      {
        id: 2,
        company_name: "Evergreen Goods",
        website: null,
        industry: "Sustainable retail",
        description:
          "Sample client: an independent store exploring educational content and repeat-customer campaigns.",
        created_at: date,
        updated_at: date,
      },
    ],
    campaigns: [
      {
        id: 101,
        client_id: 1,
        campaign_name: "Spring brand discovery",
        platform: "Search",
        objective: "Qualified studio enquiries",
        budget: "2500.00",
        status: "active",
        impressions: 48000,
        clicks: 1920,
        conversions: 48,
        lead_count: 96,
        spend: "1440.00",
        revenue: "5760.00",
        created_at: date,
        updated_at: date,
      },
      {
        id: 102,
        client_id: 1,
        campaign_name: "Studio stories",
        platform: "Social",
        objective: "Audience engagement",
        budget: "1200.00",
        status: "active",
        impressions: 32000,
        clicks: 960,
        conversions: 18,
        lead_count: 36,
        spend: "720.00",
        revenue: "2160.00",
        created_at: date,
        updated_at: date,
      },
      {
        id: 103,
        client_id: 2,
        campaign_name: "Thoughtful everyday choices",
        platform: "Social",
        objective: "Store discovery",
        budget: "900.00",
        status: "draft",
        impressions: 0,
        clicks: 0,
        conversions: 0,
        lead_count: 0,
        spend: "0.00",
        revenue: "0.00",
        created_at: date,
        updated_at: date,
      },
    ],
    leads: [
      {
        id: 201,
        client_id: 1,
        name: "Sample prospect A",
        email: "prospect-a@example.com",
        source: "referral",
        status: "qualified",
        lead_score: 85,
        created_at: date,
        updated_at: date,
      },
      {
        id: 202,
        client_id: 1,
        name: "Sample prospect B",
        email: "prospect-b@example.com",
        source: "inbound",
        status: "new",
        lead_score: 70,
        created_at: date,
        updated_at: date,
      },
      {
        id: 203,
        client_id: 1,
        name: "Sample prospect C",
        email: "prospect-c@example.com",
        source: "demo",
        status: "contacted",
        lead_score: 75,
        created_at: date,
        updated_at: date,
      },
    ],
    content: [
      {
        id: 301,
        client_id: 1,
        title: "A clearer brand starts with a better question",
        platform: "LinkedIn",
        content_type: "social_post",
        body: "Sample draft: Before choosing your next campaign, ask what your customers need to understand about you. A clearer story makes the next step easier.",
        status: "pending_approval",
        scheduled_at: null,
        created_at: date,
        updated_at: date,
      },
      {
        id: 302,
        client_id: 1,
        title: "Inside the studio",
        platform: "Instagram",
        content_type: "social_post",
        body: "Sample draft: A look at the ideas, sketches, and small decisions behind a thoughtful brand.",
        status: "draft",
        scheduled_at: null,
        created_at: date,
        updated_at: date,
      },
    ],
    reports: [],
    actions: [
      {
        id: 501,
        client_id: 1,
        action: "publish_content",
        resource_id: 301,
        payload: {
          title: "A clearer brand starts with a better question",
          body: "Sample draft: Before choosing your next campaign, ask what your customers need to understand about you. A clearer story makes the next step easier.",
          platform: "LinkedIn",
          scheduled_at: null,
        },
        status: "pending_approval",
        external_reference: null,
        created_at: date,
      },
    ],
  };
}
function store(): Store {
  if (current) return current;
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed?.user &&
        Array.isArray(parsed.clients) &&
        Array.isArray(parsed.actions) &&
        typeof parsed.nextId === "number"
      )
        current = parsed;
    }
  } catch {}
  current = current || seed();
  return current;
}
function save() {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(current));
  } catch {}
  version++;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("marketpilot:preview-data"));
}
export function resetPreview() {
  current = seed();
  save();
}
export function getPreviewUser() {
  return store().user;
}
export function getVersion() {
  return version;
}
export function subscribe(listener: () => void) {
  window.addEventListener("marketpilot:preview-data", listener);
  return () => window.removeEventListener("marketpilot:preview-data", listener);
}
function fail(status: number, message: string): never {
  throw new ApiError(status, message);
}
const clone = <T>(value: T): T => structuredClone(value);
function metrics(rows: Row[]) {
  const totals: Record<string, number> = {};
  for (const k of [
    "impressions",
    "clicks",
    "conversions",
    "lead_count",
    "spend",
    "revenue",
  ])
    totals[k] = rows.reduce((sum, r) => sum + Number(r[k] || 0), 0);
  const ratio = (a: string, b: string, n = 1) =>
    totals[b] ? Math.round((totals[a] / totals[b]) * n * 10000) / 10000 : null;
  return {
    ...totals,
    ctr: ratio("clicks", "impressions", 100),
    cpc: ratio("spend", "clicks"),
    cpm: ratio("spend", "impressions", 1000),
    cpl: ratio("spend", "lead_count"),
    roas: ratio("revenue", "spend"),
  };
}
function context(id: number) {
  const s = store();
  const client =
    s.clients.find((c) => c.id === id) || fail(404, "Client not found");
  const campaigns = s.campaigns.filter((c) => c.client_id === id);
  const leads = s.leads.filter((l) => l.client_id === id);
  const contents = s.content.filter((c) => c.client_id === id);
  return {
    client,
    metrics: metrics(campaigns),
    campaigns: campaigns.map((c) => ({
      id: c.id,
      name: c.campaign_name,
      platform: c.platform,
      status: c.status,
      metrics: metrics([c]),
    })),
    lead_summary: {
      total: leads.length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      won: leads.filter((l) => l.status === "won").length,
      average_score: leads.length
        ? leads.reduce((sum, l) => sum + Number(l.lead_score), 0) / leads.length
        : null,
    },
    content_summary: {
      total: contents.length,
      drafts: contents.filter((c) => c.status === "draft").length,
    },
    limitations: [
      "Interactive preview: all starting records and figures are illustrative sample data.",
      "Edits stay in this browser. No live Python backend, advertising data, OpenAI or n8n connection.",
    ],
  };
}
function paged(rows: Row[], url: URL) {
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const limit = Math.min(
    1000,
    Math.max(1, Number(url.searchParams.get("limit") || 100)),
  );
  return rows
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(offset, offset + limit);
}
export const send = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const result = handle(path, options);
  return clone(result) as T;
}
function handle(path: string, options: RequestInit): any {
  const s = store();
  const url = new URL(path, "https://preview.invalid");
  const p = url.pathname.split("/").filter(Boolean);
  const method = (options.method || "GET").toUpperCase();
  let body: any = {};
  try {
    if (options.body) body = JSON.parse(String(options.body));
  } catch {
    fail(422, "Invalid input");
  }
  if (p[0] === "health" || p[0] === "ready")
    fail(
      503,
      "This is a browser-only preview. The Python backend is not connected.",
    );
  if (p[0] === "auth") {
    if (p[1] === "me" && method === "GET") return s.user;
    if (p[1] === "me" && method === "PATCH") {
      const name = String(body.name || "").trim();
      if (!name || name.length > 120)
        fail(422, "Enter a name between 1 and 120 characters");
      s.user = { ...s.user, name };
      save();
      return s.user;
    }
    if (p[1] === "logout") return undefined;
    fail(
      503,
      "Real accounts and passwords are disabled in this preview. No credentials are saved.",
    );
  }
  if (p[0] === "clients") {
    if (p.length === 1) {
      if (method === "GET") return paged(s.clients, url).reverse();
      if (method === "POST") {
        if (!String(body.company_name || "").trim())
          fail(422, "Company name is required");
        if (body.website && !/^https?:\/\//i.test(body.website))
          fail(422, "Use an HTTP or HTTPS website URL");
        const c = {
          id: s.nextId++,
          ...body,
          created_at: now(),
          updated_at: now(),
        };
        s.clients.push(c);
        save();
        return c;
      }
    }
    const id = Number(p[1]);
    const client =
      s.clients.find((c) => c.id === id) || fail(404, "Client not found");
    if (p.length === 2) {
      if (method === "GET") return client;
      if (method === "PUT") {
        if (!String(body.company_name || "").trim())
          fail(422, "Company name is required");
        if (body.website && !/^https?:\/\//i.test(body.website))
          fail(422, "Use an HTTP or HTTPS website URL");
        Object.assign(client, body, { updated_at: now() });
        save();
        return client;
      }
      if (method === "DELETE") {
        s.clients = s.clients.filter((c) => c.id !== id);
        for (const key of [
          "leads",
          "campaigns",
          "content",
          "reports",
          "actions",
        ] as const)
          s[key] = s[key].filter((r) => r.client_id !== id);
        save();
        return undefined;
      }
    }
    if (p[2] === "overview") return context(id);
    if (p[2] === "agents")
      fail(
        503,
        "Live AI is disabled in this preview. No OpenAI request or generated insight has been substituted. The production app connects through its Python backend.",
      );
    const kind = p[2] as "leads" | "campaigns" | "content" | "reports";
    if (!["leads", "campaigns", "content", "reports"].includes(kind))
      fail(404, "Page not found");
    const rows = s[kind];
    if (p.length === 3) {
      if (method === "GET")
        return paged(
          rows.filter((r) => r.client_id === id),
          url,
        );
      if (method === "POST") {
        const data =
          kind === "reports"
            ? {
                report_name: body.report_name || "Performance snapshot",
                report_type: "performance",
                report_data: clone(context(id)),
              }
            : body;
        const row = {
          ...data,
          id: s.nextId++,
          client_id: id,
          created_at: now(),
          updated_at: now(),
          ...(kind === "content" ? { status: "draft" } : {}),
        };
        rows.push(row);
        save();
        return row;
      }
    }
    const row =
      rows.find((r) => r.id === Number(p[3]) && r.client_id === id) ||
      fail(404, "Record not found");
    if (method === "GET") return row;
    if (method === "PUT" || method === "DELETE") {
      for (const action of s.actions.filter(
        (a) =>
          a.client_id === id &&
          a.resource_id === row.id &&
          ["pending_approval", "approved"].includes(a.status),
      ))
        action.status = "cancelled";
      if (method === "DELETE") {
        s[kind] = rows.filter((r) => r.id !== row.id);
        save();
        return undefined;
      }
      Object.assign(
        row,
        body,
        { updated_at: now() },
        kind === "content" ? { status: "draft" } : {},
      );
      save();
      return row;
    }
  }
  if (p[0] === "automation") {
    if (p[1] === "status") return { workflow_token_configured: false };
    if (p[1] === "token")
      fail(
        503,
        "Workflow credentials require the live Python backend. This preview cannot connect to n8n.",
      );
    if (p[1] === "events") return [];
    if (p[1] === "actions") {
      if (p.length === 2 && method === "GET")
        return s.actions.slice().sort((a, b) => b.id - a.id);
      if (p.length === 2 && method === "POST") {
        const content = body.action === "publish_content";
        const record =
          (content ? s.content : s.campaigns).find(
            (r) => r.id === body.resource_id && r.client_id === body.client_id,
          ) || fail(404, "Record not found");
        if (
          !content &&
          (body.new_budget === undefined ||
            !Number.isFinite(Number(body.new_budget)) ||
            Number(body.new_budget) < 0)
        )
          fail(422, "Enter a valid nonnegative budget");
        for (const old of s.actions.filter(
          (a) =>
            a.client_id === body.client_id &&
            a.resource_id === record.id &&
            a.action === body.action &&
            ["pending_approval", "approved"].includes(a.status),
        ))
          old.status = "cancelled";
        const payload = content
          ? {
              title: record.title,
              body: record.body,
              platform: record.platform,
              scheduled_at: record.scheduled_at,
            }
          : {
              campaign_name: record.campaign_name,
              platform: record.platform,
              previous_budget: record.budget,
              new_budget: body.new_budget,
            };
        const action = {
          id: s.nextId++,
          client_id: body.client_id,
          resource_id: record.id,
          action: body.action,
          payload,
          status: "pending_approval",
          external_reference: null,
          created_at: now(),
        };
        s.actions.push(action);
        if (content) record.status = "pending_approval";
        save();
        return action;
      }
      if (p[3] === "decision" && method === "POST") {
        const action =
          s.actions.find((a) => a.id === Number(p[2])) ||
          fail(404, "Action not found");
        if (!["pending_approval", "approved"].includes(action.status))
          fail(409, "This action can no longer be reviewed");
        if (!["approve", "reject"].includes(body.decision))
          fail(422, "Invalid decision");
        action.status = body.decision === "approve" ? "approved" : "rejected";
        if (action.action === "publish_content") {
          const record = s.content.find((c) => c.id === action.resource_id);
          if (record)
            record.status = action.status === "approved" ? "approved" : "draft";
        }
        save();
        return action;
      }
    }
  }
  fail(404, "This action is unavailable in the interactive preview.");
}
