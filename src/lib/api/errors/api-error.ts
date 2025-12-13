/**
 * API Error Classes
 * 
 * T014: Custom error types for API operations with detailed context
 */

/**
 * Base API error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public source?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends APIError {
  constructor(
    message: string,
    public retryAfterMs: number,
    source?: string,
    details?: any
  ) {
    super(message, 429, source, details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Authentication/authorization error
 */
export class AuthenticationError extends APIError {
  constructor(
    message: string,
    source?: string,
    details?: any
  ) {
    super(message, 401, source, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends APIError {
  constructor(
    message: string,
    source?: string,
    details?: any
  ) {
    super(message, 404, source, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Validation error (schema mismatch)
 */
export class ValidationError extends APIError {
  constructor(
    message: string,
    source?: string,
    details?: any
  ) {
    super(message, 422, source, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends APIError {
  constructor(
    message: string,
    public timeoutMs: number,
    source?: string
  ) {
    super(message, 408, source);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Network error (connection issues)
 */
export class NetworkError extends APIError {
  constructor(
    message: string,
    source?: string,
    details?: any
  ) {
    super(message, undefined, source, details);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Retry on rate limits (with backoff)
  if (error instanceof RateLimitError) return true;
  
  // Retry on network errors
  if (error instanceof NetworkError) return true;
  
  // Retry on timeouts
  if (error instanceof TimeoutError) return true;
  
  // Retry on server errors (5xx)
  if (error instanceof APIError && error.statusCode && error.statusCode >= 500) {
    return true;
  }
  
  // Don't retry client errors (4xx except 429)
  return false;
}

/**
 * Extract retry delay from error
 */
export function getRetryDelay(error: Error, attemptNumber: number): number {
  // If rate limit error with explicit retry-after, use that
  if (error instanceof RateLimitError && error.retryAfterMs) {
    return error.retryAfterMs;
  }
  
  // Otherwise use exponential backoff: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, attemptNumber - 1), 10000);
}
