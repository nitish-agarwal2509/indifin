import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGmailClient } from "@/lib/gmail/client";
import { extractText } from "unpdf";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, attachmentId, password } = await request.json();

    if (!messageId || !attachmentId) {
      return NextResponse.json(
        { error: "messageId and attachmentId are required" },
        { status: 400 }
      );
    }

    const gmail = await getGmailClient(user.id);

    // Download the attachment
    const attachment = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId,
    });

    if (!attachment.data.data) {
      return NextResponse.json(
        { error: "Attachment data is empty" },
        { status: 400 }
      );
    }

    // Gmail returns base64url-encoded data
    const base64Data = attachment.data.data
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const buffer = new Uint8Array(
      Buffer.from(base64Data, "base64")
    );

    // Check size (10MB limit)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Attachment is too large (max 10MB)" },
        { status: 400 }
      );
    }

    // Extract text using unpdf (same as /api/pdf/extract)
    try {
      const options: Record<string, unknown> = { mergePages: true };
      if (password) options.password = password;

      const result = await extractText(buffer, options);
      const text = Array.isArray(result.text)
        ? result.text.join("\n\n")
        : String(result.text || "");

      if (text.trim().length === 0) {
        return NextResponse.json(
          {
            error:
              "Could not extract text. The PDF may be scanned/image-based.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        text,
        pages: result.totalPages ?? 0,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("password") ||
        msg.includes("encrypted") ||
        msg.includes("PasswordException")
      ) {
        if (!password) {
          return NextResponse.json(
            {
              error:
                "This PDF is password-protected. Please enter the password.",
              needsPassword: true,
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error:
              "Incorrect password. For CAS PDFs, try your PAN number (e.g., ABCDE1234F).",
            needsPassword: true,
          },
          { status: 400 }
        );
      }
      throw err;
    }
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

    console.error("Gmail attachment error:", err);
    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 }
    );
  }
}
