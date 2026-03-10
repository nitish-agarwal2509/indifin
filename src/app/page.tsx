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

const trustedBy = [
  "SBI Mutual Fund",
  "HDFC AMC",
  "ICICI Prudential",
  "Axis AMC",
  "Kotak AMC",
  "Nippon India",
  "UTI AMC",
  "Aditya Birla",
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
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
              <BarChart3 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-100">
              IndiFin
            </span>
            <span className="hidden sm:inline rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-400">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="shimmer-button text-zinc-950 font-medium px-4 sm:px-5 text-sm border-0">
                  Dashboard
                  <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4" strokeWidth={1.5} />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 font-medium"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="shimmer-button text-zinc-950 font-medium px-4 sm:px-5 text-sm border-0">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section with Mesh Gradient */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-32 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient pointer-events-none" />

        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative">
          {/* Announcement badge */}
          <div className="flex justify-center mb-8 sm:mb-12 scroll-reveal">
            <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" strokeWidth={1.5} />
              <span className="text-zinc-300">
                Free forever for Indian investors
              </span>
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-500" strokeWidth={1.5} />
            </div>
          </div>

          {/* Main headline */}
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.15] text-balance">
              <span className="text-zinc-100">How is your portfolio</span>{" "}
              <span className="gradient-text">really</span>{" "}
              <span className="text-zinc-100">performing?</span>
            </h1>
            <p className="mt-5 sm:mt-8 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-[1.7] sm:leading-[1.8] text-pretty">
              Upload your mutual fund CAS statement, and let AI show you how
              your portfolio stacks up against the Nifty 50 index.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-14 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 scroll-reveal">
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="shimmer-button w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold text-zinc-950 border-0 shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow duration-300"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Free Analysis"}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600 backdrop-blur-sm"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 sm:mt-20 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-x-10 sm:gap-y-4 text-xs sm:text-sm text-zinc-500 scroll-reveal">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" strokeWidth={1.5} />
              <span>No data stored</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" strokeWidth={1.5} />
              <span>Instant results</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" strokeWidth={1.5} />
              <span>True XIRR calculation</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-12 sm:mt-24 grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto scroll-reveal">
            {[
              { value: "100%", label: "Free Forever" },
              { value: "AI", label: "Powered by Gemini" },
              { value: "XIRR", label: "True Returns" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glow-card text-center p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-zinc-800"
              >
                <p className="text-xl sm:text-3xl font-semibold text-zinc-100">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5 sm:mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar — Supported Fund Houses */}
      <section className="py-8 sm:py-16 border-y border-zinc-800/50 bg-zinc-900/20 overflow-hidden scroll-reveal">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-zinc-600 mb-6 sm:mb-10">
            Works with all major Indian fund houses
          </p>
          <div className="relative">
            <div className="flex animate-marquee gap-8 sm:gap-16 whitespace-nowrap">
              {[...trustedBy, ...trustedBy].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-xs sm:text-sm font-medium text-zinc-600 select-none"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-24 bg-zinc-900/30 scroll-reveal">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-10 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                  <point.icon className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">{point.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1 sm:mt-1.5 leading-[1.7]">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-48 scroll-reveal">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-20">
            <p className="text-xs sm:text-sm font-medium text-violet-400 tracking-wider uppercase mb-3 sm:mb-4">
              Features
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-zinc-100 text-balance">
              Everything you need to track{" "}
              <span className="gradient-text">your investments</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glow-card group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-7 transition-all duration-300 hover:bg-zinc-900/80"
              >
                <div className="mb-4 sm:mb-6 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 group-hover:border-violet-500/40 transition-colors">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-[1.7]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Bento Grid Section */}
      <section className="py-16 sm:py-48 border-t border-zinc-800/50 bg-zinc-900/20 scroll-reveal">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-20">
            <p className="text-xs sm:text-sm font-medium text-violet-400 tracking-wider uppercase mb-3 sm:mb-4">
              How it works
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-zinc-100">
              Four simple steps
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
            {/* Step 1 - Large card spanning 4 columns */}
            <div className="glow-card md:col-span-4 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-4xl sm:text-6xl font-bold text-zinc-800">
                01
              </div>
              <div className="relative z-10">
                <div className="mb-4 sm:mb-7 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30">
                  <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-2xl font-semibold text-zinc-100 mb-2 sm:mb-4">
                  Sign Up with Google
                </h3>
                <p className="text-xs sm:text-base text-zinc-500 max-w-md leading-[1.7]">
                  Create your free account in seconds using your Google account.
                  No credit card required, no hidden fees.
                </p>
              </div>
            </div>

            {/* Step 2 - Small card spanning 2 columns */}
            <div className="glow-card md:col-span-2 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-5xl font-bold text-zinc-800">
                02
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-4 sm:mb-6 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-zinc-100 mb-1.5 sm:mb-3">
                  Upload CAS
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-[1.7]">
                  Upload your CAS PDF from CAMS or KFintech
                </p>
              </div>
            </div>

            {/* Step 3 - Small card spanning 2 columns */}
            <div className="glow-card md:col-span-2 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-3xl sm:text-5xl font-bold text-zinc-800">
                03
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-4 sm:mb-6 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                  <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-zinc-100 mb-1.5 sm:mb-3">
                  AI Analyzes
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-[1.7]">
                  AI parses your data and crunches the numbers
                </p>
              </div>
            </div>

            {/* Step 4 - Large card spanning 4 columns */}
            <div className="glow-card md:col-span-4 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-gradient-to-br from-violet-900/20 to-indigo-900/20 p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-4xl sm:text-6xl font-bold text-violet-900/50">
                04
              </div>
              <div className="relative z-10">
                <div className="mb-4 sm:mb-7 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/40">
                  <PieChart className="h-5 w-5 sm:h-7 sm:w-7 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-2xl font-semibold text-zinc-100 mb-2 sm:mb-4">
                  View Your Insights
                </h3>
                <p className="text-xs sm:text-base text-zinc-400 max-w-md leading-[1.7]">
                  See your complete dashboard with portfolio vs Nifty 50
                  comparison, XIRR calculations, and AI-powered recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-48 border-t border-zinc-800/50 relative overflow-hidden scroll-reveal">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-zinc-100 mb-4 sm:mb-8 text-balance">
              Ready to see the{" "}
              <span className="gradient-text">truth</span>?
            </h2>
            <p className="text-zinc-400 mb-8 sm:mb-12 text-sm sm:text-lg leading-[1.7] sm:leading-[1.8]">
              Stop guessing. Upload your CAS and get a clear picture of your
              portfolio performance in minutes.
            </p>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button
                size="lg"
                className="shimmer-button w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-semibold text-zinc-950 border-0 shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow duration-300"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Now — Free"}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 sm:py-14 mt-auto bg-zinc-900/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-zinc-100 text-sm sm:text-base">IndiFin</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500 text-xs sm:text-sm">
                Built for Indian investors
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" strokeWidth={1.5} />
              <span>Your data stays private. We never store your PDF files.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
