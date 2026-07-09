// Delt system-prompt-bygger for AI-coach. Brukes både fra:
//   - src/lib/anthropic.ts (spillerens egen AI-coach)
//   - src/app/api/admin/coach-ai/route.ts (coach som analyserer spiller)
//
// Generisk input-type dekker begge bruksmønstrene.
//
// I tillegg eksporterer denne fila byggBrukerMeldingMedMal() — som brukes
// av plan-generatoren til å pakke kontekst + PlanTemplate + coach-instruks
// inn i én bruker-melding.

import type {
  PlanTemplateData,
  SpillerKontekst,
} from "./context";
import { kontekstSomBrukerMelding } from "./context";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";

export type SystemPromptInput = {
  /** Hvem prompten er rettet til. Styrer tone og rolle. */
  mottaker: "spiller" | "coach" | "spiller-live";
  /** Navn på spilleren (enten den som chater, eller den som analyseres). */
  spillerNavn: string;
  hcp: number | null;
  ambition: string | null;
  homeClub: string | null;
  tier: string;
  playingYears: number | null;
  /** Siste runder, normalisert. */
  sisteRunder: Array<{
    dato: string;
    bane: string;
    score: number;
    sgTotal: number | null;
  }>;
  /** Aktive treningsplaner (én linje per plan). */
  aktivePlaner: Array<{ navn: string; meta?: string }>;
  /** Siste tester (kun relevant for coach-flow). */
  sisteTester?: Array<{ dato: string; navn: string; score: number }>;
};

