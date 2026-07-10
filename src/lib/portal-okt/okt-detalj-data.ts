/**
 * Data-loader for v2 økt-detalj (PlayerHQ «Økt»).
 *
 * Speiler den ekte lese-flaten /portal/gjennomfore/[id] (TrainingSessionV2,
 * Spor B): samme eierskaps-sjekk (studentId) og samme drill-felter — men her
 * pakket som en typet datakontrakt for OktV2 + med et forhåndsvisnings-oppslag
 * (`hentEksempelOktId`) som plukker en EKTE eksempel-økt for testbrukeren.
 *
 * Ekte Prisma. Ingen fabrikerte tall: mangler et felt (mål, «hvorfor», volum),
 * utelates det og bygges ærlig tom-tilstand i stedet.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type OktUiStatus = "planned" | "now" | "done" | "cancelled" | "skipped";
export type DrillStatus = "done" | "naa" | "upcoming";
export type StatusTone = "lime" | "up" | "info" | "down";

export type OktDrill = {
  id: string;
  navn: string;
  /** Drill-instruksjon (description) — vises som undertekst, aldri påklistret «Mål:». */
  beskrivelse: string | null;
  /** Volum-streng fra rep-type (sett×reps / baller / svinger / min) — null hvis ikke satt. */
  volum: string | null;
  pyramide: PyramidArea;
  status: DrillStatus;
};

export type OppsettRad = { label: string; value: string };

export type OktDetaljData =
  | { found: false }
  | {
      found: true;
      id: string;
      /** Full tittel (uendret fra DB). */
      tittel: string;
      /** Tittel uten «PYR · »-prefiks (til kursiv em-del). */
      emTittel: string;
      /** Dominerende pyramide-akse i økta (til tittel-prefiks + chip). */
      pyramide: PyramidArea;
      datoTekst: string;
      /** «16:00–17:30». */
      tidTekst: string;
      varighetMin: number;
      /** Situasjon/miljø-etikett (Studio/Range/Bane/Turnering). */
      sted: string;
      status: OktUiStatus;
      statusLabel: string;
      statusTone: StatusTone;
      /** Kan starte/fortsette (anbefaling — aldri sperre). */
      kanStarte: boolean;
      startLabel: string;
      startHref: string;
      antallDrills: number;
      antallFullfort: number;
      drills: OktDrill[];
      /** Coach-brief eller notat — ærlig «hvorfor», null hvis ingen tekst finnes. */
      hvorfor: string | null;
      /** «Slik er økta satt opp» — kun rader med ekte verdi. */
      oppsett: OppsettRad[];
    };

const MILJO_LABEL: Record<string, string> = {
  M0: "Studio", M1: "Range", M2: "Range", M3: "Bane", M4: "Bane", M5: "Turnering",
};
const PRACTICE_LABEL: Record<string, string> = {
  BLOKK: "Blokk · teknikk", RANDOM: "Variert", KONKURRANSE: "Konkurranse", SPILL_TEST: "Spill-test",
};
const PRACTICE_TO_PYRAMID: Record<string, PyramidArea> = {
  BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL",
};
const LFASE_LABEL: Record<string, string> = {
  L_KROPP: "Kropp", L_ARM: "Arm", L_KOLLE: "Kølle", L_BALL: "Ball", L_AUTO: "Auto",
};

function fmtTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo",
  });
}
function fmtDato(d: Date): string {
  const s = d.toLocaleDateString("nb-NO", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type DrillRow = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  repetitions: number | null;
  pyramide: PyramidArea;
  lFase: string | null;
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
  _count: { logs: number };
};

function drillVolum(d: DrillRow): string | null {
  switch (d.repType) {
    case "SETT_REPS":
      return d.repSett != null && d.repReps != null ? `${d.repSett}×${d.repReps}` : null;
    case "BALLER_SLATT":
      return d.repAntall != null ? `${d.repAntall} baller` : null;
    case "SVINGER_UTEN_BALL":
      return d.repAntall != null ? `${d.repAntall} svinger` : null;
    case "TID":
      return d.repMinutter != null ? `${d.repMinutter} min` : null;
    default:
      if (d.repetitions != null) return `${d.repetitions} reps`;
      return d.durationMinutes > 0 ? `${d.durationMinutes} min` : null;
  }
}

/** Trekk coach-brief-melding ut av completedSummary-JSON (samme sti som lese-flaten). */
function lesHvorfor(rawSummary: unknown, notes: string | null): string | null {
  if (rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)) {
    const brief = (rawSummary as Record<string, unknown>).coachBrief;
    if (brief && typeof brief === "object" && !Array.isArray(brief)) {
      const melding = (brief as Record<string, unknown>).melding;
      if (typeof melding === "string" && melding.trim().length > 0) return melding.trim();
    }
  }
  if (notes && notes.trim().length > 0) return notes.trim();
  return null;
}

/**
 * Plukk en EKTE eksempel-økt for testbrukeren (til v2-forhåndsvisning).
 * Foretrekker en økt som faktisk har drills; ellers nyeste økt. null → tom.
 */
