/** Separate, loopback-only test identity. Never loads the application's env. */
export const LOCAL_USERS_PROJECT = 'ak-hq-brukere-20261001';

export function assertLocalUsersPorts(ports, expectedPort) {
  const published = Object.values(ports).flatMap(bindings => bindings ?? []);
  if (published.length !== 1 || published[0].HostIp !== '127.0.0.1' ||
      published[0].HostPort !== String(expectedPort)) {
    throw new Error('Local test container must publish only its dedicated loopback port');
  }
}

export function assertLocalUsersTargets(env) {
  const parse = (key) => {
    try {
      if (!env[key]) throw new Error();
      return new URL(env[key]);
    } catch {
      throw new Error(`Missing or invalid local test setting: ${key}`);
    }
  };
  const db = parse('DATABASE_URL');
  const direct = parse('DIRECT_URL');
  const api = parse('NEXT_PUBLIC_SUPABASE_URL');
  const app = parse('NEXT_PUBLIC_APP_URL');
  const databaseIsLocal = (url) =>
    ['postgres:', 'postgresql:'].includes(url.protocol) &&
    url.hostname === '127.0.0.1' && url.port === '55622' &&
    url.pathname === '/postgres' && !url.hash && !url.search;
  if (env.LOCAL_USERS_PROJECT !== LOCAL_USERS_PROJECT ||
      !databaseIsLocal(db) || !databaseIsLocal(direct) ||
      api.href !== 'http://127.0.0.1:55621/' ||
      app.href !== 'http://127.0.0.1:3061/') {
    throw new Error('Only the dedicated loopback user-test environment is allowed');
  }
  return { database: db, api, app };
}

export async function assertLocalUsersDatabase(client) {
  const result = await client.query(`
    SELECT current_database() AS name,
      shobj_description(oid, 'pg_database') AS identity
    FROM pg_database WHERE datname = current_database()
  `);
  if (result.rows[0]?.name !== 'postgres' ||
      result.rows[0]?.identity !== LOCAL_USERS_PROJECT) {
    throw new Error('Dedicated local test database identity is missing');
  }
}
