// DeAddict Phase 5 disabled server operation scaffolding.
// No provider, database, storage, email, or network adapter is configured here.

export const DEPLOYMENT_ERROR = Object.freeze({
  code: 'DEPLOYMENT_NOT_CONFIGURED',
  message: 'This account operation is unavailable because the deployment has not been approved or configured.'
});

function disabledResult(operation) {
  return Object.freeze({
    ok: false,
    operation,
    error: DEPLOYMENT_ERROR
  });
}

export function createDisabledAccountOperations() {
  return Object.freeze({
    completeAuthCallback() {
      return disabledResult('complete-auth-callback');
    },
    requestExport() {
      return disabledResult('request-export');
    },
    requestDeletion() {
      return disabledResult('request-deletion');
    },
    revokeAllSessions() {
      return disabledResult('revoke-all-sessions');
    }
  });
}

export function createConfiguredAccountOperations() {
  throw new Error('DEPLOYMENT_NOT_CONFIGURED');
}
