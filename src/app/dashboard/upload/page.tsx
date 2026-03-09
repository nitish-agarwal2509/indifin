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

type UploadState = "idle" | "uploading" | "needsPassword" | "extracted" | "saving" | "saved" | "error";

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
          if (res.status === 413) message = "PDF file is too large for processing";
          else if (res.status === 504) message = "PDF processing timed out. Try a smaller file.";
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
    fileRef.current = file;
    await extractPdf(file);
  }, [extractPdf]);

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
    setPassword("");
    fileRef.current = null;
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
            <div className="text-4xl mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-emerald-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
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

      {/* Password prompt */}
      {state === "needsPassword" && (
        <Card>
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-amber-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <CardTitle>Password Protected PDF</CardTitle>
            <CardDescription>
              {error || "This CAS PDF requires a password to open."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center gap-4 max-w-sm mx-auto">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g., your PAN number)"
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-muted-foreground"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                For DigiLocker CAS, the password is usually your PAN number (e.g., ABCDE1234F)
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold" disabled={!password.trim()}>
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
              <Button onClick={handleSave} disabled={state === "saving"} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
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
