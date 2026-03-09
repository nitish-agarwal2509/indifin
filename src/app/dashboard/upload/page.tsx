"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UploadState = "idle" | "uploading" | "extracted" | "saving" | "saved" | "error";

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [extractedText, setExtractedText] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setState("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/pdf/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract text from PDF");
      }

      const data = await res.json();
      setExtractedText(data.text);
      setPageCount(data.pages || 0);
      setState("extracted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleSave() {
    setState("saving");
    try {
      const res = await fetch("/api/portfolio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          rawText: extractedText,
          pageCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save portfolio");
      }

      const data = await res.json();
      setState("saved");
      setTimeout(() => router.push(`/dashboard/review?id=${data.portfolio.id}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setExtractedText("");
    setFileName("");
    setError("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload CAS Statement</h1>
        <p className="text-muted-foreground mt-1">
          Upload your PDF and we&apos;ll extract your portfolio data using AI.
        </p>
      </div>

      {/* Upload area */}
      {state === "idle" || state === "error" ? (
        <Card
          className={`border-dashed cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdf-input")?.click()}
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <CardTitle>Drag & drop your CAS PDF here</CardTitle>
            <CardDescription>
              or click to browse. Supported: CAMS and KFintech CAS (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      ) : null}

      {/* Uploading state */}
      {state === "uploading" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Extracting text from {fileName}...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Extracted text display */}
      {(state === "extracted" || state === "saving") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Extracted Text</h2>
              <p className="text-sm text-muted-foreground">
                {fileName} — {pageCount} pages, {extractedText.length.toLocaleString()} characters
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={state === "saving"}>
                Upload another
              </Button>
              <Button onClick={handleSave} disabled={state === "saving"}>
                {state === "saving" ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap text-xs font-mono max-h-[500px] overflow-y-auto leading-relaxed">
                {extractedText}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved state */}
      {state === "saved" && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium text-emerald-400">PDF saved successfully!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecting to AI parsing...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
