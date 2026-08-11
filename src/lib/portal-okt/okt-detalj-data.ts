/**
 * Data-loader for den SAMMENSLÅTTE økt-siden /portal/gjennomfore/[id]
 * (Paper-port W1, fase2 — fasit: playerhq-okt-detalj.html).
 *
 * Én skjerm, to tilstander (planlagt / gjennomført) — erstatter både den gamle
 * OktV2-lesesiden og /portal/tren/[sessionId]/planlagt (som nå er redirect hit).
 * Tilgangsmodellen er derfor planlagt-sidens brede: spilleren selv, coach,
 * host, invitert deltaker, eller COACH/ADMIN-rolle.
 *
 * Ekte Prisma. Ingen fabrikerte tall: mangler et felt (mål, resultat, notat),
 * utelates det og skjermen bygger ærlig tilstand uten.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { ukenummer } from "@/lib/uke-helpers";
import { lFaseTilSteg, pressTilNivaa } from "@/lib/ak-formel-visning";
import type { LFase, MMiljo } from "@/generated/prisma/client";

export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export type OktUiStatus = "planned" | "now" | "done" | "cancelled" | "skipped";
export type StatusTone = "lime" | "up" | "info" | "down";

export type OktDrill = {
  id: string;
  navn: string;
  /** Volum-streng (sett×reps / baller / svinger / min / reps) — null hvis ikke satt. */
  volum: string | null;
  /** Varighet i minutter — null når 0/ikke satt. */
  tidMin: number | null;
  /**
   * AK-formel v2: PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS — bygget KUN av
   * reelle felter (tomme slots utelates). Null når bare pyramide finnes.
   */
  formel: string | null;
  pyramide: PyramidArea;
  /** Fullført: har logg, eller hele økta er fullført. */
  gjort: boolean;
};

export type OktDeltaker = {
  id: string;
  navn: string;
  statusLabel: string;
  statusTone: StatusTone | "warn";
};

export type InviterSpiller = {
  id: string;
  name: string;
  avatarUrl: string | undefined;
  hcp: number | null;
  gruppe: string | undefined;
};

export type OktResultat = {
  /** «16:38» (Oslo) fra completedSummary.liveSummary.completedAt — null hvis ukjent. */
  fullfortKl: string | null;
  totalReps: number | null;
  drillsFullfort: number;
  antallDrills: number;
};

export type OktDetaljData =
  | { found: false }
  | {
      found: true;
      id: string;
      tittel: string;
      /** Tittel uten «PYR · »-prefiks. */
      emTittel: string;
      pyramide: PyramidArea;
      /** «Tirsdag 4.8». */
      dagTekst: string;
      ukeNr: number;
      /** «15:00–16:30». */
      tidTekst: string;
      varighetMin: number;
      sted: string;
      status: OktUiStatus;
      statusLabel: string;
      statusTone: StatusTone;
      /** Planlagt-modus: kan starte/fortsette (anbefaling — aldri sperre). */
      kanStarte: boolean;
      startLabel: string;
      startHref: string;
      /** «Anders Kristiansen · 30.07» — null når økta ikke er coach-publisert. */
      publisertAv: string | null;
      /** Målsetning fra økta — null når coach ikke har satt en. */
      maal: string | null;
      /** Coach-brief eller notat («hvorfor») — null når ingen tekst finnes. */
      hvorfor: string | null;
      drills: OktDrill[];
      /** Kun i gjennomført-modus (status done) — ellers null. */
      resultat: OktResultat | null;
      /** Spillerens egen observasjon etter økta (spillerVurdering) — null uten. */
      notat: string | null;
      deltakere: OktDeltaker[];
      /** Inviter-kompis: kun når brukeren er host på en delt økt med plass. */
      invite: {
        maxParticipants: number;
        currentParticipants: number;
        spillere: InviterSpiller[];
      } | null;
    };

const MILJO_LABEL: Record<string, string> = {
  M0: "Studio", M1: "Range", M2: "Range", M3: "Bane", M4: "Bane", M5: "Turnering",
};

/** Belastning-slot i AK-formel v2 (Paper-tokens) fra MMiljo. */
const MILJO_FORMEL: Record<string, string> = {
  M0: "INNENDORS", M1: "TRENINGSOMRADE", M2: "TRENINGSOMRADE",
  M3: "BANE", M4: "BANE", M5: "TURNERING",
};

/** Motorikk-slot (Vei B-steg → Paper-skrivemåte). */
const STEG_FORMEL: Record<string, string> = {
  UTEN_BALL: "UTEN_BALL", LAV_HASTIGHET: "LAV_HAST", AUTO: "AUTO",
};

/** Press-slot — Paper-navnene (Anders 05.08.2026): hvem som ser på. */
const PRESS_FORMEL: Record<string, string> = {
  FRI: "ALENE", KRAV: "OBSERVERT", UTFORDRING: "KONKURRANSE", KONKURRANSE: "TURNERING",
};

const PRACTICE_TO_PYRAMID: Record<string, PyramidArea> = {
  BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL",
};

