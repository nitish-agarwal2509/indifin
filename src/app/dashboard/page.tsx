import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Upload your CAS statement to get started.
        </p>
      </div>

      {/* Empty state */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>No portfolio data yet</CardTitle>
          <CardDescription>
            Upload your Consolidated Account Statement (CAS) PDF to see your
            portfolio analysis and Nifty 50 comparison.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/dashboard/upload">
            <Button>Upload CAS PDF</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
