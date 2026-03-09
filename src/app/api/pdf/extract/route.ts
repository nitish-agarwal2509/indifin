import { NextResponse } from "next/server";
import { extractText } from "unpdf";

async function tryExtract(
  buffer: Uint8Array,
  password?: string
): Promise<{ text: string; pages: number }> {
  const options: Record<string, unknown> = { mergePages: true };
  if (password) options.password = password;

  const result = await extractText(buffer, options);

  const text = Array.isArray(result.text)
    ? result.text.join("\n\n")
    : String(result.text || "");

  return { text, pages: result.totalPages ?? 0 };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    try {
      const result = await tryExtract(buffer, password || undefined);
      if (result.text.trim().length > 0) {
        return NextResponse.json(result);
      }
      // Empty text — might be image-based
      return NextResponse.json(
        { error: "Could not extract text. The PDF may be scanned/image-based, which is not supported." },
        { status: 400 }
      );
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
              error: "This PDF is password-protected. Please enter the password.",
              needsPassword: true,
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          {
            error: "Incorrect password. For DigiLocker CAS, try your PAN number (e.g., ABCDE1234F).",
            needsPassword: true,
          },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from PDF. Please try again." },
      { status: 500 }
    );
  }
}
