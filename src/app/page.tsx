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
  Sparkles,
  Upload,
  PieChart,
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
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
              <BarChart3 className="h-4.5 w-4.5 text-violet-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-100">
              IndiFin
            </span>
            <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-400">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="shimmer-button text-zinc-950 font-medium px-5 border-0">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 font-medium"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="shimmer-button text-zinc-950 font-medium px-5 border-0">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section with Mesh Gradient */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient pointer-events-none" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-6 relative">
          {/* Announcement badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-4 py-2 text-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-zinc-300">
                Free forever for Indian investors
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
            </div>
          </div>

          {/* Main headline */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-balance">
              <span className="text-zinc-100">How is your portfolio</span>{" "}
              <span className="gradient-text">really</span>{" "}
              <span className="text-zinc-100">performing?</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-pretty">
              Upload your mutual fund CAS statement, and let AI show you how
              your portfolio stacks up against the Nifty 50 index.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="shimmer-button h-14 px-8 text-base font-semibold text-zinc-950 border-0 shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow duration-300"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Free Analysis"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-medium border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 backdrop-blur-sm"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-400/70" />
              <span>No data stored</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-400/70" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-400/70" />
              <span>True XIRR calculation</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto">
            {[
              { value: "100%", label: "Free Forever" },
              { value: "AI", label: "Powered by Gemini" },
              { value: "XIRR", label: "True Returns" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glow-card text-center p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800"
              >
                <p className="text-2xl sm:text-3xl font-semibold text-zinc-100">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-4 p-4 rounded-xl"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                  <point.icon className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{point.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 tracking-wider uppercase mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-zinc-100 text-balance">
              Everything you need to track{" "}
              <span className="gradient-text">your investments</span>
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glow-card group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:bg-zinc-900/80"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 group-hover:border-violet-500/40 transition-colors">
                  <feature.icon className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Bento Grid Section */}
      <section className="py-28 border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 tracking-wider uppercase mb-4">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-zinc-100">
              Four simple steps
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Step 1 - Large card spanning 4 columns */}
            <div className="glow-card md:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 text-6xl font-bold text-zinc-800">
                01
              </div>
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
                  <Sparkles className="h-7 w-7 text-violet-400" />
                </div>
                <h3 className="text-2xl font-semibold text-zinc-100 mb-3">
                  Sign Up with Google
                </h3>
                <p className="text-zinc-500 max-w-md">
                  Create your free account in seconds using your Google account.
                  No credit card required, no hidden fees.
                </p>
              </div>
            </div>

            {/* Step 2 - Small card spanning 2 columns */}
            <div className="glow-card md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-bold text-zinc-800">
                02
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30">
                  <Upload className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                  Upload CAS
                </h3>
                <p className="text-sm text-zinc-500">
                  Upload your CAS PDF from CAMS or KFintech
                </p>
              </div>
            </div>

            {/* Step 3 - Small card spanning 2 columns */}
            <div className="glow-card md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-bold text-zinc-800">
                03
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                  <Cpu className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                  AI Analyzes
                </h3>
                <p className="text-sm text-zinc-500">
                  AI parses your data and crunches the numbers
                </p>
              </div>
            </div>

            {/* Step 4 - Large card spanning 4 columns */}
            <div className="glow-card md:col-span-4 rounded-3xl border border-zinc-800 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 text-6xl font-bold text-violet-900/50">
                04
              </div>
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/40">
                  <PieChart className="h-7 w-7 text-violet-300" />
                </div>
                <h3 className="text-2xl font-semibold text-zinc-100 mb-3">
                  View Your Insights
                </h3>
                <p className="text-zinc-400 max-w-md">
                  See your complete dashboard with portfolio vs Nifty 50
                  comparison, XIRR calculations, and AI-powered recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 border-t border-zinc-800/50 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-zinc-100 mb-6 text-balance">
              Ready to see the{" "}
              <span className="gradient-text">truth</span>?
            </h2>
            <p className="text-zinc-400 mb-10 text-lg">
              Stop guessing. Upload your CAS and get a clear picture of your
              portfolio performance in minutes.
            </p>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="shimmer-button h-14 px-10 text-base font-semibold text-zinc-950 border-0 shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow duration-300"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Now — Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12 mt-auto bg-zinc-900/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                <BarChart3 className="h-4 w-4 text-violet-400" />
              </div>
              <span className="font-semibold text-zinc-100">IndiFin</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500 text-sm">
                Built for Indian mutual fund investors
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Shield className="h-4 w-4 text-violet-400/50" />
              <span>Your data stays private. We never store your PDF files.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