const DELTAKER_STATUS: Record<string, { label: string; tone: StatusTone | "warn" }> = {
  INVITED: { label: "Invitert", tone: "info" },
  ACCEPTED: { label: "Bekreftet", tone: "up" },
  DECLINED: { label: "Avslo", tone: "down" },
  MAYBE: { label: "Kanskje", tone: "warn" },
  ATTENDED: { label: "Deltok", tone: "up" },
  NO_SHOW: { label: "Uteble", tone: "down" },
};

function fmtTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo",
  });
}

/** «Tirsdag 4.8» (Oslo). */
function fmtDagKort(d: Date): string {
  const dag = d.toLocaleDateString("nb-NO", { weekday: "long", timeZone: "Europe/Oslo" });
  const dato = d.toLocaleDateString("nb-NO", { day: "numeric", month: "numeric", timeZone: "Europe/Oslo" });
  return `${dag.charAt(0).toUpperCase()}${dag.slice(1)} ${dato.replace(/\.$/, "")}`;
}

function fmtDatoKort(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
}

type DrillRow = {
  id: string;
  name: string;
  durationMinutes: number;
  repetitions: number | null;
  pyramide: PyramidArea;
  omraade: string | null;
  lFase: LFase | null;
  miljo: MMiljo | null;
  prPress: string | null;
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
      return d.repetitions != null ? `${d.repetitions} reps` : null;
  }
}

/**
 * AK-formel v2 av reelle drill-felter. Slots uten verdi utelates ærlig —
 * aldri fabrikkert. Null når resultatet bare er pyramide-aksen alene.
 */
function drillFormel(d: DrillRow, sessionMiljo: MMiljo): string | null {
  const steg = lFaseTilSteg(d.lFase);
  const press = pressTilNivaa(d.prPress);
  const miljo = d.miljo ?? sessionMiljo;
  const deler = [
    d.pyramide as string,
    d.omraade,
    steg ? STEG_FORMEL[steg] : null,
    miljo ? MILJO_FORMEL[miljo] ?? null : null,
    press ? PRESS_FORMEL[press] : null,
  ].filter((x): x is string => x != null && x.length > 0);
  return deler.length >= 2 ? deler.join("_") : null;
}

/** Trekk coach-brief-melding ut av completedSummary-JSON. */
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

/** Les liveSummary (fullført-tidspunkt + reps) fra completedSummary-JSON. */
function lesLiveSummary(raw: unknown): { completedAt: Date | null; totalReps: number | null } {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const ls = (raw as Record<string, unknown>).liveSummary;
    if (ls && typeof ls === "object" && !Array.isArray(ls)) {
      const rec = ls as Record<string, unknown>;
      const completedAt =
        typeof rec.completedAt === "string" && !Number.isNaN(Date.parse(rec.completedAt))
          ? new Date(rec.completedAt)
          : null;
      const totalReps =
        typeof rec.totalReps === "number" && Number.isFinite(rec.totalReps)
          ? rec.totalReps
          : null;
      return { completedAt, totalReps };
    }
  }
  return { completedAt: null, totalReps: null };
}

