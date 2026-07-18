// Rene funksjoner (ingen server-only imports) — kjører trygt i klient-komponenter.
// Oversetter FastTid[]/Periode[] til props for golfdata MaanedKalender/TidsGrid
// (+ YearPlanGantt for årsvisningen — golfdata mangler AK-periode-gantt, gap meldt).

// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): golfdata mangler AK-periode-årsgantt (gap meldt) — YearPlanGantt beholdes til DS får en
import type { YearPhase } from "@/components/athletic/calendars/year-plan-gantt";
import type { MaanedDag, MaanedOkt } from "@/components/athletic/golfdata";
import type { FastTid, GruppeKalenderData, Periode, Samling, SkoleHendelse, SkoleHendelseKategori, Turnering } from "./types";

export type Tone = "primary" | "accent" | "moss" | "gold" | "muted";

function tilTone(tone: string | null, fallback: Tone): Tone {
  const gyldige: Tone[] = ["primary", "accent", "moss", "gold", "muted"];
  return gyldige.includes(tone as Tone) ? (tone as Tone) : fallback;
}

const SKOLE_TONE: Record<SkoleHendelseKategori, Tone> = {
  TIME: "muted",
  PROVE: "gold",
  HELDAGSPROVE: "gold",
  EKSAMEN: "accent",
  FERIE: "muted",
  SKOLETUR: "primary",
  ANNET: "muted",
};

const SKOLE_LABEL: Record<SkoleHendelseKategori, string> = {
  TIME: "Time",
  PROVE: "Prøve",
  HELDAGSPROVE: "Heldagsprøve",
  EKSAMEN: "Eksamen",
  FERIE: "Ferie",
  SKOLETUR: "Skoletur",
  ANNET: "Annet",
};

/** Én fast treningstid plassert i TidsGrid (ukevisningen). */
export type UkeBlokk = {
  id: string;
  /** 0=man .. 6=søn. */
  dag: number;
  /** Desimaltimer, f.eks. 8 og 10. */
  fra: number;
  til: number;
  tittel: string;
  tid: string;
};

function erSammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Dager en turnering strekker seg over (endDate valgfri), som lokale yyyy-mm-dd-strenger. */
function dagerITurnering(t: Turnering): string[] {
  return dagerISamling(t.startDate, t.endDate ?? t.startDate);
}

/** Perioder som overlapper et gitt kalenderår, klippet til år-grensene (for YearPlanGantt). */
export function byggArsfaser(perioder: Periode[], year: number): YearPhase[] {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  const faser: YearPhase[] = [];
  for (const p of perioder) {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    if (end <= yearStart || start >= yearEnd) continue;
    const klippetStart = start < yearStart ? yearStart : start;
    // endDate er eksklusiv — trekk fra én dag før vi leser måned, ellers
    // "peker" en periode som slutter 1. jan neste år feilaktig inn i januar.
    const klippetSlutt = end > yearEnd ? yearEnd : end;
    const sisteDagIPerioden = new Date(klippetSlutt.getTime() - 24 * 60 * 60 * 1000);
    faser.push({
      key: p.id,
      label: p.name,
      // YearPlanGantt er 1-indeksert (1=januar) — se startMonth-1 i komponenten.
      startMonth: klippetStart.getUTCMonth() + 1,
      endMonth: sisteDagIPerioden.getUTCMonth() + 1,
      tone: tilTone(p.tone, "muted"),
    });
  }
  return faser;
}

