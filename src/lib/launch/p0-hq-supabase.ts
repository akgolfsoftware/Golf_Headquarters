/**
 * Vakt for den isolerte HQ-Supabase-stacken som brukes til innlogget P0-TEST.
 * Avviser hostet base og WANG-stacken på 54321/54322.
 * Leser aldri .env.local — kallet må få URL-en eksplisitt.
 */

export const P0_HQ_HOST = "127.0.0.1";
export const P0_HQ_API_PORT = "54421";
export const P0_HQ_DB_PORT = "54422";
export const P0_HQ_DB_NAME = "postgres";
export const P0_HQ_APP_PORT = "3010";

const WANG_PORTER = new Set(["54321", "54322", "54323", "54324"]);

function parseUrl(url: string | undefined, felt: string): URL {
  if (!url || url.trim() === "") {
    throw new Error(`${felt} is required; production defaults are forbidden`);
  }
  try {
    return new URL(url);
  } catch {
    throw new Error(`${felt} is not a valid URL`);
  }
}

function krevLoopbackUtenWang(target: URL, felt: string): void {
  if (target.hostname !== P0_HQ_HOST) {
    throw new Error(`${felt} must be loopback ${P0_HQ_HOST}`);
  }
  if (WANG_PORTER.has(target.port)) {
    throw new Error(`${felt} points at the WANG stack; use the HQ P0 ports`);
  }
}

export function krevHqP0DatabaseUrl(url: string | undefined): URL {
  const target = parseUrl(url, "P0_HQ_DATABASE_URL");
  krevLoopbackUtenWang(target, "P0_HQ_DATABASE_URL");
  const dbName = target.pathname.replace(/^\//, "").split("?")[0];
  if (target.port !== P0_HQ_DB_PORT || dbName !== P0_HQ_DB_NAME) {
    throw new Error(
      `Only the isolated HQ Supabase database ${P0_HQ_HOST}:${P0_HQ_DB_PORT}/${P0_HQ_DB_NAME} is allowed`,
    );
  }
  return target;
}

export function krevHqP0ApiUrl(url: string | undefined): URL {
  const target = parseUrl(url, "P0_HQ_API_URL");
  krevLoopbackUtenWang(target, "P0_HQ_API_URL");
  if (target.protocol !== "http:" || target.port !== P0_HQ_API_PORT) {
    throw new Error(
      `Only the isolated HQ Supabase API http://${P0_HQ_HOST}:${P0_HQ_API_PORT} is allowed`,
    );
  }
  return target;
}

export function krevHqP0AppUrl(url: string | undefined): URL {
  const target = parseUrl(url, "P0_HQ_APP_URL");
  krevLoopbackUtenWang(target, "P0_HQ_APP_URL");
  if (target.protocol !== "http:" || target.port !== P0_HQ_APP_PORT) {
    throw new Error(
      `Only the isolated HQ Next app http://${P0_HQ_HOST}:${P0_HQ_APP_PORT} is allowed`,
    );
  }
  return target;
}
