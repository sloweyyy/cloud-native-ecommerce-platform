export type Callback = (...args: any[]) => void;

export const EVENT_NAMES = {
  NOTHING: 'nothing',
  API_ERROR: 'apiError',
  API_ERROR_WITH_STATUS: 'apiErrorWithStatus',
  API_SUCCESS: 'apiSuccess',
  TIME_INTERVAL_CHANGED: 'timeIntervalChanged',
  CART_UPDATED: 'cartUpdated',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export class TinyEmitter {
  private events: { [event: string]: Callback[] } = {};

  subscribe(event: EventName, callback: Callback, forceOne = false): void {
    const trimmedEvent = event.trim();

    if (!this.events[trimmedEvent]) {
      this.events[trimmedEvent] = [];
    }

    if (forceOne) {
      if (this.events[trimmedEvent].includes(callback)) {
        return;
      }
    }

    this.events[trimmedEvent]?.push(callback);
  }

  unsubscribe(event: EventName, callback: Callback): void {
    const trimmedEvent = event.trim();

    if (!this.events[trimmedEvent]) return;

    this.events[trimmedEvent] = this.events[trimmedEvent].filter(
      (cb) => cb !== callback
    );

    if (this.events[trimmedEvent].length === 0) {
      delete this.events[trimmedEvent];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: EventName, ...args: any[]): void {
    const trimmedEvent = event.trim();

    if (!this.events[trimmedEvent]) return;

    this.events[trimmedEvent].forEach((callback) => callback(...args));
  }
}

export const emitter = new TinyEmitter();
