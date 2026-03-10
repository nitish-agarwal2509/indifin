import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  Cpu,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    title: "Upload CAS PDF",
    description:
      "Simply upload your Consolidated Account Statement from CAMS or KFintech. We support the standard CAS format.",
    icon: FileText,
  },
  {
    title: "AI-Powered Parsing",
    description:
      "Our AI extracts all your holdings, transactions, and fund details automatically. No manual data entry needed.",
    icon: Cpu,
  },
  {
    title: "Portfolio vs Nifty 50",
    description:
      "See how your portfolio performs against India's benchmark index. Compare XIRR, visualize growth over time.",
    icon: TrendingUp,
  },
  {
    title: "Smart Insights",
    description:
      "Get AI-generated insights — underperformer alerts, overlap analysis, rebalancing suggestions, and more.",
    icon: Lightbulb,
  },
];

const steps = [
  {
    step: "01",
    title: "Sign Up",
    description: "Create your free account with Google",
  },
  {
    step: "02",
    title: "Upload",
    description: "Upload your CAS PDF from CAMS/KFintech",
  },
  {
    step: "03",
    title: "Analyze",
    description: "AI parses your data and crunches the numbers",
  },
  {
    step: "04",
    title: "Insights",
    description: "View your dashboard with portfolio vs Nifty 50",
  },
];

const trustPoints = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your data is encrypted and never stored on our servers",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get results in under 60 seconds with AI processing",
  },
  {
    icon: BarChart3,
    title: "Accurate XIRR",
    description: "True time-weighted returns calculation for your portfolio",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              IndiFin
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative">
          {/* Announcement badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">
                Free forever for Indian investors
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Main headline */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.1] text-balance">
              How is your portfolio{" "}
              <span className="text-primary">really</span> performing?
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Upload your mutual fund CAS statement, and let AI show you how
              your portfolio stacks up against the Nifty 50 index.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Free Analysis"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/70" />
              <span>No data stored</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary/70" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary/70" />
              <span>True XIRR calculation</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-card/30 border border-border/40">
              <p className="text-2xl sm:text-3xl font-semibold text-foreground">
                100%
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Free Forever
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/30 border border-border/40">
              <p className="text-2xl sm:text-3xl font-semibold text-foreground">
                AI
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Powered by Gemini
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-card/30 border border-border/40">
              <p className="text-2xl sm:text-3xl font-semibold text-foreground">
                XIRR
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                True Returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-y border-border/40 bg-card/20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <point.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{point.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground text-balance">
              Everything you need to track your investments
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border/50 bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/60"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 border-t border-border/40 bg-card/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
              Four simple steps
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border/60 text-2xl font-semibold text-primary">
                  {s.step}
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border/40">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-balance">
              Ready to see the <span className="text-primary">truth</span>?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Stop guessing. Upload your CAS and get a clear picture of your
              portfolio performance in minutes.
            </p>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Now — Free"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-medium text-foreground">IndiFin</span>
              <span className="text-muted-foreground">
                — Built for Indian mutual fund investors.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your data stays private. We never store your PDF files.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
