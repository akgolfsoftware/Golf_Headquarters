/**
 * Duplikatfri gruppeplan-utrulling (plan G3) — ren dedup-logikk, ingen IO.
 *
 * En spiller kan ligge i flere AK-grupper (GFGK Elite + WANG + Junior Academy)
 * og skal få gruppe-planene automatisk — ALDRI duplikater. To-lags-regelen:
 *
 * - IDEMPOTENT: eksisterende rad kommer fra SAMME gruppe (samme sourceGroupId)
 *   og overlapper i tid → hopp stille. Re-kjøring av en utrulling er trygg.
 * - KRYSSKILDE: eksisterende rad kommer fra en ANNEN kilde (annen gruppe, eller
 *   spillerens egen — sourceGroupId null) og kolliderer → hopp + rapporter.
 *
 * Overlapp er EKTE intervall-snitt, aldri «samme dag»: WANG morgen + GFGK kveld
 * samme dag er legitimt og skal ikke kollidere. Kant-mot-kant (a slutter
 * nøyaktig når b starter) er IKKE overlapp.
 *
 * Ren modul — trygg å importere fra klient og server.
 */

export type DedupGrunn = "IDEMPOTENT" | "KRYSSKILDE";

/**
 * Ekte intervall-snitt mellom [aStart, aEnd) og [bStart, bEnd).
 * Kant-mot-kant er IKKE overlapp (halvåpne intervaller).
 */
export function overlapper(
  aStart: Date | string,
  aEnd: Date | string,
  bStart: Date | string,
  bEnd: Date | string,
): boolean {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
}

export interface PeriodeForDedup {
  lPhase: string;
  startDate: Date | string;
  endDate: Date | string;
  /** null = spillerens egen periode (ingen gruppekilde). */
  sourceGroupId?: string | null;
}

/**
 * Skal en ny gruppeperiode hoppes over mot en eksisterende? To-lags-regelen:
 * - IDEMPOTENT: eksisterende har samme sourceGroupId som kilden og overlapper
 *   (uansett lPhase — re-kjøring etter periode-redigering skal aldri stable).
 * - KRYSSKILDE: annen kilde med SAMME lPhase og overlapp.
 * Perioder er heldags-intervaller der endDate er inklusiv siste dag — derfor
 * regnes eksakt kant (ny starter dagen eksisterende slutter) som overlapp her,
 * i tråd med dagens `lte`/`gte`-dedup i utrullingen.
 */
export function skalHoppeOverPeriode(
  eksisterende: PeriodeForDedup,
  ny: Omit<PeriodeForDedup, "sourceGroupId">,
  kildeGroupId: string,
): { hopp: boolean; grunn: DedupGrunn | null } {
  const es = new Date(eksisterende.startDate).getTime();
  const ee = new Date(eksisterende.endDate).getTime();
  const ns = new Date(ny.startDate).getTime();
  const ne = new Date(ny.endDate).getTime();
  // Inklusive datointervaller: overlapp når ny.start <= eks.slutt OG eks.start <= ny.slutt.
  const datoOverlapp = ns <= ee && es <= ne;
  if (!datoOverlapp) return { hopp: false, grunn: null };

  if ((eksisterende.sourceGroupId ?? null) === kildeGroupId) {
    return { hopp: true, grunn: "IDEMPOTENT" };
  }
  if (eksisterende.lPhase === ny.lPhase) {
    return { hopp: true, grunn: "KRYSSKILDE" };
  }
  return { hopp: false, grunn: null };
}

/**
 * Slå sammen gruppeslots med IDENTISK tidsrom til én slot med kombinert
 * gruppenavn («GFGK Elite + WANG Toppidrett»). Slots med ulikt tidsrom —
 * også delvis overlappende — beholdes hver for seg. Rekkefølgen bevares
 * (første forekomst vinner plassen og bærer øvrige felter).
 */
export function dedupGruppeSlots<
  T extends { startAt: string; endAt: string; groupName: string },
>(slots: T[]): T[] {
  const perTidsrom = new Map<string, T>();
  const resultat: T[] = [];
  for (const slot of slots) {
    const nokkel = `${slot.startAt}|${slot.endAt}`;
    const eksisterende = perTidsrom.get(nokkel);
    if (!eksisterende) {
      const kopi = { ...slot };
      perTidsrom.set(nokkel, kopi);
      resultat.push(kopi);
      continue;
    }
    const navn = eksisterende.groupName.split(" + ");
    if (!navn.includes(slot.groupName)) {
      eksisterende.groupName = [...navn, slot.groupName].join(" + ");
    }
  }
  return resultat;
}
