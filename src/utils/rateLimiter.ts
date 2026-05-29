interface RateLimitConfig {
  limitMs?: number; // Time window in milliseconds
  onLimit?: () => void; // Callback when limit is exceeded
}

const actionTimestamps: Record<string, number> = {};

/**
 * Client-Side Rate Limiter / Throttle
 * Returns true if the action is allowed, and false if it is blocked (too fast).
 */
export const rateLimitAction = (actionKey: string, config?: RateLimitConfig): boolean => {
  const now = Date.now();
  const limitMs = config?.limitMs || 1500; // Default to 1.5s cooldown
  const lastTime = actionTimestamps[actionKey] || 0;

  if (now - lastTime < limitMs) {
    if (config?.onLimit) {
      config.onLimit();
    }
    return false;
  }

  actionTimestamps[actionKey] = now;
  return true;
};
