import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGmailClient } from "@/lib/gmail/client";
import {
  buildCASSearchQuery,
  getSenderName,
  type CASEmailResult,
  type CASAttachment,
} from "@/lib/gmail/search";

export const maxDuration = 60;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gmail = await getGmailClient(user.id);

    // Search for CAS emails
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: buildCASSearchQuery(),
      maxResults: 20,
    });

    const messageIds = listResponse.data.messages || [];

    if (messageIds.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    // Fetch message details in parallel (batches of 10)
    const emails: CASEmailResult[] = [];
    const batch = messageIds.slice(0, 10);

    const messageDetails = await Promise.all(
      batch.map((msg) =>
        gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        })
      )
    );

    for (const detail of messageDetails) {
      const headers = detail.data.payload?.headers || [];
      const from =
        headers.find((h) => h.name === "From")?.value || "Unknown";
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "No subject";
      const date =
        headers.find((h) => h.name === "Date")?.value || "";

      // Find PDF attachments
      const attachments: CASAttachment[] = [];
      const parts = detail.data.payload?.parts || [];

      for (const part of parts) {
        if (
          part.filename &&
          part.filename.toLowerCase().endsWith(".pdf") &&
          part.body?.attachmentId
        ) {
          attachments.push({
            attachmentId: part.body.attachmentId,
            filename: part.filename,
            size: part.body.size || 0,
          });
        }
      }

      if (attachments.length > 0) {
        emails.push({
          messageId: detail.data.id!,
          subject,
          from,
          senderName: getSenderName(from),
          date,
          snippet: detail.data.snippet || "",
          attachments,
        });
      }
    }

    // Sort by date descending
    emails.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ emails });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (
      message === "NO_GMAIL_TOKEN" ||
      message === "NO_GMAIL_SCOPE"
    ) {
      return NextResponse.json(
        { error: "Gmail access not granted", code: message },
        { status: 401 }
      );
    }

    console.error("Gmail search error:", err);
    return NextResponse.json(
      { error: "Failed to search Gmail" },
      { status: 500 }
    );
  }
}
