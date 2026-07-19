// src/lib/agents/tripletex-maanedsavslutning-agent.ts
// Månedsavslutning-rytmen fra .claude/rules/admin-tripletex.md:
//   «Månedsavslutning: første uke i ny måned — resultat vs. budsjett per
//    virksomhet (Mulligan, Academy, Software, WANG-fakturering, GFGK), avvik
//    > 10 % flagges med forklaringsutkast Anders kan verifisere.»
//
// Budsjett-avviket (>10 %-regelen) er IKKE bygget her — det finnes ingen
// budsjettkilde i systemet ennå. Denne agenten sender KUN resultattallene
// Tripletex faktisk gir (der API-et svarer), eller en tydelig
// "tall mangler"-melding hvis integrasjonen ikke er konfigurert/svarer.
// Aktiver budsjett-sammenligningen når en budsjettkilde finnes (Notion,
// regneark eller egen tabell) — se .claude/rules/admin-tripletex.md:
// «Økonomi-tall LESES fra Tripletex(-eksport), aldri estimeres.»
import "server-only";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleAgentFunn } from "./agent-notify";
import { startOfMonth } from "@/lib/uke-helpers";
import { readTripletexEnv } from "@/lib/tripletex/env";
import { hentResultatrapport } from "@/lib/tripletex/client";

export const AGENT_NAME = "tripletex-maanedsavslutning";

const ADMIN_LENKE = "/admin/agencyos";

const NORSKE_MANEDER = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
] as const;

// VIKTIG (samme felle som uke-helpers.ts advarer om): startOfMonth/endOfMonth
// returnerer "naiv lokal midnatt" — Date-objekter hvis getFullYear/getMonth/
// getDate BÆRER den norske kalenderdagen, men hvis underliggende UTC-instant
// IKKE er det ekte Oslo-tidsstempelet. Å sende disse Date-objektene tilbake
// gjennom en Europe/Oslo-Intl-formatter (eller gjøre instant-subtraksjon på
// dem og så Oslo-formatere resultatet) dobbelt-konverterer og gir feil dag/
// måned rundt månedsskiftet. Riktig bruk (som her): les kun med LOKALE
// getters, og gjør kalenderaritmetikk med Date-konstruktørens egen
// overløps-normalisering (samme triks som lokalMidnatt() i uke-helpers.ts).

function tilIsoDatoLokal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Norsk "måned år" fra en naiv lokal Date — leser kun lokale getters, se advarsel over. */
function maanedTekstLokal(date: Date): string {
  return `${NORSKE_MANEDER[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Perioden [start, sluttEksklusiv) for MÅNEDEN FØR `now`, regnet i Oslo-tid.
 * start = 1. i forrige måned, sluttEksklusiv = 1. i denne måneden (begge
 * "naive lokale" Date-er — les dem kun med lokale getters, se advarsel over).
 */
export function forrigeManedPeriode(now: Date): { start: Date; sluttEksklusiv: Date } {
  const denneManedStart = startOfMonth(now);
  const forrigeManedStart = new Date(
    denneManedStart.getFullYear(),
    denneManedStart.getMonth() - 1,
    1,
  );
  return { start: forrigeManedStart, sluttEksklusiv: denneManedStart };
}

/** Siste kalenderdag i måneden FØR `sluttEksklusiv` (dag 0-triks — trygg overløpsnormalisering). */
function sisteDagIForrigeManed(sluttEksklusiv: Date): Date {
  return new Date(sluttEksklusiv.getFullYear(), sluttEksklusiv.getMonth(), 0);
}

export async function runMaanedsavslutning(now: Date = new Date()): Promise<AgentResult> {
  return runAgent(AGENT_NAME, null, async () => {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.warn("[tripletex-maanedsavslutning] fant ingen ADMIN-bruker — kan ikke varsle");
      return { output: { sendt: false, aarsak: "ingen admin-bruker funnet" } };
    }

    const { start, sluttEksklusiv } = forrigeManedPeriode(now);
    const maanedTekst = maanedTekstLokal(start);
    const fraDato = tilIsoDatoLokal(start);
    const tilDato = tilIsoDatoLokal(sisteDagIForrigeManed(sluttEksklusiv));

    const env = readTripletexEnv();
    if (!env) {
      await varsleAgentFunn({
        coachId: admin.id,
        tittel: `Månedsavslutning ${maanedTekst}: tall mangler`,
        tekst: "Tripletex-integrasjonen er ikke konfigurert ennå — tall mangler, les i Tripletex.",
        lenke: ADMIN_LENKE,
      });
      return { output: { sendt: true, kilde: "ikke-konfigurert", maaned: maanedTekst } };
    }

    const rapport = await hentResultatrapport(fraDato, tilDato);
    if (!rapport) {
      await varsleAgentFunn({
        coachId: admin.id,
        tittel: `Månedsavslutning ${maanedTekst}: tall mangler`,
        tekst: "Fikk ikke hentet resultatrapport fra Tripletex (feil eller ugyldig svar) — tall mangler, les i Tripletex.",
        lenke: ADMIN_LENKE,
      });
      return { output: { sendt: true, kilde: "hentefeil", maaned: maanedTekst } };
    }

    const linjeTekst =
      rapport.linjer.length > 0
        ? rapport.linjer.map((l) => `- ${l.navn}: ${l.belop.toLocaleString("nb-NO")} kr`).join("\n")
        : "(Tripletex ga ingen linjer for perioden — sjekk i Tripletex.)";
    const resultatTekst =
      rapport.resultat != null ? `\n\nResultat: ${rapport.resultat.toLocaleString("nb-NO")} kr` : "";

    await varsleAgentFunn({
      coachId: admin.id,
      tittel: `Månedsavslutning ${maanedTekst}`,
      tekst:
        `Resultat per virksomhet (der Tripletex gir det):\n${linjeTekst}${resultatTekst}\n\n` +
        "Avvik mot budsjett er ikke aktivert ennå (mangler budsjettkilde i systemet) — verifiser tallene i Tripletex.",
      lenke: ADMIN_LENKE,
    });

    return { output: { sendt: true, kilde: "tripletex", maaned: maanedTekst, linjer: rapport.linjer.length } };
  });
}
