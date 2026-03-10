"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </Button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-[#09090b]/95 backdrop-blur-xl border-b border-zinc-800/50 z-50 p-4">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full justify-start ${pathname === link.href ? "text-violet-400 bg-violet-500/10" : "text-zinc-400 hover:text-zinc-100"}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
