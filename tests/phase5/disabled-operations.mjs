import assert from 'node:assert/strict';
import {
  createConfiguredAccountOperations,
  createDisabledAccountOperations,
  DEPLOYMENT_ERROR
} from '../../server/disabled-account-operations.mjs';

const operations = createDisabledAccountOperations();

for (const [name, invoke] of Object.entries({
  completeAuthCallback: () => operations.completeAuthCallback({ code: 'ignored' }),
  requestExport: () => operations.requestExport({ confirmation: 'EXPORT' }),
  requestDeletion: () => operations.requestDeletion({ confirmation: 'DELETE' }),
  revokeAllSessions: () => operations.revokeAllSessions({ confirmation: 'REVOKE' })
})) {
  const result = invoke();
  assert.equal(result.ok, false, `${name} must remain disabled`);
  assert.equal(result.error.code, 'DEPLOYMENT_NOT_CONFIGURED');
  assert.deepEqual(result.error, DEPLOYMENT_ERROR);
}

assert.throws(
  () => createConfiguredAccountOperations(),
  error => error instanceof Error && error.message === 'DEPLOYMENT_NOT_CONFIGURED'
);

console.log('Phase 5 disabled operation tests passed.');
