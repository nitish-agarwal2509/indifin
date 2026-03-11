"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { requestGmailAccess } from "@/lib/gmail/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Search, Download, Lock, AlertCircle } from "lucide-react";
import type { CASEmailResult } from "@/lib/gmail/search";

interface GmailImportProps {
  onExtracted: (text: string, pages: number, filename: string) => void;
}

type GmailState =
  | "checking"
  | "no-access"
  | "ready"
  | "searching"
  | "results"
  | "downloading"
  | "needs-password"
  | "error";

export function GmailImport({ onExtracted }: GmailImportProps) {
  const [state, setState] = useState<GmailState>("checking");
  const [emails, setEmails] = useState<CASEmailResult[]>([]);
  const [error, setError] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<{
    messageId: string;
    attachmentId: string;
    filename: string;
  } | null>(null);
  const [password, setPassword] = useState("");

  // Check Gmail access on mount
  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/gmail/status");
        const data = await res.json();
        setState(data.hasGmailAccess ? "ready" : "no-access");
      } catch {
        setState("no-access");
      }
    }
    checkAccess();
  }, []);

  async function handleConnectGmail() {
    const supabase = createClient();
    const { error } = await requestGmailAccess(supabase);
    if (error) {
      setError(error.message);
      setState("error");
    }
    // User will be redirected to Google consent, then back to upload page
  }

  async function handleSearch() {
    setState("searching");
    setError("");
    try {
      const res = await fetch("/api/gmail/search");
      if (!res.ok) {
        const data = await res.json();
        if (data.code === "NO_GMAIL_TOKEN" || data.code === "NO_GMAIL_SCOPE") {
          setState("no-access");
          return;
        }
        throw new Error(data.error || "Failed to search Gmail");
      }
      const data = await res.json();
      setEmails(data.emails);
      setState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setState("error");
    }
  }

  const handleImport = useCallback(
    async (
      messageId: string,
      attachmentId: string,
      filename: string,
      pwd?: string
    ) => {
      setState("downloading");
      setError("");
      setSelectedEmail({ messageId, attachmentId, filename });

      try {
        const res = await fetch("/api/gmail/attachment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, attachmentId, password: pwd }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.needsPassword) {
            setError(data.error);
            setState("needs-password");
            return;
          }
          throw new Error(data.error || "Failed to download attachment");
        }

        const data = await res.json();
        onExtracted(data.text, data.pages, filename);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
        setState("error");
      }
    },
    [onExtracted]
  );

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmail || !password.trim()) return;
    handleImport(
      selectedEmail.messageId,
      selectedEmail.attachmentId,
      selectedEmail.filename,
      password.trim()
    );
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  // Checking access
  if (state === "checking") {
    return (
      <Card className="glow-card bg-zinc-900/50 border-zinc-800">
        <CardContent className="py-12 text-center">
          <Spinner className="h-6 w-6 mx-auto mb-3 text-violet-400" />
          <p className="text-sm text-muted-foreground">
            Checking Gmail access...
          </p>
        </CardContent>
      </Card>
    );
  }

  // No Gmail access — show connect button
  if (state === "no-access") {
    return (
      <Card className="glow-card bg-zinc-900/50 border-zinc-800">
        <CardHeader className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
            <Mail className="h-8 w-8 text-violet-400" />
          </div>
          <CardTitle className="text-lg">Import from Gmail</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            Connect your Gmail to automatically find CAS statements from CAMS,
            KFintech, and CDSL
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 pb-8">
          <Button
            onClick={handleConnectGmail}
            className="shimmer-button text-zinc-950 font-medium border-0"
          >
            <Mail className="h-4 w-4 mr-2" />
            Connect Gmail
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            We only read emails from known CAS senders. Your email content is
            never stored.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ready to search
  if (state === "ready") {
    return (
      <Card className="glow-card bg-zinc-900/50 border-zinc-800">
        <CardHeader className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
            <Mail className="h-8 w-8 text-violet-400" />
          </div>
          <CardTitle className="text-lg">Import from Gmail</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            Search your inbox for CAS statements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button
            onClick={handleSearch}
            className="shimmer-button text-zinc-950 font-medium border-0"
          >
            <Search className="h-4 w-4 mr-2" />
            Search for CAS Emails
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Searching
  if (state === "searching") {
    return (
      <Card className="glow-card bg-zinc-900/50 border-zinc-800">
        <CardContent className="py-12 text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4 text-violet-400" />
          <p className="text-lg font-medium text-foreground">
            Searching Gmail...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Looking for CAS emails from CAMS, KFintech, CDSL...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Downloading attachment
  if (state === "downloading") {
    return (
      <Card className="glow-card bg-zinc-900/50 border-zinc-800">
        <CardContent className="py-12 text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4 text-violet-400" />
          <p className="text-lg font-medium text-foreground">
            Importing {selectedEmail?.filename}...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Downloading and extracting text from PDF...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Password prompt
  if (state === "needs-password") {
    return (
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
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setState("results")}
              >
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
    );
  }

  // Search results
  if (state === "results") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {emails.length === 0
              ? "No CAS emails found"
              : `Found ${emails.length} CAS email${emails.length > 1 ? "s" : ""}`}
          </p>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {emails.length === 0 ? (
          <Card className="glow-card bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No CAS emails found from CAMS, KFintech, or CDSL.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure you&apos;ve received a CAS statement in this Gmail
                account.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <Card
                key={email.messageId}
                className="glow-card bg-zinc-900/50 border-zinc-800 hover:border-violet-500/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400 border border-violet-500/20">
                          {email.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {email.subject}
                      </p>
                      {email.attachments.map((att) => (
                        <p
                          key={att.attachmentId}
                          className="text-xs text-muted-foreground mt-1"
                        >
                          📎 {att.filename}{" "}
                          {att.size > 0 &&
                            `(${(att.size / 1024).toFixed(0)} KB)`}
                        </p>
                      ))}
                    </div>
                    <div className="flex-shrink-0">
                      {email.attachments.map((att) => (
                        <Button
                          key={att.attachmentId}
                          size="sm"
                          onClick={() =>
                            handleImport(
                              email.messageId,
                              att.attachmentId,
                              att.filename
                            )
                          }
                          className="shimmer-button text-zinc-950 font-medium border-0"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Import
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <Card className="glow-card bg-zinc-900/50 border-zinc-800">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => setState("ready")}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
