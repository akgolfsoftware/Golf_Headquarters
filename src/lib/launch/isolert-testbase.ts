/**
 * Vakt for lokal lanserings-testdatabase.
 * Avviser alt som ikke er 127.0.0.1:54379/ak_hq_launch_tests.
 * Leser aldri .env.local — kallet må få URL-en eksplisitt.
 */

export const LAUNCH_TEST_HOST = "127.0.0.1";
export const LAUNCH_TEST_PORT = "54379";
export const LAUNCH_TEST_DB_NAME = "ak_hq_launch_tests";
export const LAUNCH_RESTORE_CLONE_PREFIX = "ak_hq_launch_restore_";

export function krevIsolertLaunchUrl(url: string | undefined): URL {
  if (!url || url.trim() === "") {
    throw new Error(
      "LAUNCH_TEST_DATABASE_URL is required; production defaults are forbidden",
    );
  }
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    throw new Error("LAUNCH_TEST_DATABASE_URL is not a valid URL");
  }
  const dbName = target.pathname.replace(/^\//, "");
  if (
    target.hostname !== LAUNCH_TEST_HOST ||
    target.port !== LAUNCH_TEST_PORT ||
    dbName !== LAUNCH_TEST_DB_NAME
  ) {
    throw new Error("Only the isolated loopback launch database is allowed");
  }
  return target;
}

export function kanDroppeRestoreKlon(
  klonNavn: string,
  kildeNavn: string,
): boolean {
  if (!klonNavn || !kildeNavn) return false;
  if (klonNavn === kildeNavn) return false;
  if (kildeNavn !== LAUNCH_TEST_DB_NAME) return false;
  return (
    klonNavn.startsWith(LAUNCH_RESTORE_CLONE_PREFIX) &&
    klonNavn.length > LAUNCH_RESTORE_CLONE_PREFIX.length
  );
}

export function kanRulleTilbakeProduksjon(
  harUttrykkeligAutorisasjon: boolean,
): boolean {
  return harUttrykkeligAutorisasjon === true;
}
