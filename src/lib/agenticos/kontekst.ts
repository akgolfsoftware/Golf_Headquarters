// FASIT-laget i AgenticOS: henter riktig del av masterbrain-fasiten for en
// klassifisert oppgave.
//
// Dette er OPPSLAG, ikke søk. `knowledge/concepts` og `knowledge/entities` er
// strukturert JSON med id-er, og skal leses direkte — aldri via embeddings.
// Det gjør de viktigste svarene deterministiske, gratis og fri for
// hallusinasjon. Semantisk søk hører hjemme i `rag-corpus`, ikke her.
//
// Fasiten er delvis engelsk (MORAD-kilden). Det er med vilje: dette er kontekst
// til modellen, ikke UI-tekst. Invarianten om norsk bokmål gjelder svaret
// brukeren ser, ikke kildematerialet.
//
// Trygg for klient — ingen server-only imports.

import { harDrillBank, masterbrain, sgTilMoradKandidater } from "@/lib/masterbrain";
import type { KontekstBlokk } from "./prompt-bygger";
import type { Domene, Klassifisering } from "./typer";

// ── Minimale strukturelle typer ────────────────────────────────────────────
// Vi leser bare feltene vi faktisk bruker, og tåler at resten mangler. Ingen
// `as unknown as T`: fasiten er versjonert og synket, men koden skal likevel
// ikke kræsje hvis et felt forsvinner i en ny versjon.

type CanonKategori = {
  name?: string;
  handicap_equivalent?: string;
  description?: string;
  ltad_phase?: string;
  pyramid_default?: Record<string, number>;
  coaching_notes?: string;
};

type CanonPeriode = {
  name?: string;
  description?: string;
  typical_timing?: string;
  focus?: string[];
  pyramid_adjustment?: string;
};

type AppBand = {
  label?: string;
  expected_strokes?: number;
  confidence?: number;
  ui_display?: string;
};

type MoradFeil = {
  name?: string;
  description?: string;
  sg_category?: string;
  detection?: { position?: string };
  correction?: string;
};

type MoradPosisjon = {
  name?: string;
  description?: string;
  phase?: string;
};

function somPost<T>(kilde: unknown, noekkel: string): T | null {
  if (typeof kilde !== "object" || kilde === null) return null;
  const verdi = (kilde as Record<string, unknown>)[noekkel];
  if (typeof verdi !== "object" || verdi === null) return null;
  return verdi as T;
}

function poster<T>(kilde: unknown): Array<[string, T]> {
  if (typeof kilde !== "object" || kilde === null) return [];
  return Object.entries(kilde as Record<string, T>);
}

// ── Faste påminnelser ──────────────────────────────────────────────────────

/**
 * Periodenavn i CANON er IKKE de samme strengene som Prisma-enumene. Modellen
 * skal aldri skrive en CANON-streng rått som en periodeverdi.
 * Kilde: `mikroperiodisering-og-tidsdimensjon.json` → periodenavn_oversettelsestabell.
 */
const PERIODE_ADVARSEL =
  "Periodenavn: CANON bruker GRUNN/SPES/TURN, databasen bruker GRUNN/SPESIAL/TURNERING. " +
  "Skriv aldri CANON-strengen rått som en periodeverdi.";

function drillStatus(): string {
  return harDrillBank()
    ? ""
    : "Drill-banken er tom og under oppbygging. Beskriv hva som bør trenes " +
      "(pyramideområde, P-posisjon), men foreskriv ingen navngitt øvelse.";
}

// ── Seksjoner per domene ───────────────────────────────────────────────────

function sgSeksjon(sgOmrade?: string): string[] {
  const ut: string[] = [];

  const kategorier = poster<{ name_no?: string; description?: string }>(
    somPost(masterbrain.sgPrinciples, "categories"),
  );
  if (kategorier.length > 0) {
    ut.push(
      "SG-kategorier: " +
        kategorier
          .map(([id, k]) => `${id} (${k.name_no ?? id})`)
          .join(", "),
    );
  }

  const band = masterbrain.sgPrinciples as { app_bands?: AppBand[] };
  if (Array.isArray(band.app_bands) && band.app_bands.length > 0) {
    ut.push(
      "APP-bånd (forventet antall slag, fairway):\n" +
        band.app_bands
          .map((b) => {
            // Fasiten avgjør selv hva som er et retningssignal (`ui_display`).
            // Vi utleder ikke terskelen på nytt — 200+-båndet har confidence
            // nøyaktig 0.70 og ville falt utenfor en «< 0.7»-regel.
            const lav =
              b.ui_display === "retningssignal"
                ? " — lav sikkerhet, omtal kun som retningssignal"
                : "";
            return `- ${b.label}: ${b.expected_strokes}${lav}`;
          })
          .join("\n"),
    );
  }

  // Kandidatfeil for det aktuelle området. Alltid som hypotese.
  const omrade = sgOmrade?.toLowerCase();
  const kandidater = omrade ? (sgTilMoradKandidater[omrade] ?? []) : [];
  if (omrade && kandidater.length > 0) {
    ut.push(
      `Kandidatfeil for SG ${omrade.toUpperCase()}: ${kandidater.join(", ")}.\n` +
        "Dette er likestilte HYPOTESER, ikke en rangering og ikke en diagnose. " +
        "Må bekreftes med videoanalyse, kontroll av sikte og gjennomgang av køllevalg " +
        "før noe anbefales.",
    );
  } else if (omrade === "putt") {
    ut.push(
      "SG PUTT har ingen MORAD-kandidater. Det er korrekt: MORAD er et " +
        "posisjonssystem for fullsving og dekker ikke putting. Putting mangler " +
        "foreløpig egen kunnskapskilde — si det framfor å gjette.",
    );
  }

  return ut;
}

