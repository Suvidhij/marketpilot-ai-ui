import "server-only";
import { cookies } from "next/headers";
import type { User } from "@/types/workspace";
export const backendUrl = () =>
  (process.env.API_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");
export async function getUser(): Promise<User | null> {
  const session = (await cookies()).get("marketpilot_session");
  if (!session) return null;
  const response = await fetch(`${backendUrl()}/api/v1/auth/me`, {
    headers: { Cookie: `marketpilot_session=${session.value}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401) return null;
  if (!response.ok)
    throw new Error("The account service is unavailable. Please try again.");
  return response.json();
}