export async function hentEksempelOktId(userId: string): Promise<string | null> {
  const medDrills = await prisma.trainingSessionV2
    .findFirst({
      where: { studentId: userId, drills: { some: {} } },
      orderBy: { startTime: "desc" },
      select: { id: true },
    })
    .catch(() => null);
  if (medDrills) return medDrills.id;

  const nyeste = await prisma.trainingSessionV2
    .findFirst({
      where: { studentId: userId },
      orderBy: { startTime: "desc" },
      select: { id: true },
    })
    .catch(() => null);
  return nyeste?.id ?? null;
}

export async function getOktDetaljData(
  userId: string,
  sessionId: string | null,
): Promise<OktDetaljData> {
  if (!sessionId) return { found: false };

  const okt = await prisma.trainingSessionV2
    .findFirst({
      where: { id: sessionId, studentId: userId },
      select: {
        id: true, title: true, startTime: true, endTime: true, status: true,
        miljo: true, practiceType: true, notes: true, completedSummary: true,
        drills: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true, name: true, description: true, durationMinutes: true,
            repetitions: true, pyramide: true, lFase: true, repType: true,
            repAntall: true, repMinutter: true, repSett: true, repReps: true,
            _count: { select: { logs: true } },
          },
        },
      },
    })
    .catch(() => null);

  if (!okt) return { found: false };

  const varighetMin = Math.max(0, Math.round((okt.endTime.getTime() - okt.startTime.getTime()) / 60_000));

  // Status-avledning
  const uiStatus: OktUiStatus =
    okt.status === "COMPLETED" ? "done"
    : okt.status === "IN_PROGRESS" ? "now"
    : okt.status === "CANCELLED" ? "cancelled"
    : okt.status === "SKIPPED" ? "skipped"
    : "planned";

  const statusMeta: Record<OktUiStatus, { label: string; tone: StatusTone }> = {
    planned: { label: "Planlagt", tone: "info" },
    now: { label: "Pågår", tone: "lime" },
    done: { label: "Fullført", tone: "up" },
    cancelled: { label: "Avlyst", tone: "down" },
    skipped: { label: "Hoppet over", tone: "info" },
  };

  // Drill-status: fullført = har minst én logg (eller hele økta er fullført).
  // I pågående økt markeres første ikke-fullførte drill som «nå».
  const drills = okt.drills as unknown as DrillRow[];
  let naaSatt = false;
  const mappedeDrills: OktDrill[] = drills.map((d) => {
    const fullfort = uiStatus === "done" || d._count.logs > 0;
    let status: DrillStatus = fullfort ? "done" : "upcoming";
    if (!fullfort && uiStatus === "now" && !naaSatt) {
      status = "naa";
      naaSatt = true;
    }
    return {
      id: d.id,
      navn: d.name,
      beskrivelse: d.description && d.description.trim().length > 0 ? d.description.trim() : null,
      volum: drillVolum(d),
      pyramide: d.pyramide,
      status,
    };
  });
  const antallFullfort = mappedeDrills.filter((d) => d.status === "done").length;

  // Dominerende pyramide: hyppigste drill-akse, ellers avledet av practiceType.
  const teller = new Map<PyramidArea, number>();
  for (const d of drills) teller.set(d.pyramide, (teller.get(d.pyramide) ?? 0) + 1);
  let pyramide: PyramidArea = PRACTICE_TO_PYRAMID[okt.practiceType] ?? "TEK";
  let best = 0;
  for (const [a, n] of teller) if (n > best) { best = n; pyramide = a; }

  const prefix = `${pyramide} · `;
  const emTittel = okt.title.startsWith(prefix) ? okt.title.slice(prefix.length) : okt.title;

  // «Slik er økta satt opp» — kun rader med ekte verdi
  const oppsett: OppsettRad[] = [];
  const sted = MILJO_LABEL[okt.miljo] ?? "Studio";
  oppsett.push({ label: "Situasjon", value: sted });
  if (PRACTICE_LABEL[okt.practiceType]) oppsett.push({ label: "Type", value: PRACTICE_LABEL[okt.practiceType] });
  const fokusAkser = [...teller.keys()];
  if (fokusAkser.length > 0) oppsett.push({ label: "Fokus", value: fokusAkser.join(" · ") });
  const lFaser = [...new Set(drills.map((d) => d.lFase).filter((x): x is string => !!x))]
    .map((k) => LFASE_LABEL[k] ?? k);
  if (lFaser.length > 0) oppsett.push({ label: "L-fase", value: lFaser.join(" · ") });

  // Start-lenke: samme kanon som lese-flaten (live-flyten).
  const startHref =
    uiStatus === "now" ? `/portal/live/${okt.id}/active` : `/portal/live/${okt.id}`;

  const meta = statusMeta[uiStatus];

  return {
    found: true,
    id: okt.id,
    tittel: okt.title,
    emTittel,
    pyramide,
    datoTekst: fmtDato(okt.startTime),
    tidTekst: `${fmtTid(okt.startTime)}–${fmtTid(okt.endTime)}`,
    varighetMin,
    sted,
    status: uiStatus,
    statusLabel: meta.label,
    statusTone: meta.tone,
    kanStarte: uiStatus === "planned" || uiStatus === "now",
    startLabel: uiStatus === "now" ? "Fortsett økta" : "Start økta",
    startHref,
    antallDrills: mappedeDrills.length,
    antallFullfort,
    drills: mappedeDrills,
    hvorfor: lesHvorfor(okt.completedSummary, okt.notes),
    oppsett,
  };
}
