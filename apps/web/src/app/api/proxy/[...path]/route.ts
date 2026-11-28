import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/utils";

export const runtime = "nodejs";

async function proxyRequest(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const token = request.cookies.get("sc_admin_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized admin session." },
      { status: 401 }
    );
  }

  const targetPath = context.params.path.join("/");
  const search = request.nextUrl.search || "";
  const targetUrl = `${API_BASE_URL}/api/${targetPath}${search}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > 0) body = buf;
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Backend API server is unreachable." },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
