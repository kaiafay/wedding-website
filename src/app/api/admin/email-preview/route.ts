import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import {
  DEFAULT_INVITE_NOTE,
  buildInviteEmailHtml,
  buildSaveTheDateEmailHtml,
  getSiteUrl,
} from "@/lib/email-templates";

function getPreviewUrlOverride(request: NextRequest): string | null {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = getSiteUrl();
  const type = request.nextUrl.searchParams.get("type") ?? "invite";
  const guestName = request.nextUrl.searchParams.get("name") ?? "Test Guest";
  const overrideUrl = getPreviewUrlOverride(request);

  let html: string;

  if (type === "save-the-date") {
    html = buildSaveTheDateEmailHtml({
      guestName,
      link: overrideUrl ?? `${siteUrl}/save-the-date?token=preview-token`,
      siteUrl,
    });
  } else if (type === "invite") {
    html = buildInviteEmailHtml({
      guestName,
      note: request.nextUrl.searchParams.get("note") ?? DEFAULT_INVITE_NOTE,
      rsvpUrl: overrideUrl ?? `${siteUrl}/?token=preview-token`,
      siteUrl,
    });
  } else {
    return NextResponse.json(
      { error: "Invalid preview type. Use invite or save-the-date." },
      { status: 400 },
    );
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
