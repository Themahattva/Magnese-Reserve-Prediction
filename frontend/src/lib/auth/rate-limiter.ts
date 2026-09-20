/**
 * Server-Side Authentication Rate Limiter
 * Restricts brute-force attacks by limiting failed attempts per IP / Employee ID.
 * Max 5 failed attempts per 15-minute window.
 */

interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  // Never rate-limit loopback IP in local development / demo mode
  const isLoopback =
    identifier === '127.0.0.1' ||
    identifier === '::1' ||
    identifier === 'localhost';

  if (isLoopback && process.env.NODE_ENV !== 'production') {
    return { allowed: true };
  }

  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    return { allowed: true };
  }

  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // If window expired, reset attempts
  if (now - record.lastAttempt > WINDOW_MS) {
    rateLimitStore.delete(identifier);
    return { allowed: true };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const retryAfterSeconds = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string) {
  // Do not record loopback IP in development
  const isLoopback =
    identifier === '127.0.0.1' ||
    identifier === '::1' ||
    identifier === 'localhost';

  if (isLoopback && process.env.NODE_ENV !== 'production') {
    return;
  }

  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { attempts: 0, lastAttempt: now };

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
  }

  rateLimitStore.set(identifier, record);
}

export function clearRateLimit(identifier: string) {
  rateLimitStore.delete(identifier);
}

export function resetAllRateLimits() {
  rateLimitStore.clear();
}
