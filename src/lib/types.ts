export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive for purchase, negative for redemption
  units: number;
  nav: number;
}

export interface ParsedScheme {
  scheme_name: string;
  folio_number: string;
  amc: string; // e.g. "HDFC Mutual Fund"
  category: "equity" | "debt" | "hybrid" | "other";
  registrar: string; // "CAMS" or "KFintech"
  closing_units: number;
  closing_nav: number;
  closing_value: number;
  cost_value: number;
  gain_loss: number;
  xirr: number | null;
  transactions: ParsedTransaction[];
}

export interface ParsedCAS {
  investor_name: string;
  pan: string;
  email: string;
  statement_from: string; // YYYY-MM-DD
  statement_to: string; // YYYY-MM-DD
  schemes: ParsedScheme[];
  total_invested: number;
  total_current_value: number;
  total_gain_loss: number;
  portfolio_xirr: number | null;
}