/** Bygger spillerprofil-blokken. Delt mellom alle mottaker-varianter. */
function byggProfilLinjer(input: SystemPromptInput): string {
  return [
    `Spiller: ${input.spillerNavn}`,
    input.hcp != null
      ? `HCP: ${input.hcp.toFixed(1).replace(".", ",")}`
      : null,
    input.playingYears != null ? `Spilt: ${input.playingYears} år` : null,
    input.homeClub ? `Hjemmeklubb: ${input.homeClub}` : null,
    input.ambition ? `Ambisjon: ${input.ambition}` : null,
    `Tier: ${input.tier}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Bygger linjer for aktive treningsplaner. Delt mellom alle mottaker-varianter. */
function byggPlanLinjer(aktivePlaner: SystemPromptInput["aktivePlaner"]): string {
  return aktivePlaner.length > 0
    ? aktivePlaner
        .map((p) => `- ${p.navn}${p.meta ? ` ${p.meta}` : ""}`)
        .join("\n")
    : "Ingen aktive treningsplaner.";
}

/** Bygger linjer for siste runder (maks 5). Delt mellom alle mottaker-varianter. */
function byggRundeLinjer(sisteRunder: SystemPromptInput["sisteRunder"]): string {
  return sisteRunder.length > 0
    ? sisteRunder
        .slice(0, 5)
        .map((r) => {
          const sg =
            r.sgTotal != null
              ? `SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}`
              : "";
          return `- ${r.dato} · ${r.bane} · ${r.score}${
            sg ? " · " + sg : ""
          }`;
        })
        .join("\n")
    : "Ingen registrerte runder enda.";
}

export function bygCoachSystemPrompt(input: SystemPromptInput): string {
  const profil = byggProfilLinjer(input);
  const planLinjer = byggPlanLinjer(input.aktivePlaner);
  const rundeLinjer = byggRundeLinjer(input.sisteRunder);

  const testLinjer =
    input.sisteTester && input.sisteTester.length > 0
      ? input.sisteTester
          .map(
            (t) =>
              `- ${t.dato} · ${t.navn} · ${t.score
                .toFixed(1)
                .replace(".", ",")}`,
          )
          .join("\n")
      : null;

  if (input.mottaker === "spiller") {
    return `Du er AK Golf AI-coach — en personlig coaching-assistent for golfspillere på AK Golf-plattformen.

Du følger AK Golf-pyramidens fem områder: FYS (fysisk), TEK (teknisk), SLAG (slag — korthold/pitch/putt), SPILL (spill — banetilpasning), TURN (turnering).

Tone: motiverende, kortfattet, handlingsorientert. Snakk norsk bokmål. Bruk æ/ø/å riktig. Aldri emoji.

Profil til denne spilleren:
${profil}

Aktive treningsplaner:
${planLinjer}

Siste 5 runder:
${rundeLinjer}

Retningslinjer:
- Gi konkrete råd basert på spillerens data, ikke generiske golf-tips
- Ved spørsmål om "hva bør jeg trene": foreslå spesifikke drills knyttet til pyramide-områder
- Ved spørsmål om resultater: refer til siste runder hvis relevant
- Hold svar under 150 ord med mindre brukeren ber om mer
- Du har ikke tilgang til å booke timer eller endre planen direkte — be brukeren om å bruke /portal/tren eller /portal/coach for det
- Vær ærlig om hva du ikke vet`;
  }

  // mottaker === "coach"
  return `Du er AI-assistent for en AK Golf-coach som analyserer en spiller.

Du følger AK Golf-pyramidens fem områder: FYS (fysisk), TEK (teknisk),
SLAG (slag), SPILL (spill), TURN (turnering).

Tone: faglig, kortfattet, handlingsorientert. Snakk norsk bokmål.
Ingen emoji. Maks 200 ord per svar med mindre coach ber om mer.

Spilleren du analyserer:
${profil}

Aktiv plan: ${planLinjer}

Siste runder:
${rundeLinjer}

Siste tester:
${testLinjer ?? "Ingen tester."}

Retningslinjer:
- Gi konkrete observasjoner basert på dataene
- Når coach spør om "neste økt": foreslå pyramide-område + spesifikke drills
- Når coach spør om analyse: pek på tendenser i SG-tallene
- Si tydelig hvis du mangler data for å svare presist
- Aldri foreslå at coachen "snakker med spilleren" uten konkret innhold`;
}

/** Kontekst om den aktive live-økta — injiseres i system-prompten sammen med spillerprofilen. */
export type LiveCoachKontext = {
  sessionKind: LiveSessionKind;
  sessionId: string;
  sessionTitle: string;
  coachBrief?: string | null;
  activeDrill?: {
    name: string;
    lFase?: string | null;
    csNivaa?: string | null;
    pyramidArea?: string | null;
    pPosisjoner?: string[];
  } | null;
  drillsRemaining: number;
};

/**
 * Bygger system-prompten for AI Golf Coach under en AKTIV treningsøkt.
 * Kortere, mer direkte tone enn den ordinære spiller-varianten — spilleren
 * står midt i økta, ikke i en generell coaching-samtale.
 */
export function bygLiveCoachSystemPrompt(
  base: SystemPromptInput,
  live: LiveCoachKontext,
): string {
  const profil = byggProfilLinjer(base);
  const planLinjer = byggPlanLinjer(base.aktivePlaner);
  const rundeLinjer = byggRundeLinjer(base.sisteRunder);
  const fornavn = base.spillerNavn.split(" ")[0] || base.spillerNavn;

  const drillLinjer = live.activeDrill
    ? [
        `Aktiv drill: ${live.activeDrill.name}`,
        live.activeDrill.lFase ? `L-fase: ${live.activeDrill.lFase}` : null,
        live.activeDrill.csNivaa ? `CS-nivå: ${live.activeDrill.csNivaa}` : null,
        live.activeDrill.pyramidArea
          ? `Pyramideområde: ${live.activeDrill.pyramidArea}`
          : null,
        live.activeDrill.pPosisjoner && live.activeDrill.pPosisjoner.length > 0
          ? `P-posisjoner: ${live.activeDrill.pPosisjoner.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "Ingen aktiv drill valgt akkurat nå.";

  const sessionKindLabel =
    live.sessionKind === "plan-session" ? "treningsplan-økt" : "økt v2";

  return `Du er AI Golf Coach — Anders Kristiansens digitale stemme under en AKTIV treningsøkt.

KONTEKST-REGLER:
- ${fornavn} trener AKKURAT NÅ — dette er ikke en generell samtale, det skjer midt i økta.
- Svar kort: maks 80 ord med mindre spilleren ber om mer.
- Bruk fornavnet ${fornavn}, ikke fullt navn.
- Referer dagens økt, aktiv drill, L-fase, CS-nivå, miljø og pyramide-område når det er relevant.
- Still ETT godt coaching-spørsmål per svar.
- Forklar P-posisjon/MORAD kun når det faktisk hjelper akkurat nå — aldri en forelesning.
- Aldri emoji. Aldri "Bra jobba!". Aldri utropstegn.
- Du anbefaler — du sperrer aldri trening.
- Hvis det ikke er lastet opp video ennå: be spilleren laste opp, ikke gjett på svingen.

Dagens økt: ${live.sessionTitle} (${sessionKindLabel})
${live.coachBrief ? `Coach-notat til denne økta: ${live.coachBrief}` : "Ingen coach-notat på denne økta."}
Driller igjen: ${live.drillsRemaining}

${drillLinjer}

Spillerprofil:
${profil}

Aktive treningsplaner:
${planLinjer}

Siste 5 runder:
${rundeLinjer}`;
}

/**
 * Bygger den fullstendige bruker-meldingen for AI-plan-generering med
 * (valgfri) baseline-mal. Inkluderer kontekst, template og coach-instruks.
 *
 * Hvis template er null, fallbacker til original kontekstSomBrukerMelding().
 */
export function byggBrukerMeldingMedMal(
  ctx: SpillerKontekst,
  brukerPrompt: string,
  template: PlanTemplateData | null,
  feedback?: string,
  forrigeForslag?: unknown,
): string {
  if (template === null) {
    return kontekstSomBrukerMelding(ctx, brukerPrompt, feedback, forrigeForslag);
  }

  const linjer: string[] = [];
  linjer.push("KONTEKST OM SPILLEREN (JSON):");
  linjer.push("```json");
  linjer.push(JSON.stringify(ctx, null, 2));
  linjer.push("```");
  linjer.push("");
  linjer.push(
    `BASELINE-MAL (PlanTemplate "${template.navn}" — matchet på kategori ${
      ctx.spiller.ngfKategori ?? "?"
    } × ${ctx.aktivLPhase ?? "?"}):`,
  );
  linjer.push("```json");
  linjer.push(JSON.stringify(template, null, 2));
  linjer.push("```");
  linjer.push("");
  linjer.push(
    "Bruk malen som utgangspunkt. JUSTER drills, volum og fokus basert på",
  );
  linjer.push(
    "spillerens individuelle SG-data, aktive mål og forrige PlanEffectiveness.",
  );
  linjer.push("IKKE kopier malen 1:1. Tilpass den.");
  linjer.push("");
  linjer.push("COACH SIN INSTRUKS:");
  linjer.push(brukerPrompt);
  if (forrigeForslag && feedback) {
    linjer.push("");
    linjer.push("FORRIGE FORSLAG (revider basert på feedback):");
    linjer.push("```json");
    linjer.push(JSON.stringify(forrigeForslag, null, 2));
    linjer.push("```");
    linjer.push("");
    linjer.push("FEEDBACK FRA COACH:");
    linjer.push(feedback);
  }
  linjer.push("");
  linjer.push(
    'Lag en treningsplan tilpasset spilleren. Kall verktøyet "lever_planforslag" med en gang.',
  );
  return linjer.join("\n");
}
