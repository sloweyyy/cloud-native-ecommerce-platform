import { useCallback, useEffect, useState } from 'react';
import { TOKEN_BROADCAST_EVENT } from '../constants';
import type { TokenBroadcastEventDetail, TokenBroadcastState } from '../types';

/**
 * Hook to subscribe to token broadcasts from host application
 *
 * @param enabled - Whether to enable subscription
 * @returns Current token broadcast state
 */
export function useTokenBroadcastSubscription(
  enabled = true
): TokenBroadcastState {
  const [state, setState] = useState<TokenBroadcastState>({
    token: null,
    tokenExpiry: null,
    lastUpdated: 0,
  });

  const handleTokenBroadcast = useCallback((event: Event) => {
    const { token, tokenExpiry, timestamp } = (
      event as CustomEvent<TokenBroadcastEventDetail>
    ).detail;

    setState({
      token,
      tokenExpiry,
      lastUpdated: timestamp,
    });
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    window.addEventListener(TOKEN_BROADCAST_EVENT, handleTokenBroadcast);
    return () =>
      window.removeEventListener(TOKEN_BROADCAST_EVENT, handleTokenBroadcast);
  }, [enabled, handleTokenBroadcast]);

  return state;
}

/**
 * Broadcast token to all listening micro-frontends
 *
 * @param token - Access token to broadcast
 * @param tokenExpiry - Token expiry timestamp
 */
export function broadcastToken(
  token: string | null,
  tokenExpiry: number | null
): void {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent<TokenBroadcastEventDetail>(
    TOKEN_BROADCAST_EVENT,
    {
      detail: {
        token,
        tokenExpiry,
        timestamp: Date.now(),
      },
    }
  );

  window.dispatchEvent(event);
}

