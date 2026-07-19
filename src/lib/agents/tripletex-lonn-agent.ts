// src/lib/agents/tripletex-lonn-agent.ts
// Lønnsrytmen fra .claude/rules/admin-tripletex.md:
//   «Lønn den 5. hver måned: den 3. genereres sjekkliste til Anders
//    (Telegram + dagsnotat)… Den 6.: purring hvis ikke bekreftet.»
//
// Agenten UTFØRER aldri lønnskjøringer eller utbetalinger — den forbereder
// sjekklisten og varsler. Bekreftelse skjer alltid manuelt av Anders (via
// Meg-tool `lonn_bekreft`, se bekreftLonn() under + src/lib/meg/tools.ts).
//
// Bekreftelsen gjenbruker AgentRun-tabellen (ingen schema-endring — Prisma
// migrate/db push er blokkert, se .claude/rules/gotchas.md): en AgentRun-rad
// med agentName "lonn-bekreftet" i inneværende Oslo-måned regnes som bekreftet.
import "server-only";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleAgentFunn } from "./agent-notify";
import { hentAnsatte } from "@/lib/tripletex/client";

export const SJEKKLISTE_AGENT_NAME = "tripletex-lonn-sjekkliste";
export const PURRING_AGENT_NAME = "tripletex-lonn-purring";
export const BEKREFTET_AGENT_NAME = "lonn-bekreftet";

const ADMIN_LENKE = "/admin/agencyos";

// ── Oslo-dato-hjelpere (samme mønster som src/lib/uke-helpers.ts: Vercel
// kjører UTC, men "hvilken dag er det" skal alltid regnes mot norsk
// kalenderdag) ────────────────────────────────────────────────────────────

const osloDagFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
});

const osloManedFormatter = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  month: "long",
  year: "numeric",
});

// "2026-07" — brukes KUN til å sammenligne to ekte tidsstempler for
// Oslo-kalendermåned. Bevisst enkel: formaterer en REELL Date-instant direkte
// via Intl (ingen "naiv lokal midnatt"-mellomsteg som i uke-helpers.ts) —
// unngår dermed helt den dobbel-konverteringsfellen som oppstår hvis man
// blander naive stand-in-datoer med instant-sammenligning på tvers av
// UTC/Oslo-offset (+1/+2 t) rundt månedsskiftet.
const osloAarManedFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
});

function osloAarManed(date: Date): string {
  return osloAarManedFormatter.format(date);
}

/** Dag i måneden (1–31) på norsk kalenderdag — aldri rå date.getDate() (server er UTC på Vercel). */
export function osloDagIManeden(date: Date): number {
  return Number(osloDagFormatter.format(date));
}

/** "juli 2026" — for varseltekster. */
export function osloManedTekst(date: Date): string {
  return osloManedFormatter.format(date);
}

/**
 * Er minst én av bekreftelsestidspunktene i samme Oslo-kalendermåned som `now`?
 * Ren funksjon (ingen DB) — sammenligner "år-måned i Oslo" per tidsstempel,
 * ikke instant-ranger, så den er nøyaktig helt inn til månedsskiftet.
 */
export function harBekreftetIManeden(bekreftelser: Date[], now: Date): boolean {
  const maalManed = osloAarManed(now);
  return bekreftelser.some((d) => osloAarManed(d) === maalManed);
}

// ── Sjekkliste (kjøres den 3.) ───────────────────────────────────────────────

