/**
 * Fetch Nifty 50 historical closing prices from Yahoo Finance.
 * Returns array of { date: "YYYY-MM-DD", close: number } sorted by date.
 */

type NiftyDataPoint = { date: string; close: number };

export async function fetchNiftyHistory(
  fromDate: Date,
  toDate: Date
): Promise<NiftyDataPoint[]> {
  // Add buffer days to ensure we cover the full range
  const from = Math.floor(
    new Date(fromDate.getTime() - 7 * 86400000).getTime() / 1000
  );
  const to = Math.floor(
    new Date(toDate.getTime() + 2 * 86400000).getTime() / 1000
  );

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?period1=${from}&period2=${to}&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance API error: ${res.status}`);
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("No Nifty 50 data returned");

  const timestamps: number[] = result.timestamp || [];
  const closes: (number | null)[] =
    result.indicators?.quote?.[0]?.close || [];

  const points: NiftyDataPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] == null) continue;
    const d = new Date(timestamps[i] * 1000);
    points.push({
      date: d.toISOString().split("T")[0],
      close: closes[i]!,
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Find the Nifty close price on or just before a given date.
 */
export function getNiftyPrice(
  niftyData: NiftyDataPoint[],
  dateStr: string
): number | null {
  // Binary search for closest date <= target
  let lo = 0;
  let hi = niftyData.length - 1;
  let best: number | null = null;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (niftyData[mid].date <= dateStr) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best != null ? niftyData[best].close : null;
}

/**
 * Simulate investing the same cashflows in Nifty 50.
 * Returns the hypothetical Nifty portfolio value and units accumulated.
 */
export function simulateNiftyPortfolio(
  transactions: { date: string; amount: number }[],
  niftyData: NiftyDataPoint[]
): { totalUnits: number; currentValue: number; niftyXirrFlows: { date: string; amount: number }[] } {
  let totalUnits = 0;
  const niftyXirrFlows: { date: string; amount: number }[] = [];

  for (const tx of transactions) {
    const niftyPrice = getNiftyPrice(niftyData, tx.date);
    if (niftyPrice == null || niftyPrice === 0) continue;

    // Same amount invested/redeemed in Nifty
    const units = tx.amount / niftyPrice;
    totalUnits += units;
    niftyXirrFlows.push({ date: tx.date, amount: tx.amount });
  }

  // Current Nifty value
  const latestNifty = niftyData[niftyData.length - 1]?.close || 0;
  const currentValue = totalUnits * latestNifty;

  return { totalUnits, currentValue, niftyXirrFlows };
}

/**
 * Build time series of portfolio value and Nifty equivalent at monthly intervals.
 */
export function buildComparisonTimeSeries(
  transactions: { date: string; amount: number }[],
  niftyData: NiftyDataPoint[],
  portfolioCurrentValue: number,
  periodFrom: string,
  periodTo: string
): { date: string; portfolio: number; nifty: number }[] {
  if (niftyData.length === 0 || transactions.length === 0) return [];

  const sorted = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Generate monthly dates from periodFrom to periodTo
  const start = new Date(periodFrom);
  const end = new Date(periodTo);
  const months: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(current.toISOString().split("T")[0]);
    current.setMonth(current.getMonth() + 1);
  }
  // Always include the end date
  const endStr = end.toISOString().split("T")[0];
  if (!months.includes(endStr)) months.push(endStr);

  const series: { date: string; portfolio: number; nifty: number }[] = [];

  for (const monthDate of months) {
    // Portfolio: cumulative invested up to this date
    let portfolioInvested = 0;
    let niftyUnits = 0;

    for (const tx of sorted) {
      if (tx.date > monthDate) break;
      portfolioInvested += tx.amount;

      const niftyPrice = getNiftyPrice(niftyData, tx.date);
      if (niftyPrice && niftyPrice > 0) {
        niftyUnits += tx.amount / niftyPrice;
      }
    }

    const niftyPrice = getNiftyPrice(niftyData, monthDate);
    const niftyValue = niftyPrice ? niftyUnits * niftyPrice : 0;

    // For portfolio value at intermediate dates, use proportional growth
    // from invested amount to current value (simplified)
    const totalInvested = sorted.reduce((s, tx) => s + tx.amount, 0);
    const growthRatio =
      totalInvested > 0 ? portfolioCurrentValue / totalInvested : 1;
    const portfolioValue =
      monthDate >= endStr
        ? portfolioCurrentValue
        : Math.round(portfolioInvested * (1 + (growthRatio - 1) * (portfolioInvested / totalInvested)));

    series.push({
      date: monthDate,
      portfolio: Math.round(portfolioValue),
      nifty: Math.round(niftyValue),
    });
  }

  return series;
}
