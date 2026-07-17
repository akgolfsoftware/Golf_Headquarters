/**
 * Ren forslags-utledning for «Fokus-spillere»-blokken (D3, godkjent
 * 2026-07-17). Ingen Prisma/IO her — testes i fokus-forslag.test.ts.
 * Signalene er de EKSISTERENDE cockpit-signalene: plan-etterlevelse,
 * Strokes Gained og inaktivitet. Forslag er anbefalinger, aldri alarmer.
 */

export type FokusRetning = "up" | "down";
export type FokusForslagKilde = "planEtterlevelse" | "sg" | "inaktivitet";

export type FokusForslag = {
  playerId: string;
  navn: string;
  /** ÉN klarspråk-grunn med tall, enhet og retning. */
  grunn: string;
  retning: FokusRetning;
  kilde: FokusForslagKilde;
};

/** Maks antall pinnede — håndheves i fokus-actions.ts og i UI-teksten. */
export const MAKS_PINNEDE = 3;
export const MAKS_FORSLAG = 3;

// Terskler for forslags-signalene (anbefaling, aldri sperre):
const PLAN_MIN_PLANLAGT = 3; // minst 3 planlagte økter før % gir mening
const PLAN_TERSKEL_PCT = 60; // under 60 % etterlevelse → foreslå
const SG_TERSKEL = -0.5; // SG-snitt 30 d under −0,5 → foreslå
const INAKTIV_TERSKEL_DAGER = 10; // 10+ dager uten innlogging → foreslå

/** SG-format m/ fortegn, norsk komma og ekte minustegn: +0,8 / −1,2 / 0,0. */
export function fmtSg(v: number): string {
  const avrundet = Math.round(v * 10) / 10;
  const abs = Math.abs(avrundet).toFixed(1).replace(".", ",");
  if (avrundet > 0) return `+${abs}`;
  if (avrundet < 0) return `−${abs}`;
  return "0,0";
}

export type ForslagSignalInput = {
  playerId: string;
  navn: string;
  /** Planlagte plan-økter siste 14 d (forfalt i vinduet). */
  planlagt14d: number;
  fullfort14d: number;
  /** SG-snitt siste 30 d, null = ingen runder m/ SG. */
  sgSnitt30d: number | null;
  /** Dager siden siste innlogging, null = aldri logget inn (stub — foreslås ikke). */
  dagerSidenInnlogging: number | null;
};

type Kandidat = FokusForslag & { score: number };

/**
 * Utleder maks `maks` forslag — ett per spiller (sterkeste signal vinner),
 * rangert etter alvorlighet. `ekskluder` = allerede pinnede spillere.
 */
export function utledForslag(
  spillere: ForslagSignalInput[],
  ekskluder: ReadonlySet<string>,
  maks: number = MAKS_FORSLAG,
): FokusForslag[] {
  const kandidater: Kandidat[] = [];

  for (const s of spillere) {
    if (ekskluder.has(s.playerId)) continue;
    const perSpiller: Kandidat[] = [];

    if (s.planlagt14d >= PLAN_MIN_PLANLAGT) {
      const pct = Math.round((s.fullfort14d / s.planlagt14d) * 100);
      if (pct < PLAN_TERSKEL_PCT) {
        perSpiller.push({
          playerId: s.playerId,
          navn: s.navn,
          grunn: `Plan-etterlevelse ${pct} % siste 2 uker`,
          retning: "down",
          kilde: "planEtterlevelse",
          score: (PLAN_TERSKEL_PCT - pct) / PLAN_TERSKEL_PCT,
        });
      }
    }

    if (s.sgSnitt30d != null && s.sgSnitt30d <= SG_TERSKEL) {
      perSpiller.push({
        playerId: s.playerId,
        navn: s.navn,
        grunn: `Strokes Gained ${fmtSg(s.sgSnitt30d)} siste 30 dager`,
        retning: "down",
        kilde: "sg",
        score: Math.min(1, Math.abs(s.sgSnitt30d) / 2),
      });
    }

    if (
      s.dagerSidenInnlogging != null &&
      s.dagerSidenInnlogging >= INAKTIV_TERSKEL_DAGER
    ) {
      perSpiller.push({
        playerId: s.playerId,
        navn: s.navn,
        grunn: `Ingen innlogging på ${s.dagerSidenInnlogging} dager`,
        retning: "down",
        kilde: "inaktivitet",
        score: Math.min(1, s.dagerSidenInnlogging / 30),
      });
    }

    // ÉN grunn per spiller — det sterkeste signalet vinner.
    if (perSpiller.length > 0) {
      perSpiller.sort((a, b) => b.score - a.score);
      kandidater.push(perSpiller[0]);
    }
  }

  kandidater.sort(
    (a, b) => b.score - a.score || a.navn.localeCompare(b.navn, "nb"),
  );
  return kandidater
    .slice(0, maks)
    .map(({ score: _score, ...forslag }) => forslag);
}
