"use client";

import { useState, useCallback, useRef } from "react";
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
import { FileText, Lock, CheckCircle2 } from "lucide-react";

type UploadState =
  | "idle"
  | "uploading"
  | "needsPassword"
  | "extracted"
  | "saving"
  | "saved"
  | "error";

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [extractedText, setExtractedText] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<File | null>(null);
  const router = useRouter();

  const extractPdf = useCallback(async (file: File, pwd?: string) => {
    setState("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (pwd) formData.append("password", pwd);

      const res = await fetch("/api/pdf/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Failed to extract text from PDF";
        let needsPassword = false;
        try {
          const data = await res.json();
          message = data.error || message;
          needsPassword = data.needsPassword === true;
        } catch {
          if (res.status === 413)
            message = "PDF file is too large for processing";
          else if (res.status === 504)
            message = "PDF processing timed out. Try a smaller file.";
          else message = `Server error (${res.status}). Please try again.`;
        }
        if (needsPassword) {
          setError(message);
          setState("needsPassword");
          return;
        }
        throw new Error(message);
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

  const handleFile = useCallback(
    async (file: File) => {
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
      fileRef.current = file;
      await extractPdf(file);
    },
    [extractPdf]
  );

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileRef.current || !password.trim()) return;
    extractPdf(fileRef.current, password.trim());
  }

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
        let message = "Failed to save portfolio";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          message = `Server error (${res.status}). Please try again.`;
        }
        throw new Error(message);
      }

      const data = await res.json();
      setState("saved");
      setTimeout(
        () => router.push(`/dashboard/review?id=${data.portfolio.id}`),
        1000
      );
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
    setPassword("");
    fileRef.current = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          Upload CAS Statement
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload your PDF and we&apos;ll extract your portfolio data using AI.
        </p>
      </div>

      {/* Upload area */}
      {state === "idle" || state === "error" ? (
        <Card
          className={`border-dashed cursor-pointer transition-all bg-card/40 ${
            dragOver ? "border-primary bg-primary/5" : "border-border/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdf-input")?.click()}
        >
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              Drag & drop your CAS PDF here
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              or click to browse. Supported: CAMS and KFintech CAS (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 pb-8">
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Uploading state */}
      {state === "uploading" && (
        <Card className="bg-card/60">
          <CardContent className="py-16 text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium text-foreground">
              Extracting text from {fileName}...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few seconds.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Password prompt */}
      {state === "needsPassword" && (
        <Card className="bg-card/60">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-xl">Password Protected PDF</CardTitle>
            <CardDescription>
              {error || "This CAS PDF requires a password to open."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePasswordSubmit}
              className="flex flex-col items-center gap-4 max-w-sm mx-auto"
            >
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g., your PAN number)"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                For DigiLocker CAS, the password is usually your PAN number
                (e.g., ABCDE1234F)
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={!password.trim()}
                >
                  Unlock & Extract
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Extracted text display */}
      {(state === "extracted" || state === "saving") && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Extracted Text
              </h2>
              <p className="text-sm text-muted-foreground">
                {fileName} — {pageCount} pages,{" "}
                {extractedText.length.toLocaleString()} characters
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={state === "saving"}
              >
                Upload another
              </Button>
              <Button
                onClick={handleSave}
                disabled={state === "saving"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {state === "saving" ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </div>
          <Card className="bg-card/60">
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap text-xs font-mono max-h-[500px] overflow-y-auto leading-relaxed text-muted-foreground">
                {extractedText}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saved state */}
      {state === "saved" && (
        <Card className="bg-card/60">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-3/10">
              <CheckCircle2 className="h-8 w-8 text-chart-3" />
            </div>
            <p className="text-lg font-medium text-foreground">
              PDF saved successfully!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecting to AI parsing...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
