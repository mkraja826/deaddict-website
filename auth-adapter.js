// DeAddict Phase 4 provider-neutral authentication adapter.
// This disabled implementation is intentionally incapable of network access.
(() => {
  class AuthNotConfiguredError extends Error {
    constructor() {
      super('Authentication is not configured for this preview.');
      this.name = 'AuthNotConfiguredError';
      this.code = 'AUTH_NOT_CONFIGURED';
    }
  }

  function unavailable() {
    return Promise.reject(new AuthNotConfiguredError());
  }

  const adapter = Object.freeze({
    isConfigured: false,
    requestMagicLink: unavailable,
    completeCallback: unavailable,
    getSession: unavailable,
    signOutCurrentSession: unavailable,
    revokeAllSessions: unavailable,
    requestExport: unavailable,
    requestDeletion: unavailable
  });

  Object.defineProperty(window, 'DeAddictAuthAdapter', {
    value: adapter,
    configurable: false,
    enumerable: false,
    writable: false
  });
})();