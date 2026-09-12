/**
 * Rent helsesvar for /api/health.
 * Inneholder aldri tilkoblingsstreng, nøkler eller miljøverdier.
 */

export type HelseSvar = {
  status: "ok" | "degraded";
  db: "up" | "down";
  timestamp: string;
  uptime: number;
};

export const HELSE_TILLATTE_FELT = [
  "status",
  "db",
  "timestamp",
  "uptime",
] as const;

export function byggHelseSvar(input: {
  dbOk: boolean;
  timestamp: string;
  uptime: number;
}): HelseSvar {
  return {
    status: input.dbOk ? "ok" : "degraded",
    db: input.dbOk ? "up" : "down",
    timestamp: input.timestamp,
    uptime: input.uptime,
  };
}

export function helseHttpStatus(dbOk: boolean): 200 | 503 {
  return dbOk ? 200 : 503;
}
