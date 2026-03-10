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
      <div className="flex items-center gap-2.5">
        {avatar ? (
          <img
            src={avatar}
            alt={name ?? "User"}
            className="h-8 w-8 rounded-full ring-2 ring-violet-500/30"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium">
            {(name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm font-medium text-zinc-100 sm:inline-block">
          {name}
        </span>
      </div>
      <form action="/auth/signout" method="POST">
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="text-zinc-400 hover:text-zinc-100"
        >
          Log out
        </Button>
      </form>
    </div>
  );
}
