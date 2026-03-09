"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export function UserNav({ user }: { user: User | null }) {
  const email = user?.email;
  const name =
    user?.user_metadata?.full_name || user?.user_metadata?.name || email;
  const avatar = user?.user_metadata?.avatar_url;

  if (!user) {
    return (
      <span className="text-sm text-muted-foreground">Demo mode</span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {avatar ? (
          <img
            src={avatar}
            alt={name ?? "User"}
            className="h-7 w-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {(name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm font-medium sm:inline-block">
          {name}
        </span>
      </div>
      <form action="/auth/signout" method="POST">
        <Button variant="ghost" size="sm" type="submit">
          Log out
        </Button>
      </form>
    </div>
  );
}
