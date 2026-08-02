/**
 * Hvor mye av en permisjon/skade (Leave) får coachen se?
 *
 * Leave har to helt ulike deler, og de kan ikke ha samme rettsgrunnlag:
 *
 *  1. SELVE FRAVÆRSPERIODEN (start, slutt, og grunner som reise/jobb/studier)
 *     er ikke helsedata. Den behandles for å oppfylle avtalen — en pauset
 *     permisjon pauser abonnementet spilleren betaler for. GDPR art. 6-1 b.
 *
 *  2. HELSEDELEN (skade, sykdom, rehab-plan, fritekstbeskrivelsen) er «særlig
 *     kategori», art. 9, og krever uttrykkelig samtykke.
 *
 * Derfor MÅ det være mulig å pause abonnementet uten å oppgi en helsegrunn:
 * hvis et art. 9-samtykke var betingelsen for å få pauset betalingen sin,
 * ville samtykket ikke vært frivillig, og dermed ugyldig (art. 7-4).
 *
 * Rene funksjoner — ingen DB. Kallstedet slår opp samtykket og sender inn
 * nivået.
 */

/** Grunner som i seg selv røper en helseopplysning. */
const HELSE_GRUNNER = new Set(["SKADE", "SYKDOM"]);

/**
 * Hvor mye mottakeren har lov til å se.
 * - `INGEN`  — ingen samtykke: helsedelen finnes ikke for mottakeren.
 * - `STATUS` — COACH_INNSYN: at det foreligger en helsebegrensning, ikke hva.
 * - `DETALJ` — COACH_DETALJ: grunn og beskrivelse som den er.
 */
export type InnsynsNivaa = "INGEN" | "STATUS" | "DETALJ";

export type RaaLeave = {
  reason: string;
  startAt: Date;
  endAt: Date | null;
  isInjury: boolean;
  returnedAt: Date | null;
  description?: string | null;
};

export type SettLeave = {
  /** Vises som den er ved DETALJ, ellers "FRAVAER". */
  reason: string;
  startAt: Date;
  endAt: Date | null;
  returnedAt: Date | null;
  /** Om dette er en helsebegrensning. False når mottakeren ikke får vite det. */
  erHelse: boolean;
  /** Null med mindre mottakeren har detalj-samtykke. */
  description: string | null;
  /** True når vi har holdt noe tilbake — så UI kan si fra ærlig. */
  skjult: boolean;
};

/** Er dette en helse-relatert permisjon? Flagget ELLER grunnen avgjør. */
export function erHelseLeave(leave: { reason: string; isInjury: boolean }): boolean {
  return leave.isInjury || HELSE_GRUNNER.has(leave.reason);
}

/**
 * Filtrer én Leave ned til det mottakeren faktisk har lov til å se.
 *
 * Fraværsperioden (datoene) blir alltid stående — det er den som forklarer
 * hvorfor spilleren ikke har trent, og den er ikke helsedata.
 */
export function maskerLeave(leave: RaaLeave, nivaa: InnsynsNivaa): SettLeave {
  const erHelse = erHelseLeave(leave);

  // Ikke-helse-fravær (reise, jobb, studier) er ikke art. 9 — det vises alltid.
  if (!erHelse) {
    return {
      reason: leave.reason,
      startAt: leave.startAt,
      endAt: leave.endAt,
      returnedAt: leave.returnedAt,
      erHelse: false,
      description: leave.description ?? null,
      skjult: false,
    };
  }

  if (nivaa === "DETALJ") {
    return {
      reason: leave.reason,
      startAt: leave.startAt,
      endAt: leave.endAt,
      returnedAt: leave.returnedAt,
      erHelse: true,
      description: leave.description ?? null,
      skjult: false,
    };
  }

  if (nivaa === "STATUS") {
    // Coachen får vite AT treningen må tilpasses, ikke hva som feiler.
    // SKADE og SYKDOM slås sammen: skillet i seg selv antyder en diagnose.
    return {
      reason: "HELSEBEGRENSNING",
      startAt: leave.startAt,
      endAt: leave.endAt,
      returnedAt: leave.returnedAt,
      erHelse: true,
      description: null,
      skjult: true,
    };
  }

  // INGEN: perioden står, helseopplysningen forsvinner helt.
  return {
    reason: "FRAVAER",
    startAt: leave.startAt,
    endAt: leave.endAt,
    returnedAt: leave.returnedAt,
    erHelse: false,
    description: null,
    skjult: true,
  };
}

/** Som `maskerLeave`, for en liste. */
export function maskerLeaves(leaves: RaaLeave[], nivaa: InnsynsNivaa): SettLeave[] {
  return leaves.map((l) => maskerLeave(l, nivaa));
}

/** Utled innsynsnivået fra samtykkestatusen. Ett sted, så det ikke spriker. */
export function innsynsNivaaFra(samtykke: {
  coachInnsyn: boolean;
  coachDetalj: boolean;
}): InnsynsNivaa {
  if (samtykke.coachDetalj) return "DETALJ";
  if (samtykke.coachInnsyn) return "STATUS";
  return "INGEN";
}
