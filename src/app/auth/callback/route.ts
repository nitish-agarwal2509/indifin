import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const isGmailAuth = searchParams.get("gmail") === "true";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const { provider_token, provider_refresh_token } = data.session;

      // Store Google tokens if available (for Gmail API access)
      if (provider_token) {
        const scopes = isGmailAuth
          ? "email profile https://www.googleapis.com/auth/gmail.readonly"
          : "email profile";

        await supabase.from("user_tokens").upsert(
          {
            user_id: data.session.user.id,
            provider: "google",
            access_token: provider_token,
            refresh_token: provider_refresh_token || null,
            scopes,
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,provider" }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