/** Dager en samling/heldagssamling strekker seg over, som lokale yyyy-mm-dd-strenger. */
function dagerISamling(startAt: string, endAt: string): string[] {
  const dager: string[] = [];
  const start = new Date(startAt);
  const sluttDag = new Date(endAt);
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const slutt = new Date(Date.UTC(sluttDag.getUTCFullYear(), sluttDag.getUTCMonth(), sluttDag.getUTCDate()));
  while (cursor <= slutt) {
    dager.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dager;
}

/** Samlinger som overlapper et gitt kalenderår, som ekstra faser i YearPlanGantt (samme bånd-mekanikk som periodene). */
export function byggArsSamlinger(samlinger: Samling[], year: number): YearPhase[] {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
  const faser: YearPhase[] = [];
  for (const s of samlinger) {
    const start = new Date(s.startAt);
    const end = new Date(s.endAt);
    if (end < yearStart || start >= yearEnd) continue;
    const klippetStart = start < yearStart ? yearStart : start;
    const klippetSlutt = end > yearEnd ? yearEnd : end;
    faser.push({
      key: `samling-${s.id}`,
      label: s.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling",
      startMonth: klippetStart.getUTCMonth() + 1,
      endMonth: klippetSlutt.getUTCMonth() + 1,
      tone: s.kind === "HELDAGSSAMLING" ? "primary" : "accent",
    });
  }
  return faser;
}

/** Alle dager i en måned med treningsøkter + samlinger/skole-hendelser som piller (MaanedKalender, piller-modus). */
export function byggManedsdager(
  faste: FastTid[],
  year: number,
  month: number, // 1-indeksert (1=januar)
  samlinger: Samling[] = [],
  skoleHendelser: SkoleHendelse[] = [],
  classYear: string | null = null,
  turneringer: Turnering[] = [],
): MaanedDag[] {
  const maanedIndex = month - 1; // 0-indeksert for Date.UTC
  const antallDager = new Date(Date.UTC(year, maanedIndex + 1, 0)).getUTCDate();
  const idag = new Date();

  const dager: MaanedDag[] = [];
  for (let dag = 1; dag <= antallDager; dag++) {
    const dato = new Date(Date.UTC(year, maanedIndex, dag));
    const iso = dato.toISOString().slice(0, 10);
    const ukedag = (dato.getUTCDay() + 6) % 7; // søn(0)->6, man(1)->0
    const treningIDag = faste.filter((f) => f.weekday === ukedag);

    const okter: MaanedOkt[] = treningIDag.map((f) => ({
      id: f.id,
      tittel: f.title,
      tid: f.startTime,
    }));
    for (const s of samlinger) {
      if (dagerISamling(s.startAt, s.endAt).includes(iso)) {
        okter.push({ id: s.id, tittel: `${s.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling"}: ${s.title}` });
      }
    }
    for (const h of skoleHendelser) {
      if (h.date.slice(0, 10) === iso && (h.classYear === null || h.classYear === classYear)) {
        okter.push({ id: h.id, tittel: `${SKOLE_LABEL[h.category]}: ${h.title}` });
      }
    }
    for (const t of turneringer) {
      if (dagerITurnering(t).includes(iso)) {
        // Navnet starter alt med serien (Olyo…/Østlandstour…/Srixon…/Garmin…), så ingen prefiks.
        okter.push({ id: `turn-${t.id}`, tittel: t.navn });
      }
    }

    dager.push({ date: dag, today: erSammeDag(dato, idag), okter });
  }
  return dager;
}

/** Faste treningstider som TidsGrid-blokker — samme rader hver uke. */
export function byggUkeblokker(faste: FastTid[]): UkeBlokk[] {
  return faste.map((f) => ({
    id: f.id,
    dag: f.weekday,
    fra: Number(f.startTime.split(":")[0]) + Number(f.startTime.split(":")[1]) / 60,
    til: Number(f.endTime.split(":")[0]) + Number(f.endTime.split(":")[1]) / 60,
    tittel: f.title,
    tid: `${f.startTime}–${f.endTime}`,
  }));
}

/** Faste treningstider for én enkelt dag (0=man..6=søn) — for dagsvisningen. */
export function byggDagblokker(faste: FastTid[], dag: number): UkeBlokk[] {
  return byggUkeblokker(faste).filter((b) => b.dag === dag);
}

export type AllDagHendelse = {
  id: string;
  dato: string; // yyyy-mm-dd
  tittel: string;
  tone: Tone;
};

/** Samlinger + skole-hendelser for et datovindu, som helcelle-hendelser (over TidsGrid). */
export function byggAllDagHendelser(
  samlinger: Samling[],
  skoleHendelser: SkoleHendelse[],
  fraIso: string,
  tilIso: string, // inkludert
  classYear: string | null,
  turneringer: Turnering[] = [],
): AllDagHendelse[] {
  const hendelser: AllDagHendelse[] = [];
  for (const s of samlinger) {
    for (const iso of dagerISamling(s.startAt, s.endAt)) {
      if (iso < fraIso || iso > tilIso) continue;
      hendelser.push({
        id: `${s.id}-${iso}`,
        dato: iso,
        tittel: s.title,
        tone: s.kind === "HELDAGSSAMLING" ? "primary" : "accent",
      });
    }
  }
  for (const h of skoleHendelser) {
    const iso = h.date.slice(0, 10);
    if (iso < fraIso || iso > tilIso) continue;
    if (h.classYear !== null && h.classYear !== classYear) continue;
    if (h.category === "TIME") continue; // vanlige skoletimer vises kun i detaljpanelet, ikke som helcelle-markør
    hendelser.push({ id: h.id, dato: iso, tittel: `${SKOLE_LABEL[h.category]}: ${h.title}`, tone: SKOLE_TONE[h.category] });
  }
  for (const t of turneringer) {
    for (const iso of dagerITurnering(t)) {
      if (iso < fraIso || iso > tilIso) continue;
      hendelser.push({ id: `turn-${t.id}-${iso}`, dato: iso, tittel: t.navn, tone: tilTone(t.tone, "muted") });
    }
  }
  return hendelser;
}

export type Dagsdetaljer = {
  dato: string; // yyyy-mm-dd
  periode: Periode | null;
  samlinger: Samling[];
  skoleHendelser: (SkoleHendelse & { kategoriLabel: string; tone: Tone })[];
  turneringer: Turnering[];
};

/** Full detalj for én valgt dag — periode+kompetansemål, samlinger, turneringer og hele skole-listen (inkl. TIME). */
export function finnDagsdetaljer(
  data: Pick<GruppeKalenderData, "perioder" | "samlinger" | "skoleHendelser" | "turneringer">,
  dato: string, // yyyy-mm-dd
  classYear: string | null,
): Dagsdetaljer {
  const periode =
    data.perioder.find((p) => dato >= p.startDate.slice(0, 10) && dato < p.endDate.slice(0, 10)) ?? null;
  const samlinger = data.samlinger.filter((s) => dagerISamling(s.startAt, s.endAt).includes(dato));
  const skoleHendelser = data.skoleHendelser
    .filter((h) => h.date.slice(0, 10) === dato && (h.classYear === null || h.classYear === classYear))
    .map((h) => ({ ...h, kategoriLabel: SKOLE_LABEL[h.category], tone: SKOLE_TONE[h.category] }));
  const turneringer = data.turneringer.filter((t) => dagerITurnering(t).includes(dato));
  return { dato, periode, samlinger, skoleHendelser, turneringer };
}
