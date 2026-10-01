import test from 'node:test';
import assert from 'node:assert/strict';
import { assertLocalUsersTargets, assertLocalUsersPorts, assertLocalUsersDatabase, LOCAL_USERS_PROJECT } from '../../scripts/local-users-target.mjs';
import { redactLocalUsersOutput } from '../../scripts/local-users-output.mjs';

const local = {
  LOCAL_USERS_PROJECT,
  DATABASE_URL: 'postgresql://synthetic:synthetic@127.0.0.1:55622/postgres',
  DIRECT_URL: 'postgresql://synthetic:synthetic@127.0.0.1:55622/postgres',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:55621',
  NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3061',
};
test('dedicated local target accepted', () => assert.doesNotThrow(() => assertLocalUsersTargets(local)));
for (const [name, change] of Object.entries({
  hostedDatabase: { DATABASE_URL: 'postgresql://test:test@db.example.invalid:55622/postgres' },
  otherLocalStack: { DATABASE_URL: 'postgresql://test:test@127.0.0.1:55422/postgres' },
  wrongDatabase: { DIRECT_URL: 'postgresql://test:test@127.0.0.1:55622/other' },
  queryHostOverride: { DATABASE_URL: 'postgresql://test:test@127.0.0.1:55622/postgres?host=db.example.invalid' },
  hostedAuth: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' },
  authCredentials: { NEXT_PUBLIC_SUPABASE_URL: 'http://test:test@127.0.0.1:55621' },
  authPath: { NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:55621/other' },
  wrongApp: { NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000' },
  wrongIdentity: { LOCAL_USERS_PROJECT: 'another-project' },
  missingDirect: { DIRECT_URL: undefined },
})) {
  test(`${name} rejected before network or write`, () => assert.throws(() => assertLocalUsersTargets({ ...local, ...change })));
}

test('one dedicated loopback binding accepted', () => assert.doesNotThrow(() =>
  assertLocalUsersPorts({ '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '55622' }] }, 55622)));
for (const host of ['0.0.0.0', '::', '192.168.1.5']) {
  test(`non-loopback binding ${host} rejected`, () => assert.throws(() =>
    assertLocalUsersPorts({ '5432/tcp': [{ HostIp: host, HostPort: '55622' }] }, 55622)));
}
test('extra published port rejected', () => assert.throws(() =>
  assertLocalUsersPorts({ '5432/tcp': [{ HostIp: '127.0.0.1', HostPort: '55622' }, { HostIp: '127.0.0.1', HostPort: '55623' }] }, 55622)));
test('wrong database identity rejected before fixture writes', async () => {
  await assert.rejects(assertLocalUsersDatabase({ query: async () => ({ rows: [{ name: 'postgres', identity: 'other-local-project' }] }) }));
});
test('login query values are removed from development output', () => {
  assert.equal(redactLocalUsersOutput('GET /callback?code=synthetic-sensitive&next=/portal'),
    'GET /callback?code=[redacted]&next=/portal');
  assert.equal(redactLocalUsersOutput('token_hash=synthetic-sensitive access_token=synthetic-sensitive'),
    'token_hash=[redacted] access_token=[redacted]');
});
test('known local credentials are removed from failed action output', () => {
  assert.equal(redactLocalUsersOutput('fill("synthetic-test-secret")', ['synthetic-test-secret']), 'fill("[redacted]")');
});
test('non-sensitive status remains available for diagnosis', () => {
  assert.equal(redactLocalUsersOutput('24 passed, 0 failed'), '24 passed, 0 failed');
});
