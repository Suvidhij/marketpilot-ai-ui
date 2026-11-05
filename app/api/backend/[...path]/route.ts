import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/lib/server-api";
export const dynamic = "force-dynamic";
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part)))
    return NextResponse.json({ detail: "Invalid API path" }, { status: 400 });
  const mutation = !["GET", "HEAD"].includes(request.method);
  const origin = process.env.APP_ORIGIN || request.nextUrl.origin;
  if (mutation && request.headers.get("origin") !== origin)
    return NextResponse.json(
      { detail: "Request origin is invalid" },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 1048576)
    return NextResponse.json(
      { detail: "Request is too large" },
      { status: 413 },
    );
  try {
    const headers = new Headers({ Accept: "application/json" });
    const session = request.cookies.get("marketpilot_session");
    if (session) headers.set("Cookie", `marketpilot_session=${session.value}`);
    if (mutation) {
      headers.set("Content-Type", "application/json");
      headers.set("X-MarketPilot-CSRF", "1");
      headers.set("Origin", origin);
    }
    // Workflow service keys never pass through the public browser proxy.
    if (path[0] === "webhooks")
      return NextResponse.json(
        { detail: "Workflow endpoints use the backend directly" },
        { status: 404 },
      );
    let body: string | undefined;
    if (mutation && request.body) {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 1048576) {
          await reader.cancel();
          return NextResponse.json(
            { detail: "Request is too large" },
            { status: 413 },
          );
        }
        chunks.push(value);
      }
      body = Buffer.concat(chunks).toString("utf8");
    }
    const upstream = await fetch(
      `${backendUrl()}/api/v1/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(75000),
      },
    );
    const response = new NextResponse(
      upstream.status === 204 ? null : await upstream.text(),
      {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
    for (const cookie of upstream.headers.getSetCookie())
      response.headers.append("Set-Cookie", cookie);
    return response;
  } catch {
    return NextResponse.json(
      { detail: "The backend is unavailable or timed out. Please try again." },
      { status: 502 },
    );
  }
}
export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
