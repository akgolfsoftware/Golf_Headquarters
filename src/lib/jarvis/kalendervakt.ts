// Kalendervakten (/meg?artefakt=vakt) — ren, testbar avviksdeteksjon over
// ekte kalenderhendelser, ingen Prisma/nettverk her (se repository.ts sin
// hentAvvik() for selve Google-kallet). Samme mønster som dagen.ts.
//
// To av fasitens (jarvis/meg-kalendervakt.html) tre avvikstyper detekteres:
//   KONFLIKT  — to ikke-heldagshendelser overlapper i tid (dobbeltbooking).
//               Forslaget til fiks er neste ledige luke ETTER konflikten,
//               utledet av hendelseslisten selv — ingen oppdiktet tid.
//   REISETID  — rygg-mot-rygg (gap under 15 min) der BEGGE hendelser har
//               sted satt og stedene er ulike. Ingen geokoding/rutetjeneste
//               finnes i repoet (se dagen.ts), så avviket oppgir ALDRI et
//               minuttall for reisen — kun at det ikke er satt av tid.
//   VARSEL    — BEVISST utelatt: KalenderHendelse (meg/connectors/google.ts)
//               bærer ikke reminder-data, så «mangler påminnelse» kan ikke
//               detekteres ærlig. Legges til hvis connectoren leser reminders.
//
// Avvik uten ærlig forslag til fiks får etter === "" — KalendervaktArtefakt
// viser da ingen diff-blokk i stedet for en oppdiktet «etter»-side.
import type { KalenderHendelse } from "@/lib/meg/connectors/google";
import type { Avvik } from "@/lib/jarvis/types";

const REISETID_MAKS_GAP_MS = 15 * 60 * 1000;

// nb-NO ignorerer "2-digit" for dag/måned i denne kombinasjonen («17.8.»),
// så datodelen bygges fra en ISO-formatterer i stedet (samme som dagen.ts).
const OSLO_YMD_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** «17.08» — Oslo-dagens dato uten år. */
function osloDato(dato: Date): string {
  const [, maned, dag] = OSLO_YMD_FMT.format(dato).split("-");
  return `${dag}.${maned}`;
}

const OSLO_KLOKKE_FMT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
});

interface Tidfestet {
  hendelse: KalenderHendelse;
  startMs: number;
  sluttMs: number;
}

/** «17.08 13:00–14:00» — Oslo-tid; krysser tidsrommet en dato, tas datoen med på begge sider. */
export function formatTidsrom(startMs: number, sluttMs: number): string {
  const start = new Date(startMs);
  const slutt = new Date(sluttMs);
  const startDato = osloDato(start);
  const sluttDato = osloDato(slutt);
  if (startDato !== sluttDato) {
    return `${startDato} ${OSLO_KLOKKE_FMT.format(start)} – ${sluttDato} ${OSLO_KLOKKE_FMT.format(slutt)}`;
  }
  return `${startDato} ${OSLO_KLOKKE_FMT.format(start)}–${OSLO_KLOKKE_FMT.format(slutt)}`;
}

function tilTidfestet(hendelser: KalenderHendelse[]): Tidfestet[] {
  return hendelser
    .filter((h) => !h.heldag)
    .map((h) => {
      const startMs = new Date(h.start).getTime();
      const sluttMs = h.slutt ? new Date(h.slutt).getTime() : startMs;
      return { hendelse: h, startMs, sluttMs };
    })
    .filter((t) => !Number.isNaN(t.startMs) && !Number.isNaN(t.sluttMs))
    .sort((a, b) => a.startMs - b.startMs);
}

/**
 * Neste tidspunkt fra og med `fraMs` der en luke på `varighetMs` ikke
 * overlapper noen av de opptatte hendelsene. Løkke til stabilt: kandidaten
 * skyves til slutten av hver hendelse den kolliderer med, og øker strengt
 * for hver runde (terminerer ved siste hendelses slutt).
 */
function nesteLedigeStart(opptatt: Tidfestet[], fraMs: number, varighetMs: number): number {
  let kandidat = fraMs;
  let endret = true;
  while (endret) {
    endret = false;
    for (const e of opptatt) {
      if (e.startMs < kandidat + varighetMs && kandidat < e.sluttMs) {
        kandidat = e.sluttMs;
        endret = true;
      }
    }
  }
  return kandidat;
}

