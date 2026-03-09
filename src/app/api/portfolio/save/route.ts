import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, rawText, pageCount } = body;

    if (!rawText || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("portfolios")
      .insert({
        user_id: user.id,
        file_name: fileName,
        raw_text: rawText,
        page_count: pageCount || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Portfolio save error:", error);
      return NextResponse.json(
        { error: "Failed to save portfolio" },
        { status: 500 }
      );
    }

    return NextResponse.json({ portfolio: data });
  } catch (err) {
    console.error("Portfolio save error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
