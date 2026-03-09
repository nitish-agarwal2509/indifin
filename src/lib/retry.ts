/**
 * Retry a function with exponential backoff.
 * Retries on 429 (rate limit) and 503 (service unavailable) errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable =
        message.includes("429") ||
        message.includes("Too Many Requests") ||
        message.includes("503") ||
        message.includes("overloaded");

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
