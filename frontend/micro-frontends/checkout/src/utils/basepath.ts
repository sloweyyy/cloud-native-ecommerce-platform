function isMicroFrontendApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.parent !== window) {
    return true;
  }

  if (
    (window as unknown as { __MICRO_FRONTEND__?: boolean }).__MICRO_FRONTEND__
  ) {
    return true;
  }

  return false;
}

export function getBasepath(appContextBasePath?: string): string {
  if (appContextBasePath) {
    return appContextBasePath;
  }

  if (isMicroFrontendApp()) {
    return '/store';
  }

  return '';
}
