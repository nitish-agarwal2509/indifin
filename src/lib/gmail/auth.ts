"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Triggers a Google OAuth re-auth with gmail.readonly scope.
 * Only called when user explicitly clicks "Connect Gmail".
 */
export async function requestGmailAccess(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/upload&gmail=true`,
      scopes: "https://www.googleapis.com/auth/gmail.readonly",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  return { error };
}
