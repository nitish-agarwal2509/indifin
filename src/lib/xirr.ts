/**
 * XIRR calculation using Newton-Raphson method.
 *
 * Cash flow convention:
 *   - Investments (money out) → negative amounts
 *   - Redemptions/current value (money in) → positive amounts
 */

type CashFlow = { date: Date; amount: number };

const DAYS_PER_YEAR = 365;
const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-7;

function daysBetween(d1: Date, d2: Date): number {
  return (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
}

/** NPV at rate r for the given cash flows (relative to first date) */
function npv(cashFlows: CashFlow[], rate: number): number {
  const d0 = cashFlows[0].date;
  let total = 0;
  for (const cf of cashFlows) {
    const years = daysBetween(d0, cf.date) / DAYS_PER_YEAR;
    total += cf.amount / Math.pow(1 + rate, years);
  }
  return total;
}

/** Derivative of NPV w.r.t. rate */
function npvDerivative(cashFlows: CashFlow[], rate: number): number {
  const d0 = cashFlows[0].date;
  let total = 0;
  for (const cf of cashFlows) {
    const years = daysBetween(d0, cf.date) / DAYS_PER_YEAR;
    total += (-years * cf.amount) / Math.pow(1 + rate, years + 1);
  }
  return total;
}

/**
 * Calculate XIRR for a set of cash flows.
 * Returns the annualized return as a decimal (e.g., 0.1842 for 18.42%).
 * Returns null if calculation doesn't converge.
 */
export function calculateXIRR(cashFlows: CashFlow[]): number | null {
  if (cashFlows.length < 2) return null;

  // Need at least one positive and one negative cash flow
  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  const hasNegative = cashFlows.some((cf) => cf.amount < 0);
  if (!hasPositive || !hasNegative) return null;

  // Sort by date
  const sorted = [...cashFlows].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Newton-Raphson starting guess
  let rate = 0.1;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = npv(sorted, rate);
    const fPrime = npvDerivative(sorted, rate);

    if (Math.abs(fPrime) < 1e-12) break;

    const newRate = rate - f / fPrime;

    if (Math.abs(newRate - rate) < TOLERANCE) {
      // Sanity check: rate should be between -0.99 and 10 (1000%)
      if (newRate <= -1 || newRate > 10) return null;
      return newRate;
    }

    rate = newRate;

    // Guard against divergence
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }

  return null;
}

/**
 * Build cash flows for XIRR from transaction data.
 * Transactions have positive amounts for purchases (money out from investor),
 * so we negate them. The current value is added as a positive cash flow.
 */
export function buildCashFlows(
  transactions: { date: string; amount: number }[],
  currentValue: number,
  valuationDate: Date = new Date()
): CashFlow[] {
  const flows: CashFlow[] = transactions.map((tx) => ({
    date: new Date(tx.date),
    // Negate: purchase (positive in DB) → negative cash flow (money out)
    // Redemption (negative in DB) → positive cash flow (money in)
    amount: -tx.amount,
  }));

  // Add current portfolio value as final positive cash flow
  flows.push({ date: valuationDate, amount: currentValue });

  return flows;
}
