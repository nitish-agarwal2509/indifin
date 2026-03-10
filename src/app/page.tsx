import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    title: "Upload CAS PDF",
    description:
      "Simply upload your Consolidated Account Statement from CAMS or KFintech. We support the standard CAS format.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
    ),
  },
  {
    title: "AI-Powered Parsing",
    description:
      "Our AI extracts all your holdings, transactions, and fund details automatically. No manual data entry needed.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    ),
  },
  {
    title: "Portfolio vs Nifty 50",
    description:
      "See how your portfolio performs against India's benchmark index. Compare XIRR, visualize growth over time.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
  },
  {
    title: "Smart Insights",
    description:
      "Get AI-generated insights — underperformer alerts, overlap analysis, rebalancing suggestions, and more.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
  },
];

const steps = [
  { step: "01", title: "Sign Up", description: "Create your free account with Google" },
  { step: "02", title: "Upload", description: "Upload your CAS PDF from CAMS/KFintech" },
  { step: "03", title: "Analyze", description: "AI parses your data and crunches the numbers" },
  { step: "04", title: "Insights", description: "View your dashboard with portfolio vs Nifty 50" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              IndiFin
            </span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
              BETA
            </Badge>
          </div>
          <nav className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex-1 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-10 w-[250px] h-[250px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 pt-32 pb-24 text-center relative">
          <Badge variant="outline" className="mb-6 border-emerald-500/30 text-emerald-400 backdrop-blur-sm">
            Free &middot; AI-Powered &middot; Built for Indian Investors
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1]">
            How is your portfolio
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              really
            </span>{" "}
            performing?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Upload your mutual fund CAS statement, and let AI show you how your
            portfolio stacks up against the Nifty 50 index. Get actionable
            insights to make smarter investment decisions.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="text-base px-8 h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started — It\u2019s Free"}
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Free Forever</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">AI</p>
              <p className="text-sm text-muted-foreground mt-1">Powered by Gemini</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">XIRR</p>
              <p className="text-sm text-muted-foreground mt-1">True Returns</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-24">
          <p className="text-sm font-semibold text-emerald-400 text-center tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-center text-3xl sm:text-4xl font-bold mb-16">
            Everything you need to track
            <br className="hidden sm:block" /> your investments
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-emerald-500/30 hover:bg-card transition-all duration-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-border/50">
          <div className="container mx-auto px-4 py-24">
            <p className="text-sm font-semibold text-emerald-400 text-center tracking-widest uppercase mb-3">Process</p>
            <h2 className="text-center text-3xl sm:text-4xl font-bold mb-16">
              Four simple steps
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.step} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
                  )}
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-border/50">
          <div className="container mx-auto px-4 py-24 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to see the <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">truth</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Stop guessing. Upload your CAS and get a clear picture of your portfolio performance in minutes.
            </p>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="text-base px-8 h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Now — Free"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">IndiFin</span>
            <span>— Built for Indian mutual fund investors.</span>
          </div>
          <p>Your data stays private. We never store your PDF files.</p>
        </div>
      </footer>
    </div>
  );
}
