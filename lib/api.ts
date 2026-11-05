import type { HealthResponse } from "@/types/api";
const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
export async function getHealth(signal: AbortSignal): Promise<HealthResponse> {
 const response = await fetch(`${baseUrl}/api/v1/health`, { signal, cache: "no-store" });
 if (!response.ok) throw new Error(`The API returned HTTP ${response.status}.`);
 const data: unknown = await response.json();
 if (typeof data !== "object" || data === null || !("status" in data) || data.status !== "ok" || !("service" in data) || typeof data.service !== "string" || !("version" in data) || typeof data.version !== "string") throw new Error("The API returned an unexpected response.");
 return data as HealthResponse;
}