export async function runLonnSjekkliste(now: Date = new Date()): Promise<AgentResult> {
  return runAgent(SJEKKLISTE_AGENT_NAME, null, async () => {
    const dag = osloDagIManeden(now);
    if (dag !== 3) {
      // Ikke blokkerende — cron-schedule skal styre dette, men et manuelt
      // eller feilkonfigurert kall skal aldri stoppe helt (ingen "sperre").
      console.warn(
        `[tripletex-lonn-agent] runLonnSjekkliste kjørt på dag ${dag} i Oslo-tid (forventet 3.) — fortsetter likevel`,
      );
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.warn("[tripletex-lonn-agent] fant ingen ADMIN-bruker — kan ikke sende sjekkliste");
      return { output: { sendt: false, aarsak: "ingen admin-bruker funnet" } };
    }

    const maanedTekst = osloManedTekst(now);
    const ansatte = await hentAnsatte();
    const ansattLinje =
      ansatte == null
        ? "Ansattliste ikke tilgjengelig fra Tripletex akkurat nå — sjekk manuelt i Tripletex."
        : `${ansatte.length} ansatte i Tripletex: ${ansatte.map((a) => a.navn).join(", ") || "(ingen)"}.`;

    const tekst = [
      `Sjekkliste lønn ${maanedTekst}:`,
      "1) Timelister komplette?",
      `2) Lønnsgrunnlag riktig? (${ansattLinje})`,
      "3) Utbetaling utført den 5.?",
      "4) Bekreft med «lønn ok» til Meg når alt er gjort — det stopper purringen den 6.",
    ].join("\n");

    await varsleAgentFunn({
      coachId: admin.id,
      tittel: `Lønn ${maanedTekst}: sjekkliste`,
      tekst,
      lenke: ADMIN_LENKE,
    });

    return { output: { sendt: true, maaned: maanedTekst } };
  });
}

// ── Purring (kjøres den 6., kun hvis ikke bekreftet) ────────────────────────

export async function runLonnPurring(now: Date = new Date()): Promise<AgentResult> {
  return runAgent(PURRING_AGENT_NAME, null, async () => {
    const dag = osloDagIManeden(now);
    if (dag !== 6) {
      console.warn(
        `[tripletex-lonn-agent] runLonnPurring kjørt på dag ${dag} i Oslo-tid (forventet 6.) — fortsetter likevel`,
      );
    }

    // Hent bredt (40 dager — dekker enhver kalendermåned med god margin) og la
    // harBekreftetIManeden() gjøre den nøyaktige Oslo-månedssammenligningen
    // per rad. Unngår en instant-range-spørring bygget på "naive lokale"
    // månedsgrenser, som ville bommet med 1–2 timer rundt månedsskiftet
    // (Oslo er UTC+1/+2 — se kommentar ved osloAarManedFormatter over).
    const FERSKHET_DAGER = 40;
    const bekreftelser = await prisma.agentRun.findMany({
      where: {
        agentName: BEKREFTET_AGENT_NAME,
        status: "OK",
        createdAt: { gte: new Date(now.getTime() - FERSKHET_DAGER * 86_400_000) },
      },
      select: { createdAt: true },
    });

    if (harBekreftetIManeden(bekreftelser.map((b) => b.createdAt), now)) {
      return { output: { purret: false, aarsak: "allerede bekreftet" } };
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.warn("[tripletex-lonn-agent] fant ingen ADMIN-bruker — kan ikke purre");
      return { output: { purret: false, aarsak: "ingen admin-bruker funnet" } };
    }

    const maanedTekst = osloManedTekst(now);
    await varsleAgentFunn({
      coachId: admin.id,
      tittel: `Lønn ${maanedTekst}: ikke bekreftet`,
      tekst:
        `Lønnskjøringen for ${maanedTekst} er ikke bekreftet ennå. ` +
        "Svar «lønn ok» (eller «bekreft lønn») til Meg når utbetalingen er utført.",
      lenke: ADMIN_LENKE,
    });

    return { output: { purret: true, maaned: maanedTekst } };
  });
}

// ── Bekreftelse (kalt fra Meg-tool `lonn_bekreft`, se src/lib/meg/tools.ts) ──

/**
 * Skriver bekreftelsen som en AgentRun-rad ("lonn-bekreftet") for
 * inneværende Oslo-måned. Kalles KUN når Anders selv bekrefter via Meg
 * ("lønn ok" / "bekreft lønn") — aldri automatisk.
 */
export async function bekreftLonn(now: Date = new Date()): Promise<string> {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  await runAgent(BEKREFTET_AGENT_NAME, admin?.id ?? null, async () => ({
    output: { bekreftetVia: "meg", maaned: osloManedTekst(now) },
  }));
  return `Lønn bekreftet for ${osloManedTekst(now)}. Purringen den 6. stoppes.`;
}
