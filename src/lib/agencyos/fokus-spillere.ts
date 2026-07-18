/**
 * Fokus-spiller-blokk (D3, godkjent 2026-07-17) — data-loader for cockpiten.
 *
 * To soner:
 *   - Pinnet av deg: coach-valgte spillere (CoachPinnedPlayer), 0–3.
 *   - Foreslått nå: regelbasert utvelgelse (INGEN ny AI-modell) fra de SAMME
 *     stall-signalene cockpit/Stallen alt bruker (loadStallen): plan-etterlevelse
 *     og Strokes Gained-avvik. Hvert forslag får ÉN klarspråk-grunn med tall,
 *     enhet og retning. Forslag er ANBEFALINGER — aldri alarmer/sperrer.
 *
 * Leseveien er defensiv: coach_pinned_players finnes ikke i alle miljøer ennå
 * (additiv DDL, se scripts/create-coach-pinned-players-2026-07-17.ts) — feil
 * ved lesing gir tom pin-liste, aldri en krasj.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { loadStallen, type StallenRow } from "@/lib/admin/stallen-data";

// ── Terskler for regelbasert utvelgelse (dokumentert, ingen skjulte tall) ──
/** Maks antall festede spillere (brief: «0–3 kort»). */
export const MAKS_PINN = 3;
/** Maks antall AI-forslag (brief: «maks 3»). */
export const MAKS_FORSLAG = 3;
/** Plan-etterlevelse under dette (%) denne uka flagges som avvik. */
const PLAN_TERSKEL_PCT = 50;
/** SG-trend som har falt minst så mye (nyeste − eldste av siste 8 målinger). */
const SG_TERSKEL = -0.3;

export type ForslagKind = "plan" | "sg";

export type FokusKort = {
  playerId: string;
  navn: string;
  initialer: string;
  avatarUrl: string | null;
  /** Kontekst-linje (hjemmeklubb) — tom hvis ukjent. */
  sub: string;
  href: string;
};

export type ForslagKort = FokusKort & {
  kind: ForslagKind;
  /** Én klarspråk-grunn med tall + enhet + retning. */
  grunn: string;
  /** HjelpTips-nøkkel for faguttrykket i grunnen. */
  hjelp: "planEtterlevelse" | "sgTotal";
};

export type FokusData = {
  pinnet: FokusKort[];
  forslag: ForslagKort[];
};

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** SG-format: komma-desimal + fortegn (+/−), 1 desimal (retning i tegnet). */
function fmtSgDelta(v: number): string {
  return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");
}

type ScoredKandidat = {
  row: StallenRow;
  kind: ForslagKind;
  score: number;
  grunn: string;
  hjelp: "planEtterlevelse" | "sgTotal";
};

/** Velg den STERKESTE ene grunnen for én spiller (eller null om ingen avvik). */
function scoreKandidat(r: StallenRow): ScoredKandidat | null {
  // Plan-etterlevelse: lav prosent denne uka. Normalisert 0..1 (lavere = verre).
  const plan =
    r.adhPct != null && r.adhPct < PLAN_TERSKEL_PCT
      ? (PLAN_TERSKEL_PCT - r.adhPct) / PLAN_TERSKEL_PCT
      : null;
  // Strokes Gained: fallende trend over siste 8 målepunkter. |delta|/2 → 0..1.
  const sg =
    r.sgDelta != null && r.sgDelta <= SG_TERSKEL
      ? Math.min(1, Math.abs(r.sgDelta) / 2)
      : null;

  if (plan == null && sg == null) return null;

  // Ved lik/sterkere plan-avvik: vis plan-grunnen (mest handlingsrettet for coach).
  if (plan != null && (sg == null || plan >= sg)) {
    return {
      row: r,
      kind: "plan",
      score: plan,
      grunn: `Plan-etterlevelse ${r.adhPct} % denne uka`,
      hjelp: "planEtterlevelse",
    };
  }
  return {
    row: r,
    kind: "sg",
    score: sg as number,
    grunn: `Strokes Gained ${fmtSgDelta(r.sgDelta as number)} · siste 8 målinger`,
    hjelp: "sgTotal",
  };
}

export async function loadFokusSpillere(coach: {
  id: string;
  role: string;
}): Promise<FokusData> {
  // 1) Pin-liste — DEFENSIV: tabellen finnes ikke i alle miljøer ennå.
  let pinIds: string[] = [];
  try {
    const pins = await prisma.coachPinnedPlayer.findMany({
      where: { coachId: coach.id },
      orderBy: { createdAt: "asc" },
      take: MAKS_PINN,
      select: { playerId: true },
    });
    pinIds = pins.map((p) => p.playerId);
  } catch (err) {
    console.error("[fokus] kunne ikke lese pin-liste (tabell mangler?)", err);
    pinIds = [];
  }
  const pinnetSet = new Set(pinIds);

  // 2) Stall-signaler (samme kilde som Stallen/cockpit).
  const stall = await loadStallen(coach, {});

  // 3) Forslag: score alle ikke-pinnede spillere, ranger, ta maks 3.
  const kandidater: ScoredKandidat[] = [];
  for (const r of stall.rows) {
    if (pinnetSet.has(r.id)) continue;
    const scored = scoreKandidat(r);
    if (scored) kandidater.push(scored);
  }
  kandidater.sort((a, b) => b.score - a.score);
  const valgt = kandidater.slice(0, MAKS_FORSLAG);

  // 4) Fulle navn + avatar for kortene (naming-kanon: aldri forkortede navn).
  const unionIds = Array.from(new Set([...pinIds, ...valgt.map((k) => k.row.id)]));
  const brukere =
    unionIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: unionIds } },
          select: { id: true, name: true, avatarUrl: true, homeClub: true },
        })
      : [];
  const brukerById = new Map(brukere.map((u) => [u.id, u]));

  // Pinnet: bevar pin-rekkefølge (createdAt asc). Hopp over spillere uten
  // brukerrad (f.eks. slettet konto) — aldri et tomt/dødt kort.
  const pinnet: FokusKort[] = [];
  for (const id of pinIds) {
    const u = brukerById.get(id);
    if (!u) continue;
    pinnet.push({
      playerId: id,
      navn: u.name ?? "Spiller",
      initialer: initials(u.name),
      avatarUrl: u.avatarUrl ?? null,
      sub: u.homeClub ? u.homeClub.toUpperCase() : "",
      href: `/admin/spillere/${id}`,
    });
  }

  const forslag: ForslagKort[] = valgt.map((k) => {
    const u = brukerById.get(k.row.id);
    return {
      playerId: k.row.id,
      navn: u?.name ?? "Spiller",
      initialer: initials(u?.name),
      avatarUrl: u?.avatarUrl ?? null,
      sub: u?.homeClub ? u.homeClub.toUpperCase() : "",
      href: `/admin/spillere/${k.row.id}`,
      kind: k.kind,
      grunn: k.grunn,
      hjelp: k.hjelp,
    };
  });

  return { pinnet, forslag };
}
