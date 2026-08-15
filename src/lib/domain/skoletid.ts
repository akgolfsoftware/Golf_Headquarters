/**
 * Skoletid — semesternøkkel og bekreftelsesstatus (D6).
 * Fasit: designsystem/paper/fase2/forelder/forelder-barn.html
 *
 * Kjerneregelen fra fasiten: ubekreftet semester vises som «skoletid mangler»
 * hos coachen, og vi bruker ALDRI forrige semesters tider. En bekreftelse
 * gjelder ett semester og arves ikke videre.
 *
 * Bekreftet timeplan er bakteppe det varsles mot — aldri en sperre. Det følger
 * invariant 1: ingenting i appen blokkerer trening.
 */

export type Semester = {
  /** Nøkkelen som lagres: «2026H» eller «2027V». */
  kode: string;
  /** «høsten 2026» — til visning i overskrift og brødtekst. */
  visning: string;
  /** Siste dag semesteret gjelder, til «gjelder til …». */
  slutt: Date;
};

/**
 * Semesteret en dato hører til. Høst løper 1. juli–31. desember, vår
 * 1. januar–30. juni. Grensen er lagt i skoleferien med vilje: en bekreftelse
 * gitt i juni skal ikke plutselig gjelde høstens nye timeplan.
 */
export function semesterFor(d: Date): Semester {
  const ar = d.getFullYear();
  const host = d.getMonth() >= 6; // juli = 6

  return host
    ? {
        kode: `${ar}H`,
        visning: `høsten ${ar}`,
        slutt: new Date(ar, 11, 20),
      }
    : {
        kode: `${ar}V`,
        visning: `våren ${ar}`,
        slutt: new Date(ar, 5, 20),
      };
}

export type SkoletidStatus =
  | { bekreftet: false; tekst: string }
  | { bekreftet: true; tekst: string; bekreftetAt: Date };

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "numeric",
  timeZone: "Europe/Oslo",
});

/**
 * Statuslinja fasiten viser. Ubekreftet sier hvilket semester som mangler —
 * ikke bare «ikke bekreftet» — så det er tydelig at fjorårets svar ikke teller.
 */
export function skoletidStatus(
  semester: Semester,
  bekreftetAt: Date | null,
  now = new Date(),
): SkoletidStatus {
  if (!bekreftetAt) {
    return { bekreftet: false, tekst: `ikke bekreftet for ${semester.visning}` };
  }

  const iDag =
    bekreftetAt.toDateString() === now.toDateString()
      ? "i dag"
      : DATO_FMT.format(bekreftetAt);

  return {
    bekreftet: true,
    bekreftetAt,
    tekst: `bekreftet ${iDag} · gjelder til ${DATO_FMT.format(semester.slutt)}`,
  };
}
