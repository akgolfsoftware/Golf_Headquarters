import type { LPhase } from "@/generated/prisma/client";

/**
 * TN-11 Månedsplan: bygger kalenderuker for én måned av gruppeøkter,
 * perioder, turneringer og samlinger. Ren funksjon — all dato-logikk skjer
 * på kalenderdager i Oslo («YYYY-MM-DD»), aldri på serverens tidssone.
 */

export type TnPlanOkt = { id: string; title: string; startAt: Date; endAt: Date; location: string | null; kind: string | null };
export type TnPlanPeriode = { lPhase: LPhase; startDate: Date; endDate: Date };
export type TnPlanSpenn = { id: string; name: string; startDate: Date; endDate: Date | null; location: string | null };

export type TnHendelseType = "okt" | "turnering" | "samling";
export type TnHendelse = { type: TnHendelseType; id: string; tid: string | null; tittel: string; undertekst: string | null };
export type TnPlanDag = { nokkel: string; dag: number; iManed: boolean; hendelser: TnHendelse[] };
export type TnPlanUke = { nr: number; fra: string; til: string; periode: { navn: string; indeks: number; antall: number } | null; dager: TnPlanDag[] };

export const PERIODENAVN: Record<LPhase, string> = {
  GRUNN: "Grunn",
  SPESIAL: "Spesialisering",
  TURNERING: "Turnering",
  EVALUERING: "Evaluering",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

const DAG_MS = 86_400_000;
const osloNokkel = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Oslo" });
const osloTid = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

/** Kalenderdag i Oslo som «YYYY-MM-DD». */
export function dagnokkel(dato: Date): string {
  return osloNokkel.format(dato);
}

/** «YYYY-MM-DD» → UTC-midnatt for samme kalenderdag. */
function fraNokkel(nokkel: string): number {
  const [a, m, d] = nokkel.split("-").map(Number);
  return Date.UTC(a!, m! - 1, d!);
}

function tilNokkel(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Mandag i ISO-uken for en UTC-midnatt. */
function mandag(ms: number): number {
  return ms - ((new Date(ms).getUTCDay() + 6) % 7) * DAG_MS;
}

function isoUke(ms: number): number {
  const torsdag = mandag(ms) + 3 * DAG_MS;
  const aar = new Date(torsdag).getUTCFullYear();
  const forsteTorsdag = mandag(Date.UTC(aar, 0, 4)) + 3 * DAG_MS;
  return Math.round((torsdag - forsteTorsdag) / (7 * DAG_MS)) + 1;
}

/** Hele kalenderuker (mandag–søndag) som dekker måneden, med én dags margin mot tidssone. */
export function manedsvindu(aar: number, maned: number) {
  const forste = mandag(Date.UTC(aar, maned - 1, 1));
  const siste = mandag(Date.UTC(aar, maned, 0)) + 6 * DAG_MS;
  return { fra: new Date(forste - DAG_MS), til: new Date(siste + 2 * DAG_MS), forsteMandag: forste, sisteSondag: siste };
}

function erSamlingsokt(kind: string | null) {
  return kind === "SAMLING" || kind === "HELDAGSSAMLING";
}

export function byggManedsplan({
  aar,
  maned,
  okter,
  perioder,
  turneringer,
  samlinger,
}: {
  aar: number;
  maned: number;
  okter: TnPlanOkt[];
  perioder: TnPlanPeriode[];
  turneringer: TnPlanSpenn[];
  samlinger: TnPlanSpenn[];
}) {
  const { forsteMandag, sisteSondag } = manedsvindu(aar, maned);
  const perDag = new Map<string, TnHendelse[]>();
  const legg = (nokkel: string, h: TnHendelse) => perDag.set(nokkel, [...(perDag.get(nokkel) ?? []), h]);

  for (const okt of okter) {
    legg(dagnokkel(okt.startAt), {
      type: erSamlingsokt(okt.kind) ? "samling" : "okt",
      id: okt.id,
      tid: osloTid.format(okt.startAt),
      tittel: okt.title,
      undertekst: okt.location,
    });
  }
  const spenn = (type: TnHendelseType, liste: TnPlanSpenn[]) => {
    for (const s of liste) {
      const fra = fraNokkel(dagnokkel(s.startDate));
      const til = fraNokkel(dagnokkel(s.endDate ?? s.startDate));
      for (let d = Math.max(fra, forsteMandag); d <= Math.min(til, sisteSondag); d += DAG_MS) {
        legg(tilNokkel(d), { type, id: s.id, tid: null, tittel: s.name, undertekst: s.location });
      }
    }
  };
  spenn("turnering", turneringer);
  spenn("samling", samlinger);

  // Heldagshendelser først, deretter økter etter klokkeslett.
  for (const liste of perDag.values()) liste.sort((a, b) => (a.tid ?? "").localeCompare(b.tid ?? ""));

  const blokker = perioder.map((p) => ({
    navn: PERIODENAVN[p.lPhase],
    fra: mandag(fraNokkel(dagnokkel(p.startDate))),
    til: mandag(fraNokkel(dagnokkel(p.endDate))),
  }));

  const uker: TnPlanUke[] = [];
  for (let m = forsteMandag; m <= sisteSondag; m += 7 * DAG_MS) {
    const blokk = blokker.find((b) => m >= b.fra && m <= b.til);
    uker.push({
      nr: isoUke(m),
      fra: tilNokkel(m),
      til: tilNokkel(m + 6 * DAG_MS),
      periode: blokk ? { navn: blokk.navn, indeks: (m - blokk.fra) / (7 * DAG_MS) + 1, antall: (blokk.til - blokk.fra) / (7 * DAG_MS) + 1 } : null,
      dager: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(m + i * DAG_MS);
        const nokkel = tilNokkel(d.getTime());
        return { nokkel, dag: d.getUTCDate(), iManed: d.getUTCMonth() === maned - 1, hendelser: perDag.get(nokkel) ?? [] };
      }),
    });
  }

  const dagerIManed = uker.flatMap((u) => u.dager).filter((d) => d.iManed);
  return {
    uker,
    tall: {
      okter: dagerIManed.reduce((sum, d) => sum + d.hendelser.filter((h) => h.type === "okt").length, 0),
      turneringsdager: dagerIManed.filter((d) => d.hendelser.some((h) => h.type === "turnering")).length,
      samlingsdager: dagerIManed.filter((d) => d.hendelser.some((h) => h.type === "samling")).length,
    },
  };
}
