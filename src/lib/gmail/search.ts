/** Known CAS email senders */
const CAS_SENDERS = [
  "donotreply@camsonline.com",
  "noreply@camsonline.com",
  "donotreply@kfintech.com",
  "noreply@kfintech.com",
  "cas@mfcentral.com",
  "noreply@mfcentral.com",
  "donotreply@cdslindia.com",
  "donotreply@cdsl.co.in",
  "noreply@cdslindia.com",
];

/** Friendly names for CAS senders */
const SENDER_NAMES: Record<string, string> = {
  "camsonline.com": "CAMS",
  "kfintech.com": "KFintech",
  "mfcentral.com": "MF Central",
  "cdslindia.com": "CDSL",
  "cdsl.co.in": "CDSL",
};

/** Build Gmail search query for CAS emails */
export function buildCASSearchQuery(): string {
  const fromPart = CAS_SENDERS.map((s) => `from:${s}`).join(" OR ");
  return `(${fromPart}) has:attachment filename:pdf`;
}

/** Extract friendly sender name from email address */
export function getSenderName(email: string): string {
  for (const [domain, name] of Object.entries(SENDER_NAMES)) {
    if (email.includes(domain)) return name;
  }
  return email;
}

export interface CASAttachment {
  attachmentId: string;
  filename: string;
  size: number;
}

export interface CASEmailResult {
  messageId: string;
  subject: string;
  from: string;
  senderName: string;
  date: string;
  snippet: string;
  attachments: CASAttachment[];
}
