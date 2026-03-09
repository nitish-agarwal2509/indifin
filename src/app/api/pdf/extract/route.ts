import { NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

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
    const result = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true,
    });

    const text = typeof result.text === "string"
      ? result.text
      : Array.isArray(result.text)
        ? result.text.join("\n\n")
        : String(result.text || "");

    return NextResponse.json({
      text,
      pages: result.totalPages,
    });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
