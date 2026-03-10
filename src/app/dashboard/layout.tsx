import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";
import { createClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/upload", label: "Upload" },
  { href: "/dashboard/compare", label: "Compare" },
  { href: "/dashboard/insights", label: "Insights" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                <BarChart3 className="h-4.5 w-4.5 text-violet-400" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-zinc-100">
                IndiFin
              </span>
              <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-400">
                Beta
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 font-medium"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <UserNav user={user} />
            <MobileNav links={navLinks} />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