function teknikkSeksjon(faultId?: string): string[] {
  const ut: string[] = [];

  const feil = poster<MoradFeil>(somPost(masterbrain.faults, "entities"));
  const valgt = faultId ? feil.filter(([id]) => id === faultId) : feil;
  if (valgt.length > 0) {
    ut.push(
      "MORAD-svingfeil (fasit — bruk kun disse id-ene):\n" +
        valgt
          .map(([id, f]) => {
            const pos = f.detection?.position ? ` @ ${f.detection.position}` : "";
            return `- ${id}${pos}: ${f.description ?? f.name ?? ""}${
              f.correction ? ` | Korreksjon: ${f.correction}` : ""
            }`;
          })
          .join("\n"),
    );
  }

  const posisjoner = poster<MoradPosisjon>(somPost(masterbrain.positions, "entities"));
  if (posisjoner.length > 0) {
    ut.push(
      "MORAD P-posisjoner:\n" +
        posisjoner
          .map(([id, p]) => `- ${id} ${p.name ?? ""}: ${p.description ?? ""}`)
          .join("\n"),
    );
  }

  return ut;
}

function planSeksjon(akKategori?: string): string[] {
  const ut: string[] = [];

  const kategorier = somPost<Record<string, CanonKategori>>(
    masterbrain.canonMethodology,
    "categories",
  );
  const kat = akKategori ? somPost<CanonKategori>(kategorier, akKategori) : null;
  if (kat) {
    const fordeling = kat.pyramid_default
      ? Object.entries(kat.pyramid_default)
          .map(([k, v]) => `${k} ${v}%`)
          .join(", ")
      : "ikke definert";
    ut.push(
      `CANON-kategori ${akKategori} (${kat.name ?? ""}, hcp ${kat.handicap_equivalent ?? "?"}):\n` +
        `${kat.description ?? ""}\n` +
        `Standard pyramidefordeling: ${fordeling}.` +
        (kat.coaching_notes ? `\nCoaching: ${kat.coaching_notes}` : ""),
    );
  }

  const perioder = poster<CanonPeriode>(somPost(masterbrain.canonMethodology, "periods"));
  if (perioder.length > 0) {
    ut.push(
      "CANON-perioder:\n" +
        perioder
          .map(
            ([id, p]) =>
              `- ${id} (${p.name ?? ""}, ${p.typical_timing ?? "?"}): ${
                p.pyramid_adjustment ?? p.description ?? ""
              }`,
          )
          .join("\n"),
    );
    ut.push(PERIODE_ADVARSEL);
  }

  const mikro = somPost<{ beskrivelse?: string; uker?: unknown }>(
    masterbrain.mikroperiodisering,
    "mikrosyklus_4_uker",
  );
  if (mikro) {
    ut.push(`4-ukers mikrosyklus: ${JSON.stringify(mikro).slice(0, 900)}`);
  }

  return ut;
}

// ── Offentlig API ──────────────────────────────────────────────────────────

export type FasitOpts = {
  /** SG-område oppgaven gjelder (OTT/APP/ARG/PUTT). Styrer kandidatfeil. */
  sgOmrade?: string;
  /** Konkret MORAD-feil, når den er kjent. Snevrer inn teknikk-blokka. */
  faultId?: string;
  /** Spillerens A–K-kategori. Henter riktig pyramidefordeling. */
  akKategori?: string;
};

/** Domener der golfmetodikk aldri er relevant. */
const DOMENER_UTEN_DRILL: ReadonlySet<Domene> = new Set<Domene>(["BOOKING", "OKONOMI"]);

const DOMENE_TIL_SEKSJONER: Record<Domene, (o: FasitOpts) => string[]> = {
  SG: (o) => sgSeksjon(o.sgOmrade),
  TRACKMAN: (o) => [...sgSeksjon(o.sgOmrade), ...teknikkSeksjon(o.faultId)],
  // Teknikkspørsmål som springer ut av et SG-tall må bære SG-forbeholdet med
  // seg. Uten dette mistet TEKNIKK-grenen hypotese-språket, og en svingfeil
  // utledet fra tall kunne presenteres som et funn — nøyaktig framstillingen
  // beslutningen 2026-07-31 forbyr. Funnet av eval-porten, ikke av en leser.
  TEKNIKK: (o) => [
    ...teknikkSeksjon(o.faultId),
    ...(o.sgOmrade ? sgSeksjon(o.sgOmrade) : []),
  ],
  PLAN: (o) => planSeksjon(o.akKategori),
  BOOKING: () => [],
  OKONOMI: () => [],
  GENERELT: () => [],
};

/**
 * Bygg FASIT-blokka for en klassifisert oppgave.
 *
 * Returnerer null når fasiten ikke har noe å bidra med for domenet — da skal
 * kalleren utelate laget framfor å sende en tom blokk.
 */
export function byggFasitKontekst(
  k: Klassifisering,
  opts: FasitOpts = {},
): KontekstBlokk | null {
  const seksjoner = DOMENE_TIL_SEKSJONER[k.domene](opts);

  // Drill-bankens status er bare relevant der modellen kan komme til å
  // foreskrive en øvelse. Booking og økonomi skal ikke få støy om den.
  const drill = DOMENER_UTEN_DRILL.has(k.domene) ? "" : drillStatus();
  if (drill) seksjoner.push(drill);

  const innhold = seksjoner.filter(Boolean).join("\n\n").trim();
  if (innhold.length === 0) return null;

  return { kilde: "FASIT", innhold };
}
