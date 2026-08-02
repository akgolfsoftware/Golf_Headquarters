// src/lib/health/apple-health-metrics.ts
// Kartlegging fra Health Auto Export sine metric-navn til våre kanoniske navn og
// enheter. Ren data — ingen I/O, ingen env-lesing. Importeres av parseren.
//
// Enheten LAGRES fra denne tabellen, aldri fra payloadens `units`-felt. Payloadens
// units brukes kun til å avvise rader der iPhone står på feil enhetssystem: da skal
// raden hoppes over og telles som enhetsavvik, ikke konverteres. Bedre å oppdage en
// feil innstilling enn å lagre 176 kg.

/** Rad-nøkkelen sleep_analysis leser verdien fra. Alle andre metrikker bruker `qty`. */
export const SLEEP_METRIC_NAME = "sleep_analysis";

export type MetricSpec = {
  /** Kanonisk metric-navn slik det lagres i me_health.metric */
  metric: string;
  /** Enheten som lagres i me_health.unit */
  unit: string;
  /**
   * Enheter vi godtar i payloadens `units`-felt. Health Auto Export bruker delvis
   * andre skrivemåter enn våre lagrede enheter (f.eks. «hr» for timer, «count/min»
   * for puls), så listen er eksplisitt. Sammenlikning er case-insensitiv.
   */
  acceptedUnits: readonly string[];
};

export const METRIC_MAP = Object.freeze({
  heart_rate_variability: {
    metric: "hrv_sdnn",
    unit: "ms",
    acceptedUnits: ["ms"],
  },
  resting_heart_rate: {
    metric: "resting_hr",
    unit: "bpm",
    acceptedUnits: ["bpm", "count/min"],
  },
  sleep_analysis: {
    metric: "sleep_hours",
    unit: "h",
    acceptedUnits: ["h", "hr", "hours"],
  },
  respiratory_rate: {
    metric: "respiratory_rate",
    unit: "bpm",
    acceptedUnits: ["bpm", "count/min"],
  },
  vo2_max: {
    metric: "vo2max",
    unit: "ml/kg/min",
    acceptedUnits: ["ml/kg/min", "ml/(kg*min)", "ml/(kg·min)", "ml/min·kg"],
  },
  step_count: {
    metric: "steps",
    unit: "count",
    acceptedUnits: ["count", "steps"],
  },
  active_energy: {
    metric: "active_kcal",
    unit: "kcal",
    acceptedUnits: ["kcal"],
  },
  apple_exercise_time: {
    metric: "exercise_minutes",
    unit: "min",
    acceptedUnits: ["min", "minutes"],
  },
  body_mass: {
    metric: "weight_kg",
    unit: "kg",
    acceptedUnits: ["kg"],
  },
  walking_heart_rate_average: {
    metric: "walking_hr_avg",
    unit: "bpm",
    acceptedUnits: ["bpm", "count/min"],
  },
} as const satisfies Record<string, MetricSpec>);

export type KildeMetricNavn = keyof typeof METRIC_MAP;

/** Slår opp et kildenavn fra Health Auto Export. Ukjent navn gir null. */
export function finnMetricSpec(kildeNavn: string): MetricSpec | null {
  return (
    (METRIC_MAP as Record<string, MetricSpec | undefined>)[kildeNavn] ?? null
  );
}

/**
 * Sjekker payloadens `units` mot de godtatte enhetene. Mangler `units` godtar vi
 * raden — da finnes det ikke noe avvik å oppdage.
 */
export function enhetErGodtatt(
  spec: MetricSpec,
  payloadUnits: unknown,
): boolean {
  if (typeof payloadUnits !== "string" || payloadUnits.trim() === "") return true;
  const normalisert = payloadUnits.trim().toLowerCase();
  return spec.acceptedUnits.some((u) => u.toLowerCase() === normalisert);
}
