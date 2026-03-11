import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: tokenRow } = await supabase
      .from("user_tokens")
      .select("scopes")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .single();

    const hasGmailAccess =
      !!tokenRow?.scopes?.includes("gmail.readonly");

    return NextResponse.json({ hasGmailAccess });
  } catch {
    return NextResponse.json(
      { error: "Failed to check Gmail status" },
      { status: 500 }
    );
  }
}
