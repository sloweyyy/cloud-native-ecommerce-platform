import { useState, useRef, useEffect } from 'react';

const REFRESH_COOLDOWN_MS = 2000;

export function useRefreshThrottle(refetch: () => void) {
  const [refreshCooldownRemaining, setRefreshCooldownRemaining] =
    useState<number>(0);
  const lastRefreshTimeRef = useRef<number>(0);

  useEffect(() => {
    if (refreshCooldownRemaining <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
      const remaining = Math.max(0, REFRESH_COOLDOWN_MS - timeSinceLastRefresh);

      setRefreshCooldownRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [refreshCooldownRemaining]);

  function handleRefresh() {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
      return false;
    }

    lastRefreshTimeRef.current = now;
    setRefreshCooldownRemaining(REFRESH_COOLDOWN_MS);
    refetch();
    return true;
  }

  return {
    refreshCooldownRemaining,
    handleRefresh,
  };
}
