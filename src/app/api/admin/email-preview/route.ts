import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import {
  DEFAULT_INVITE_NOTE,
  buildInviteEmailHtml,
  buildInviteEmailText,
  buildRsvpUrl,
  buildSaveTheDateEmailHtml,
  buildSaveTheDateEmailText,
  buildSaveTheDateUrl,
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

  const siteUrl = request.nextUrl.origin;
  const type = request.nextUrl.searchParams.get("type") ?? "invite";
  const format = request.nextUrl.searchParams.get("format") ?? "html";
  const guestName = request.nextUrl.searchParams.get("name") ?? "Test Guest";
  const overrideUrl = getPreviewUrlOverride(request);
  const note = request.nextUrl.searchParams.get("note") ?? DEFAULT_INVITE_NOTE;

  let html: string;
  let text: string;

  if (type === "save-the-date") {
    const link = overrideUrl ?? buildSaveTheDateUrl(siteUrl, "preview-token");
    html = buildSaveTheDateEmailHtml({
      guestName,
      link,
      siteUrl,
    });
    text = buildSaveTheDateEmailText({ guestName, link });
  } else if (type === "invite") {
    const rsvpUrl = overrideUrl ?? buildRsvpUrl(siteUrl, "preview-token");
    html = buildInviteEmailHtml({
      guestName,
      note,
      rsvpUrl,
      siteUrl,
    });
    text = buildInviteEmailText({ guestName, note, rsvpUrl });
  } else {
    return NextResponse.json(
      { error: "Invalid preview type. Use invite or save-the-date." },
      { status: 400 },
    );
  }

  if (format === "text") {
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (format !== "html") {
    return NextResponse.json(
      { error: "Invalid preview format. Use html or text." },
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
