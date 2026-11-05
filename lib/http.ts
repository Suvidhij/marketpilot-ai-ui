export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
export function errorMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String(item.msg)
          : "Invalid input",
      )
      .join("; ");
  return "The request could not be completed.";
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...options,
    cache: "no-store",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    let message = "Service unavailable. Please try again.";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "detail" in body)
        message = errorMessage(body.detail);
    } catch {
      /* Never display raw HTML or proxy internals. */
    }
    if (response.status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("marketpilot:unauthorized"));
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const send = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
