// Dagen-artefaktet (/meg?artefakt=dagen) — ren logikk, ingen Prisma/nettverk
// her (se repository.ts for selve Google-kallet). Slår sammen ekte
// kalenderhendelser med et snapshot av Sak-køen til én sortert tidslinje +
// utledede ledig-luker.
//
// Reisetid mellom avtaler (fasitens "reise"-segmenter) er BEVISST utelatt —
// ingen geokoding/rutetjeneste finnes i repoet. Kalendervakt-markører er
// utelatt av samme grunn som i KalendervaktArtefakt: Avvik er alltid tom
// liste inntil en kalendervakt-agent finnes.
import type { Sak } from "@/generated/prisma/client";
import { SakStatus } from "@/generated/prisma/enums";
import type { KalenderHendelse } from "@/lib/meg/connectors/google";
import type { DagenElement } from "@/lib/jarvis/types";

const MIN_LEDIG_LUKE_MS = 15 * 60 * 1000;

/**
 * Eksakt UTC-tidspunkt for et gitt klokkeslett i Oslo-tid, DST-korrekt.
 * Standardteknikk uten tidssone-bibliotek: gjett at klokkeslettet er UTC,
 * se hvilket Oslo-klokkeslett den UTC-gjetningen faktisk viser, og korriger
 * med avviket. Robust nok for et fast klokkeslett samme dag (aldri en DST-
 * overgang mellom 10:00 og 19:00 i Norge).
 */
export function osloInstant(aar: number, maned: number, dag: number, time: number, minutt: number): Date {
  const naiv = new Date(Date.UTC(aar, maned - 1, dag, time, minutt, 0));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const deler = Object.fromEntries(fmt.formatToParts(naiv).map((p) => [p.type, p.value])) as Record<string, string>;
  const somOmUtc = Date.UTC(
    Number(deler.year),
    Number(deler.month) - 1,
    Number(deler.day),
    Number(deler.hour),
    Number(deler.minute),
    Number(deler.second),
  );
  const avvikMs = somOmUtc - naiv.getTime();
  return new Date(naiv.getTime() - avvikMs);
}

export const OSLO_YMD_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Oslo-dagens grenser som absolutte UTC-tidspunkt — IKKE naiv lokal tid (se uke-helpers.ts sin advarsel om nøyaktig dette). */
export function osloDagGrenser(referanse: Date): { start: Date; slutt: Date } {
  const [aar, maned, dag] = OSLO_YMD_FMT.format(referanse).split("-").map(Number);
  const start = osloInstant(aar, maned, dag, 0, 0);
  const naisteDag = new Date(Date.UTC(aar, maned - 1, dag + 1));
  const [aar2, maned2, dag2] = OSLO_YMD_FMT.format(naisteDag).split("-").map(Number);
  const slutt = osloInstant(aar2, maned2, dag2, 0, 0);
  return { start, slutt };
}

/** Faste rytmepunkt fra fasiten — 11:30 og 16:00 Oslo-tid samme dag som `dagStart`. */
export function innboksblokkTidspunkt(dagStart: Date): { formiddag: Date; ettermiddag: Date } {
  const [aar, maned, dag] = OSLO_YMD_FMT.format(dagStart).split("-").map(Number);
  return {
    formiddag: osloInstant(aar, maned, dag, 11, 30),
    ettermiddag: osloInstant(aar, maned, dag, 16, 0),
  };
}

export function byggAvtaleElementer(hendelser: KalenderHendelse[], na: Date): DagenElement[] {
  return hendelser
    .filter((h) => !h.heldag)
    .map((h) => {
      const sluttDato = h.slutt ? new Date(h.slutt) : null;
      return {
        id: `avtale-${h.id}`,
        type: "avtale" as const,
        start: h.start,
        slutt: h.slutt,
        tittel: h.tittel,
        undertekst: h.sted,
        ferdig: (sluttDato ?? new Date(h.start)).getTime() < na.getTime(),
      };
    });
}

/**
 * To faste innboksblokker med et ærlig snapshot av Sak-køen (ventende
 * antall + over-frist-antall RETT NÅ). Viser bevisst ikke "rekker fristene
 * X og Y" som fasiten gjør — det ville krevd en prognose for hvor mange
 * saker som faktisk er ubehandlet på blokkens fremtidige tidspunkt, noe
 * appen ikke kan garantere.
 */
export function byggInnboksblokker(saker: Sak[], dagStart: Date, na: Date): DagenElement[] {
  const { formiddag, ettermiddag } = innboksblokkTidspunkt(dagStart);
  const ventende = saker.filter((s) => s.status === SakStatus.VENTER);
  const overFrist = ventende.filter((s) => s.frist != null && s.frist.getTime() < na.getTime());
  const undertekst =
    ventende.length === 0
      ? "Ingen saker venter"
      : `${ventende.length} sak${ventende.length === 1 ? "" : "er"} venter${overFrist.length > 0 ? ` · ${overFrist.length} over frist` : ""} · status nå`;

  return [
    { tid: formiddag, tittel: "Innboksblokk" },
    { tid: ettermiddag, tittel: "Innboksblokk — kveldsrunde" },
  ].map(({ tid, tittel }) => ({
    id: `innboksblokk-${tid.toISOString()}`,
    type: "innboksblokk" as const,
    start: tid.toISOString(),
    slutt: null,
    tittel,
    undertekst,
    ferdig: tid.getTime() < na.getTime(),
    lenke: "saker" as const,
  }));
}

/** Ledig-luker utledet fra gapene mellom opptatte elementer (kalender + innboksblokker), innenfor dagens grenser. */
export function byggLedigElementer(opptatt: DagenElement[], grenser: { start: Date; slutt: Date }, na: Date): DagenElement[] {
  const sortert = [...opptatt].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const luker: DagenElement[] = [];

  function leggTilLuke(fraMs: number, tilMs: number) {
    if (tilMs - fraMs < MIN_LEDIG_LUKE_MS) return;
    const fra = new Date(fraMs);
    const til = new Date(tilMs);
    const min = Math.round((tilMs - fraMs) / 60000);
    const varighet = min >= 60 ? `${Math.floor(min / 60)}t ${min % 60 === 0 ? "" : `${min % 60}m`}`.trim() : `${min} min`;
    luker.push({
      id: `ledig-${fra.toISOString()}`,
      type: "ledig",
      start: fra.toISOString(),
      slutt: til.toISOString(),
      tittel: `${varighet} ledig`,
      undertekst: null,
      ferdig: tilMs < na.getTime(),
    });
  }

  let markorMs = grenser.start.getTime();
  for (const el of sortert) {
    const elStart = new Date(el.start).getTime();
    const elSlutt = el.slutt ? new Date(el.slutt).getTime() : elStart;
    if (elStart > markorMs) leggTilLuke(markorMs, elStart);
    markorMs = Math.max(markorMs, elSlutt);
  }
  // Ingen luke lagt til etter siste element/før dagens slutt — dagen fortsetter
  // ofte inn i kveld/natt uten at "ledig til midnatt" er en meningsfull beskjed.

  return luker;
}

export function summerLedigMinutterIgjen(elementer: DagenElement[], na: Date): number {
  return elementer
    .filter((e) => e.type === "ledig" && !e.ferdig)
    .reduce((sum, e) => {
      const start = Math.max(new Date(e.start).getTime(), na.getTime());
      const slutt = e.slutt ? new Date(e.slutt).getTime() : start;
      return sum + Math.max(0, Math.round((slutt - start) / 60000));
    }, 0);
}
