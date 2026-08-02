// src/lib/health/parse-apple-health.ts
// Ren parser for Health Auto Export sitt REST-format. Ingen nettverkskall, ingen
// env-lesing, ingen Supabase-import — inn payload, ut normaliserte rader. Det gjør
// den testbar isolert og gjenbrukbar i en senere flerbrukerflyt.

import {
  SLEEP_METRIC_NAME,
  enhetErGodtatt,
  finnMetricSpec,
} from "@/lib/health/apple-health-metrics";

export type HealthRow = {
  /** 'YYYY-MM-DD' — lest direkte fra kildestrengen, aldri via Date */
  metric_date: string;
  metric: string;
  value_num: number;
  unit: string;
  source: string;
  raw_json: unknown;
};

export type ParseResult = {
  rows: HealthRow[];
  skipped: number;
  /** Unike, sorterte kildenavn vi ikke kjenner igjen */
  unknownMetrics: string[];
  /** Unike, sorterte kildenavn der payloadens enhet avvek fra forventet */
  unitMismatch: string[];
};

type MetricBlokk = {
  name: string;
  units?: unknown;
  data: unknown[];
};

function erObjekt(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Leser dato-delen rett ut av strengen «YYYY-MM-DD HH:mm:ss ±HHmm».
 *
 * Ingen Date-konvertering: strengen er allerede stemplet i lokal tid av Health Auto
 * Export. `new Date(s).toISOString().slice(0,10)` ville gitt FEIL dag for alt målt
 * mellom 00:00 og 02:00 norsk tid — altså systematisk feil på nettopp søvndataene.
 */
function lesDato(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  return m ? m[1] : null;
}

/** Henter metric-blokkene ut av payloaden. Kaster TypeError på ugyldig toppnivå. */
function lesMetricBlokker(payload: unknown): MetricBlokk[] {
  if (!erObjekt(payload)) {
    throw new TypeError("Apple Health-payload må være et objekt");
  }
  const data = payload.data;
  if (!erObjekt(data)) {
    throw new TypeError("Apple Health-payload mangler 'data'-objektet");
  }
  const metrics = data.metrics;
  if (!Array.isArray(metrics)) {
    throw new TypeError("Apple Health-payload mangler 'data.metrics'-listen");
  }
  const blokker: MetricBlokk[] = [];
  for (const m of metrics) {
    if (!erObjekt(m)) continue;
    if (typeof m.name !== "string" || m.name === "") continue;
    blokker.push({
      name: m.name,
      units: m.units,
      data: Array.isArray(m.data) ? m.data : [],
    });
  }
  return blokker;
}

/**
 * Normaliserer en Health Auto Export-payload til rader klare for me_health.
 *
 * Ukjente metric-navn og enhetsavvik feiler aldri kallet — Apple legger til nye
 * metrikker over tid, og en ny metrikk skal ikke stoppe innsamlingen av de gamle.
 */
export function parseAppleHealth(
  payload: unknown,
  source = "apple",
): ParseResult {
  const blokker = lesMetricBlokker(payload);

  // Nøkkel: `${metric_date}|${metric}`. Siste rad vinner. Postgres' on conflict
  // feiler hvis samme nøkkel opptrer to ganger i én batch, og med «Sync Previous
  // 2 Days» slått på i appen skjer det hver eneste dag.
  const rader = new Map<string, HealthRow>();
  let skipped = 0;
  const ukjente = new Set<string>();
  const enhetsavvik = new Set<string>();

  for (const blokk of blokker) {
    const spec = finnMetricSpec(blokk.name);
    if (!spec) {
      ukjente.add(blokk.name);
      continue;
    }
    if (!enhetErGodtatt(spec, blokk.units)) {
      enhetsavvik.add(blokk.name);
      continue;
    }

    const verdiNokkel = blokk.name === SLEEP_METRIC_NAME ? "asleep" : "qty";

    for (const punkt of blokk.data) {
      if (!erObjekt(punkt)) {
        skipped += 1;
        continue;
      }
      const metric_date = lesDato(punkt.date);
      const verdi = punkt[verdiNokkel];
      if (metric_date === null || typeof verdi !== "number" || !Number.isFinite(verdi)) {
        skipped += 1;
        continue;
      }
      rader.set(`${metric_date}|${spec.metric}`, {
        metric_date,
        metric: spec.metric,
        value_num: verdi,
        unit: spec.unit,
        source,
        // Hele rad-objektet lagres. Søvnfasene (deep/core/rem/awake) blir ikke egne
        // metrikker nå, men kan hentes ut herfra senere uten ny ingest.
        raw_json: punkt,
      });
    }
  }

  return {
    rows: [...rader.values()],
    skipped,
    unknownMetrics: [...ukjente].sort(),
    unitMismatch: [...enhetsavvik].sort(),
  };
}
