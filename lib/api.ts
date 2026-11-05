import type { HealthResponse } from "@/types/api";
import { api } from "@/lib/http";
export async function getHealth(signal: AbortSignal): Promise<HealthResponse> {
  const data = await api<HealthResponse>("/health", { signal });
  if (
    data.status !== "ok" ||
    typeof data.service !== "string" ||
    typeof data.version !== "string"
  )
    throw new Error("The API returned an unexpected response.");
  return data;
}
