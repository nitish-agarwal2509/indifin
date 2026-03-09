import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Upload CAS Statement</h1>
        <p className="text-muted-foreground mt-1">
          Upload your PDF and we&apos;ll extract your portfolio data using AI.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>Drag & drop your CAS PDF here</CardTitle>
          <CardDescription>
            Supported: CAMS and KFintech Consolidated Account Statements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Upload functionality coming in Chunk 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
