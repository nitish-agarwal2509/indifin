import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates an authenticated Gmail API client for the given user.
 * Reads tokens from user_tokens table and handles auto-refresh.
 */
export async function getGmailClient(userId: string) {
  const supabase = await createClient();

  const { data: tokenRow, error } = await supabase
    .from("user_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error || !tokenRow) {
    throw new Error("NO_GMAIL_TOKEN");
  }

  if (!tokenRow.scopes?.includes("gmail.readonly")) {
    throw new Error("NO_GMAIL_SCOPE");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token || undefined,
    expiry_date: tokenRow.expires_at
      ? new Date(tokenRow.expires_at).getTime()
      : undefined,
  });

  // Persist refreshed tokens back to DB
  oauth2Client.on("tokens", async (tokens) => {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (tokens.access_token) updates.access_token = tokens.access_token;
    if (tokens.refresh_token) updates.refresh_token = tokens.refresh_token;
    if (tokens.expiry_date)
      updates.expires_at = new Date(tokens.expiry_date).toISOString();

    await supabase
      .from("user_tokens")
      .update(updates)
      .eq("user_id", userId)
      .eq("provider", "google");
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}
