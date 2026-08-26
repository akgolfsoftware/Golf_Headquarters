/**
 * Ren view-modell for Train-lock-cockpiten (T2, AG-01/AG-02/AG-14/AG-15).
 * Ingen Prisma her — kun mapping fra CockpitData + AiDispatchData til de tre
 * kortene fasiten viser: Nå · live, Kø, {navn} i dag. Testbar uten DB.
 */

import type { CockpitData, CockpitTimelineSession } from "@/components/admin/cockpit/agency-cockpit";
import type { AiDispatchData } from "./ai-dispatch-build";

export type CockpitLiveNow = {
  playerName: string;
  initials: string;
  title: string;
  metaText: string;
  locationTag?: string;
  progressPct: number;
  href?: string;
};

export type CockpitQueueCard = {
  id: string;
  title: string;
  meta: string;
  href: string;
  /** Alle utenom første kortet er 0.55 opasitet (HANDOFF §7 komponenter — Kø-kort). */
  dimmed: boolean;
};

export type CockpitNextSession = {
  playerName: string;
  firstName: string;
  initials: string;
  title: string;
  meta: string;
  timeRange: string;
  href?: string;
};

export type TrainLockCockpitView = {
  liveNow: CockpitLiveNow | null;
  queue: CockpitQueueCard[];
  next: CockpitNextSession | null;
};

function fmtHHMM(totalMin: number): string {
  const clamped = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

function firstName(navn: string): string {
  return navn.trim().split(/\s+/)[0] || navn;
}

/**
 * Dispatch-rader som representerer et EKTE ventende element (godkjenning,
 * ubesvart forespørsel, feilet kjøring …). De resterende rene forslags-
 * radene («kjør research», «planlegg neste uke») fyller alltid opp til 4 i
 * byggAiDispatch og hører ikke hjemme i «Kø» — de er forslag, ikke en kø
 * som kan bli tom (AG-14 krever «Kø · 0» når ingenting faktisk venter).
 */
const EKTE_KO_ID = new Set([
  "plan-actions",
  "caddie-drafts",
  "session-requests",
  "innboks-nye",
  "agent-team-failed",
  "agent-team-running",
  "fokus-spillere",
]);

function findAktiv(timeline: CockpitTimelineSession[], now: number): CockpitTimelineSession | null {
  return timeline.find((s) => now >= s.startMin && now < s.startMin + s.durMin) ?? null;
}

export function buildTrainLockCockpit(
  data: Pick<CockpitData, "timeline" | "now">,
  dispatch: Pick<AiDispatchData, "rader">,
): TrainLockCockpitView {
  const aktiv = findAktiv(data.timeline, data.now);

  const liveNow: CockpitLiveNow | null = aktiv
    ? {
        playerName: aktiv.playerName,
        initials: aktiv.initials,
        title: aktiv.title,
        metaText: `${aktiv.title} · ${Math.max(0, aktiv.startMin + aktiv.durMin - data.now)} min igjen`,
        locationTag: aktiv.meta.find((m) => m.icon === "map-pin")?.text,
        progressPct: Math.min(100, Math.max(0, Math.round(((data.now - aktiv.startMin) / aktiv.durMin) * 100))),
        href: aktiv.href,
      }
    : null;

  const queue: CockpitQueueCard[] = dispatch.rader
    .filter((r) => EKTE_KO_ID.has(r.id))
    .map((r, i) => ({
      id: r.id,
      title: r.oppgave,
      meta: r.ferdigNar,
      href: r.href,
      dimmed: i > 0,
    }));

  const nesteRaw = data.timeline.find((s) => s.startMin > data.now) ?? null;
  const next: CockpitNextSession | null = nesteRaw
    ? {
        playerName: nesteRaw.playerName,
        firstName: firstName(nesteRaw.playerName),
        initials: nesteRaw.initials,
        title: nesteRaw.title,
        meta: nesteRaw.meta.map((m) => m.text).join(" · "),
        timeRange: `${fmtHHMM(nesteRaw.startMin)}–${fmtHHMM(nesteRaw.startMin + nesteRaw.durMin)}`,
        href: nesteRaw.href,
      }
    : null;

  return { liveNow, queue, next };
}
