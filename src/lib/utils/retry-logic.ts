/**
 * Retry Logic with Exponential Backoff
 * 
 * T018: Implements retry mechanism for handling API rate limits and transient failures
 */

import { isRetryableError, getRetryDelay } from '../api/errors/api-error';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelayMs?: number;
  
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  
  /** Function to determine if error is retryable (default: isRetryableError) */
  shouldRetry?: (error: Error) => boolean;
  
  /** Callback before each retry attempt */
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  shouldRetry: isRetryableError,
  onRetry: () => {},
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with exponential backoff retry logic
 * 
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to function result
 * @throws Last error if all retries exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if not retryable or out of attempts
      if (!opts.shouldRetry(error) || attempt > opts.maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const baseDelay = opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1);
      const delayMs = Math.min(
        getRetryDelay(error, attempt) || baseDelay,
        opts.maxDelayMs
      );
      
      // Notify before retry
      opts.onRetry(attempt, error, delayMs);
      
      // Wait before retry
      await sleep(delayMs);
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw lastError!;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private maxRequestsPerMinute: number,
    private tokenRefillIntervalMs: number = 60000 / maxRequestsPerMinute
  ) {
    this.tokens = maxRequestsPerMinute;
    this.lastRefill = Date.now();
  }
  
  /**
   * Wait until a token is available, then consume it
   */
  async acquire(): Promise<void> {
    await this.refillTokens();
    
    if (this.tokens < 1) {
      // Calculate wait time until next token
      const waitMs = this.tokenRefillIntervalMs;
      await sleep(waitMs);
      await this.refillTokens();
    }
    
    this.tokens -= 1;
  }
  
  /**
   * Refill tokens based on elapsed time
   */
  private async refillTokens(): Promise<void> {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsedMs / this.tokenRefillIntervalMs);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.maxRequestsPerMinute);
      this.lastRefill = now;
    }
  }
  
  /**
   * Get current token count (for monitoring)
   */
  getTokenCount(): number {
    return Math.floor(this.tokens);
  }
}

/**
 * Create a rate-limited version of an async function
 * 
 * @param fn - Async function to rate limit
 * @param rateLimiter - RateLimiter instance
 * @returns Rate-limited function
 */
export function rateLimited<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  rateLimiter: RateLimiter
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    await rateLimiter.acquire();
    return fn(...args);
  };
}
