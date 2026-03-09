import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";
import { createClient } from "@/lib/supabase/server";

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">IndiFin</span>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" size="sm">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <UserNav user={user} />
            <MobileNav links={navLinks} />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