/** Spillerens observasjon: completedSummary.spillerVurdering.nesteFokus. */
function lesNotat(raw: unknown): string | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const sv = (raw as Record<string, unknown>).spillerVurdering;
    if (sv && typeof sv === "object" && !Array.isArray(sv)) {
      const nesteFokus = (sv as Record<string, unknown>).nesteFokus;
      if (typeof nesteFokus === "string" && nesteFokus.trim().length > 0) {
        return nesteFokus.trim();
      }
    }
  }
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
  user: { id: string; role: string },
  sessionId: string | null,
): Promise<OktDetaljData> {
  if (!sessionId) return { found: false };

  const okt = await prisma.trainingSessionV2
    .findUnique({
      where: { id: sessionId },
      select: {
        id: true, title: true, startTime: true, endTime: true, status: true,
        miljo: true, practiceType: true, notes: true, completedSummary: true,
        location: true, maalsetning: true, isCoachCreated: true, coachId: true,
        createdAt: true, studentId: true, hostId: true, isShared: true,
        maxParticipants: true,
        participants: {
          select: {
            id: true, userId: true, status: true,
            user: { select: { id: true, name: true } },
          },
        },
        drills: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true, name: true, durationMinutes: true, repetitions: true,
            pyramide: true, omraade: true, lFase: true, miljo: true,
            prPress: true, repType: true, repAntall: true, repMinutter: true,
            repSett: true, repReps: true,
            _count: { select: { logs: true } },
          },
        },
      },
    })
    .catch(() => null);

  if (!okt) return { found: false };

  // Tilgang (samme modell som gamle planlagt-siden): spilleren selv, coach,
  // host, invitert deltaker, eller COACH/ADMIN-rolle.
  const erDeltaker = okt.participants.some((p) => p.userId === user.id);
  const harTilgang =
    okt.studentId === user.id ||
    okt.coachId === user.id ||
    okt.hostId === user.id ||
    erDeltaker ||
    user.role === "ADMIN" ||
    user.role === "COACH";
  if (!harTilgang) return { found: false };

  const varighetMin = Math.max(0, Math.round((okt.endTime.getTime() - okt.startTime.getTime()) / 60_000));

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

  const drills: OktDrill[] = okt.drills.map((d) => ({
    id: d.id,
    navn: d.name,
    volum: drillVolum(d),
    tidMin: d.durationMinutes > 0 ? d.durationMinutes : null,
    formel: drillFormel(d, okt.miljo),
    pyramide: d.pyramide,
    gjort: uiStatus === "done" || d._count.logs > 0,
  }));

  // Dominerende pyramide: hyppigste drill-akse, ellers avledet av practiceType.
  const teller = new Map<PyramidArea, number>();
  for (const d of okt.drills) teller.set(d.pyramide, (teller.get(d.pyramide) ?? 0) + 1);
  let pyramide: PyramidArea = PRACTICE_TO_PYRAMID[okt.practiceType] ?? "TEK";
  let best = 0;
  for (const [a, n] of teller) if (n > best) { best = n; pyramide = a; }

  const prefix = `${pyramide} · `;
  const emTittel = okt.title.startsWith(prefix) ? okt.title.slice(prefix.length) : okt.title;

  // Publisert av — kun når økta faktisk er coach-opprettet med en coach-rad.
  let publisertAv: string | null = null;
  if (okt.isCoachCreated && okt.coachId) {
    const coach = await prisma.user
      .findUnique({ where: { id: okt.coachId }, select: { name: true } })
      .catch(() => null);
    if (coach?.name) publisertAv = `${coach.name} · ${fmtDatoKort(okt.createdAt)}`;
  }

  // Gjennomført-modus: resultat + notat fra completedSummary (kun reelle felter).
  let resultat: OktResultat | null = null;
  let notat: string | null = null;
  if (uiStatus === "done") {
    const ls = lesLiveSummary(okt.completedSummary);
    resultat = {
      fullfortKl: ls.completedAt ? fmtTid(ls.completedAt) : null,
      totalReps: ls.totalReps,
      drillsFullfort: drills.filter((d) => d.gjort).length,
      antallDrills: drills.length,
    };
    notat = lesNotat(okt.completedSummary);
  }

  const deltakere: OktDeltaker[] = okt.participants.map((p) => {
    const meta = DELTAKER_STATUS[p.status] ?? { label: p.status, tone: "info" as const };
    return { id: p.id, navn: p.user.name, statusLabel: meta.label, statusTone: meta.tone };
  });

  // Inviter-kompis (funksjonen fra gamle planlagt-siden, beholdt uendret):
  // kun host på delt økt med ledig plass.
  const kanInvitere =
    okt.hostId === user.id &&
    okt.isShared &&
    uiStatus !== "done" &&
    (okt.maxParticipants == null || okt.participants.length < okt.maxParticipants);
  let invite: NonNullable<Extract<OktDetaljData, { found: true }>["invite"]> | null = null;
  if (kanInvitere) {
    const inviterte = new Set(okt.participants.map((p) => p.userId));
    inviterte.add(user.id);
    const kandidater = await prisma.user
      .findMany({
        where: { role: "PLAYER", deletedAt: null, id: { notIn: Array.from(inviterte) } },
        select: { id: true, name: true, avatarUrl: true, hcp: true, homeClub: true },
        orderBy: { name: "asc" },
        take: 50,
      })
      .catch(() => []);
    invite = {
      maxParticipants: okt.maxParticipants ?? 8,
      currentParticipants: okt.participants.length,
      spillere: kandidater.map((k) => ({
        id: k.id,
        name: k.name,
        avatarUrl: k.avatarUrl ?? undefined,
        hcp: k.hcp,
        gruppe: k.homeClub ?? undefined,
      })),
    };
  }

  const meta = statusMeta[uiStatus];
  const startHref =
    uiStatus === "now" ? `/portal/live/${okt.id}/active` : `/portal/live/${okt.id}`;

  return {
    found: true,
    id: okt.id,
    tittel: okt.title,
    emTittel,
    pyramide,
    dagTekst: fmtDagKort(okt.startTime),
    ukeNr: ukenummer(okt.startTime),
    tidTekst: `${fmtTid(okt.startTime)}–${fmtTid(okt.endTime)}`,
    varighetMin,
    sted: okt.location?.trim() || (MILJO_LABEL[okt.miljo] ?? "Studio"),
    status: uiStatus,
    statusLabel: meta.label,
    statusTone: meta.tone,
    kanStarte: uiStatus === "planned" || uiStatus === "now",
    startLabel: uiStatus === "now" ? "Fortsett økta" : "Start økta",
    startHref,
    publisertAv,
    maal: okt.maalsetning?.trim() || null,
    hvorfor: lesHvorfor(okt.completedSummary, okt.notes),
    drills,
    resultat,
    notat,
    deltakere,
    invite,
  };
}
