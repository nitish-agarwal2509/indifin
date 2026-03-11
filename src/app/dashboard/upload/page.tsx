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
import { GmailImport } from "@/components/gmail-import";

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

  // Called when Gmail import extracts text from an attachment
  function handleGmailExtracted(text: string, pages: number, name: string) {
    setExtractedText(text);
    setPageCount(pages);
    setFileName(name);
    setState("extracted");
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
          Upload your CAS PDF or import directly from Gmail.
        </p>
      </div>

      {/* Upload options — two side-by-side cards */}
      {state === "idle" || state === "error" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual PDF upload */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Option 1: Upload PDF
            </h2>
            <Card
              className={`glow-card border-dashed cursor-pointer transition-all bg-zinc-900/50 border-zinc-800 ${
                dragOver ? "border-violet-500 bg-violet-500/5" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("pdf-input")?.click()}
            >
              <CardHeader className="text-center py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
                  <FileText className="h-8 w-8 text-violet-400" />
                </div>
                <CardTitle className="text-lg">
                  Drag & drop your CAS PDF
                </CardTitle>
                <CardDescription className="max-w-xs mx-auto">
                  or click to browse. Supported: CAMS, KFintech, MF Central,
                  CDSL CAS (max 10MB)
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
          </div>

          {/* Gmail import */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Option 2: Import from Gmail
            </h2>
            <GmailImport onExtracted={handleGmailExtracted} />
          </div>
        </div>
      ) : null}

      {/* Uploading state */}
      {state === "uploading" && (
        <Card className="glow-card bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-violet-400" />
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
        <Card className="glow-card bg-zinc-900/50 border-zinc-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <Lock className="h-8 w-8 text-amber-400" />
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
                  className="shimmer-button text-zinc-950 font-medium border-0"
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
                className="shimmer-button text-zinc-950 font-medium border-0"
              >
                {state === "saving" ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </div>
          <Card className="glow-card bg-zinc-900/50 border-zinc-800">
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
        <Card className="glow-card bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20">
              <CheckCircle2 className="h-8 w-8 text-cyan-400" />
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
