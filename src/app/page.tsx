import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    title: "Upload CAS PDF",
    description:
      "Simply upload your Consolidated Account Statement from CAMS or KFintech. We support the standard CAS format.",
    icon: "📄",
  },
  {
    title: "AI-Powered Parsing",
    description:
      "Our AI extracts all your holdings, transactions, and fund details automatically. No manual data entry needed.",
    icon: "🤖",
  },
  {
    title: "Portfolio vs Nifty 50",
    description:
      "See how your portfolio performs against India's benchmark index. Compare XIRR, visualize growth over time.",
    icon: "📊",
  },
  {
    title: "Smart Insights",
    description:
      "Get AI-generated insights — underperformer alerts, overlap analysis, rebalancing suggestions, and more.",
    icon: "💡",
  },
];

const steps = [
  { step: "1", title: "Sign Up", description: "Create your free account with Google" },
  { step: "2", title: "Upload", description: "Upload your CAS PDF from CAMS/KFintech" },
  { step: "3", title: "Analyze", description: "AI parses your data and crunches the numbers" },
  { step: "4", title: "Insights", description: "View your dashboard with portfolio vs Nifty 50" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">IndiFin</span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="container mx-auto px-4 py-20 text-center">
          <Badge variant="outline" className="mb-4">
            Free &middot; AI-Powered &middot; Built for Indian Investors
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            How is your portfolio
            <br />
            <span className="text-primary/70">really</span> performing?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Upload your mutual fund CAS statement, and let AI show you how your
            portfolio stacks up against the Nifty 50 index. Get actionable
            insights to make smarter investment decisions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-base">
                Get Started — It&apos;s Free
              </Button>
            </Link>
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div className="container mx-auto px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need to track your investments
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="text-3xl">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* How it works */}
        <div className="container mx-auto px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
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
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>IndiFin — Built for Indian mutual fund investors.</p>
          <p className="mt-1">
            Your data stays private. We never store your PDF files.
          </p>
        </div>
      </footer>
    </div>
  );
}