function finnKonflikter(tidfestede: Tidfestet[], na: Date): Avvik[] {
  const avvik: Avvik[] = [];
  for (let i = 0; i < tidfestede.length; i++) {
    const a = tidfestede[i];
    for (let j = i + 1; j < tidfestede.length; j++) {
      const b = tidfestede[j];
      // Sortert på start: senere hendelser kan ikke lenger overlappe a.
      if (b.startMs >= a.sluttMs) break;
      if (!(a.startMs < b.sluttMs && b.startMs < a.sluttMs)) continue;
      // Helt passerte konflikter er ikke lenger noe å fikse.
      if (Math.max(a.sluttMs, b.sluttMs) <= na.getTime()) continue;

      const varighetB = b.sluttMs - b.startMs;
      const tidsromA = formatTidsrom(a.startMs, a.sluttMs);
      const tidsromB = formatTidsrom(b.startMs, b.sluttMs);
      let etter = "";
      let forslagSetning = "";
      if (varighetB > 0) {
        const nyStart = nesteLedigeStart(tidfestede, Math.max(a.sluttMs, b.sluttMs), varighetB);
        const nyttTidsrom = formatTidsrom(nyStart, nyStart + varighetB);
        etter = `${tidsromA} · ${nyttTidsrom}`;
        forslagSetning = ` Neste ledige luke for ${b.hendelse.tittel}: ${nyttTidsrom}.`;
      }
      avvik.push({
        id: `konflikt-${a.hendelse.id}-${b.hendelse.id}`,
        type: "KONFLIKT",
        tittel: `${b.hendelse.tittel} overlapper ${a.hendelse.tittel}`,
        forklaring: `${b.hendelse.tittel} (${tidsromB}) og ${a.hendelse.tittel} (${tidsromA}) går samtidig.${forslagSetning}`,
        for: `${tidsromA} · ${tidsromB}`,
        etter,
        opprettet: na.toISOString(),
        godkjent: null,
      });
    }
  }
  return avvik;
}

function finnReisetidsAvvik(tidfestede: Tidfestet[], na: Date): Avvik[] {
  const avvik: Avvik[] = [];
  for (let i = 0; i < tidfestede.length; i++) {
    const a = tidfestede[i];
    const stedA = a.hendelse.sted?.trim() ?? "";
    if (!stedA) continue;
    for (let j = i + 1; j < tidfestede.length; j++) {
      const b = tidfestede[j];
      const gapMs = b.startMs - a.sluttMs;
      // Sortert på start: gapet vokser med j — ingen senere b er rygg-mot-rygg med a.
      if (gapMs >= REISETID_MAKS_GAP_MS) break;
      // Overlapp er KONFLIKT-avvikets jobb, ikke reisetidens.
      if (gapMs < 0) continue;
      const stedB = b.hendelse.sted?.trim() ?? "";
      if (!stedB || stedA.toLowerCase() === stedB.toLowerCase()) continue;
      // Har den andre avtalen allerede startet, er overgangen passert.
      if (b.startMs <= na.getTime()) continue;

      avvik.push({
        id: `reisetid-${a.hendelse.id}-${b.hendelse.id}`,
        type: "REISETID",
        tittel: `Ingen reisetid mellom ${stedA} og ${stedB}`,
        forklaring: `${a.hendelse.tittel} slutter ${OSLO_KLOKKE_FMT.format(new Date(a.sluttMs))} på ${stedA} — ${b.hendelse.tittel} starter ${OSLO_KLOKKE_FMT.format(new Date(b.startMs))} på ${stedB}. Ingen rutetjeneste er koblet til, så appen vet ikke hvor lang reisen er.`,
        for: `${formatTidsrom(a.startMs, a.sluttMs)} · ${formatTidsrom(b.startMs, b.sluttMs)}`,
        etter: "",
        opprettet: na.toISOString(),
        godkjent: null,
      });
    }
  }
  return avvik;
}

/** Kalendervaktens detektor — KONFLIKT + REISETID over ikke-heldagshendelser (se hodekommentaren). */
export function finnAvvik(hendelser: KalenderHendelse[], na: Date): Avvik[] {
  const tidfestede = tilTidfestet(hendelser);
  return [...finnKonflikter(tidfestede, na), ...finnReisetidsAvvik(tidfestede, na)];
}
