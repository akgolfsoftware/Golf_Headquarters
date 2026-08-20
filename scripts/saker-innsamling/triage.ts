/**
 * Triage-agent for Jarvis' "Saker"-kø (steg 3+4 av jarvis-masterplan.md,
 * DEL A — se README.md i denne mappen for steg 1/2). Plukker VENTER-saker
 * UTEN foreslattSvar og skriver et svarutkast:
 *
 *   1. Lokal Ollama (MEG_OLLAMA_URL/MEG_OLLAMA_MODEL) klassifiserer saken
 *      (kategori, hastegrad, om det er en ren bekreftelse/kvittering) OG
 *      lister personnavnene den finner i innholdet. Selve erstatningen
 *      (navn → [PERSON1] osv.) gjøres deretter LOKALT og deterministisk av
 *      src/lib/saker/anonymiser.ts — en språkmodell kan ikke garanteres å
 *      gjengi resten av teksten uendret, så den mekaniske delen er en ren
 *      funksjon med egne tester i stedet.
 *   2. Enkle saker (ren bekreftelse/kvittering) får svarutkastet skrevet
 *      HELT av den lokale Ollama-modellen, på RÅ tekst — den forlater aldri
 *      maskinen, så anonymisering er ikke nødvendig for denne veien.
 *   3. Komplekse saker: KUN det anonymiserte innholdet sendes til Claude
 *      (ANTHROPIC_API_KEY, samme klient-mønster som src/lib/ai/client.ts).
 *      Navnene settes tilbake LOKALT (reSubstituer) før svaret lagres.
 *   4. Hele kjøringen logges via runAgent("saker-triage", ...).
 *
 * Etter at foreslattSvar er skrevet: send en kort Telegram-melding til
 * Anders (sammendrag + selve utkastet) og registrer én ventende BEKREFT-
 * handling (createPending, tool_name "sak_godkjenn") slik at et rått
 * "BEKREFT" i Telegram oppretter Gmail-utkastet — samme godkjennSak() som
 * Godkjenn-knappen i AgencyOS (src/lib/saker/godkjenn.ts, wired opp i
 * src/lib/meg/confirm.ts). NB: me_pending_action leses med «siste ventende
 * handling vinner» (getLatestPending) — derfor registreres ALDRI mer enn én
 * "sak_godkjenn"-pending om gangen: finnes en åpen fra før
 * (harVentendePending), hoppes registreringen over og Telegram-meldingen
 * sier i stedet at flere saker venter i AgencyOS → Innboks. Resultat:
 * BEKREFT treffer alltid en deterministisk sak (den først registrerte),
 * aldri blindt bakover i en stabel.
 *
 * Oppretter ALDRI noe i Gmail selv, og sender ALDRI noe automatisk — kun
 * skriver foreslattSvar til DB. Selve utkastet i Gmail opprettes først når
 * saken faktisk GODKJENNES.
 *
 * Kjør: npm run saker:triage
 * LaunchAgent-mal: com.akgolf.saker-triage.plist (samme mappe, hvert 30. min).
 */
import "../_env";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma, Sak } from "@/generated/prisma/client";
import { runAgent } from "@/lib/agents/agent-runner";
import { sendTelegramMessage } from "@/lib/meg/telegram";
import { ollamaChatJson } from "@/lib/meg/ollama";
import { createPending, harVentendePending } from "@/lib/meg/pending";
import { adminSubject } from "@/lib/meg/access";
import { anthropic, MEG_MODEL_SMART, isAiEnabled, tekstFra } from "@/lib/ai/client";
import { anonymiserNavn, reSubstituer } from "@/lib/saker/anonymiser";
import { hentAdminGoogleTilkobling } from "./google-tilkobling";
import { lesSakerInnsamlingEnv } from "./env";

// ── Steg 1: lokal klassifisering + navne-gjenkjenning (Ollama, JSON) ────────

const triageResultatSchema = z.object({
  kategori: z.string().min(1),
  hastegrad: z.enum(["lav", "normal", "hoy"]),
  erEnkelBekreftelse: z.boolean(),
  personer: z.array(z.string()),
});
type TriageResultat = z.infer<typeof triageResultatSchema>;

const triageFormatSchema = {
  type: "object",
  properties: {
    kategori: { type: "string" },
    hastegrad: { type: "string", enum: ["lav", "normal", "hoy"] },
    erEnkelBekreftelse: { type: "boolean" },
    personer: { type: "array", items: { type: "string" } },
  },
  required: ["kategori", "hastegrad", "erEnkelBekreftelse", "personer"],
} as const;

const KLASSIFISER_SYSTEM_PROMPT = `Du klassifiserer en innkommende henvendelse til AK Golf Group (golfakademi, coaching, simulatorsenter).
Svar KUN med JSON:
{
  "kategori": "<kort norsk kategori, f.eks. booking, faktura, spørsmål, klage, generelt>",
  "hastegrad": "<ett av: lav|normal|hoy>",
  "erEnkelBekreftelse": <true hvis dette KUN er en ren bekreftelse/kvittering som ikke krever noe innholdsmessig svar utover en høflig kvittering, ellers false>,
  "personer": [<alle fullstendige personnavn nevnt i teksten, som de faktisk står skrevet, tom liste hvis ingen>]
}`;

/** Klassifiserer én sak lokalt. Returnerer null ved feil/timeout/ikke-installert Ollama — gjetter ALDRI. */
async function klassifiserSak(sak: Sak): Promise<TriageResultat | null> {
  const bruker = `Emne: ${sak.emne ?? "(uten emne)"}\n\n${sak.innhold}`.slice(0, 4000);
  const raw = await ollamaChatJson(KLASSIFISER_SYSTEM_PROMPT, bruker, triageFormatSchema, 15000);
  const parsed = triageResultatSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

// ── Steg 2: enkle saker — svarutkast HELT lokalt (Ollama, JSON) ────────────

const lokalSvarSchema = z.object({ svar: z.string().min(1) });
const lokalSvarFormatSchema = {
  type: "object",
  properties: { svar: { type: "string" } },
  required: ["svar"],
} as const;

const LOKALT_SVAR_SYSTEM_PROMPT = `Du skriver et kort, høflig svar-utkast på norsk bokmål til en enkel bekreftelse/kvittering til AK Golf Group. Ingen emoji. Svar KUN med JSON: {"svar": "<svarteksten>"}.`;

/** RÅ tekst — denne veien forlater aldri maskinen (lokal Ollama), så ingen anonymisering trengs. */
async function genererSvarLokalt(sak: Sak): Promise<string | null> {
  const bruker = `Emne: ${sak.emne ?? "(uten emne)"}\n\n${sak.innhold}`.slice(0, 4000);
  const raw = await ollamaChatJson(LOKALT_SVAR_SYSTEM_PROMPT, bruker, lokalSvarFormatSchema, 15000);
  const parsed = lokalSvarSchema.safeParse(raw);
  return parsed.success ? parsed.data.svar.trim() : null;
}

// ── Steg 3: komplekse saker — Claude på ANONYMISERT innhold ────────────────

const CLAUDE_SVAR_SYSTEM_PROMPT = `Du skriver et kort, profesjonelt svar-utkast på norsk bokmål til en henvendelse til AK Golf Group (golfakademi, coaching, simulatorsenter). Ingen emoji, ingen markdown. Personnavn i teksten er allerede erstattet med plassholdere som [PERSON1] — behold disse plassholderne UENDRET i svaret ditt der det er naturlig å bruke navnet (f.eks. i hilsenen). Svar KUN med selve brevteksten, ingen forklaring rundt.`;

/** Sender KUN anonymisert innhold. Returnerer null hvis Claude ikke er konfigurert eller kallet feiler. */
async function genererSvarMedClaude(sak: Sak, anonymisertInnhold: string): Promise<string | null> {
  if (!isAiEnabled() || !anthropic) return null;
  try {
    const response = await anthropic.messages.create({
      model: MEG_MODEL_SMART,
      max_tokens: 600,
      system: CLAUDE_SVAR_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Emne: ${sak.emne ?? "(uten emne)"}\n\n${anonymisertInnhold}`.slice(0, 4000) },
      ],
    });
    const tekst = tekstFra(response);
    return tekst || null;
  } catch (err) {
    console.error("[saker-triage] Claude-kall feilet:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Telegram-varsel + BEKREFT-registrering (steg 7) ────────────────────────

async function varsleOgRegistrerBekreft(sak: Sak, svar: string): Promise<void> {
  const botToken = process.env.MEG_TELEGRAM_BOT_TOKEN;
  const subject = adminSubject();
  if (!botToken || !subject) {
    console.warn(
      "[saker-triage] Telegram-env eller admin-chatId mangler (MEG_TELEGRAM_BOT_TOKEN/MEG_ALLOWED_PEOPLE) — hopper over varsel og BEKREFT-registrering. Saken kan fortsatt godkjennes fra AgencyOS.",
    );
    return;
  }

  // Kun ÉN "sak_godkjenn"-pending om gangen (se filhodet): finnes en åpen
  // fra før, registreres ingen ny — BEKREFT skal alltid treffe den først
  // registrerte saken deterministisk, aldri vandre bakover i en stabel.
  const harAlleredePending = await harVentendePending(subject, "sak_godkjenn");

  const kortEmne = sak.emne?.trim() || "(uten emne)";
  const kortSvar = svar.length > 600 ? `${svar.slice(0, 600)}…` : svar;
  const melding = [
    `Sak-forslag klart · ${sak.avsender ?? "ukjent avsender"}`,
    `"${kortEmne}"`,
    "",
    "Foreslått svar:",
    kortSvar,
    "",
    harAlleredePending
      ? "Flere saker venter — godkjenn i AgencyOS → Innboks."
      : "Svar BEKREFT for å opprette Gmail-utkastet (sendes aldri automatisk), eller se saken i AgencyOS → Innboks.",
  ].join("\n");

  try {
    await sendTelegramMessage(botToken, subject, melding);
  } catch (err) {
    console.error("[saker-triage] Telegram-varsel feilet:", err instanceof Error ? err.message : err);
  }

  if (harAlleredePending) return;

  await createPending(
    "sak_godkjenn",
    { sakId: sak.id },
    `Opprette Gmail-utkast for sak "${kortEmne}" (${sak.avsender ?? "ukjent avsender"})`,
    subject,
  );
}

// ── Provenance-tillegg (bevarer det gmail-innsamler allerede skrev) ────────

function medTriageProvenance(
  eksisterende: unknown,
  tillegg: { kategori: string; hastegrad: string; motor: "ollama" | "claude"; kjort: string },
): Prisma.InputJsonValue {
  const basis =
    eksisterende && typeof eksisterende === "object" && !Array.isArray(eksisterende)
      ? (eksisterende as Record<string, unknown>)
      : {};
  return { ...basis, triage: tillegg } as Prisma.InputJsonValue;
}

// ── Hovedløkke ───────────────────────────────────────────────────────────

async function behandleSak(sak: Sak): Promise<"utkast" | "hoppetOver" | "feilet"> {
  const klass = await klassifiserSak(sak);
  if (!klass) {
    console.log(`[saker-triage] Ollama-klassifisering feilet/utilgjengelig for sak ${sak.id} — hopper over denne runden.`);
    return "hoppetOver";
  }

  let svar: string | null;
  let motor: "ollama" | "claude";

  if (klass.erEnkelBekreftelse) {
    motor = "ollama";
    svar = await genererSvarLokalt(sak);
  } else {
    motor = "claude";
    const { anonymisert, mapping } = anonymiserNavn(sak.innhold, klass.personer);
    const claudeSvar = await genererSvarMedClaude(sak, anonymisert);
    svar = claudeSvar ? reSubstituer(claudeSvar, mapping) : null;
  }

  if (!svar) {
    console.log(`[saker-triage] Kunne ikke skrive svarutkast for sak ${sak.id} (motor: ${motor}) — krever manuell oppfølging.`);
    return "feilet";
  }

  await prisma.sak.update({
    where: { id: sak.id },
    data: {
      foreslattSvar: svar,
      provenance: medTriageProvenance(sak.provenance, {
        kategori: klass.kategori,
        hastegrad: klass.hastegrad,
        motor,
        kjort: new Date().toISOString(),
      }),
    },
  });
  console.log(`[saker-triage] Svarutkast skrevet for sak ${sak.id} (motor: ${motor}, kategori: ${klass.kategori}).`);

  await varsleOgRegistrerBekreft(sak, svar);
  return "utkast";
}

async function main() {
  const env = lesSakerInnsamlingEnv();

  const sakerAaBehandle = await prisma.sak.findMany({
    where: { status: "VENTER", foreslattSvar: null },
    orderBy: { opprettet: "asc" },
    take: env.triageBatchLimit,
  });

  if (sakerAaBehandle.length === 0) {
    console.log("[saker-triage] Ingen VENTER-saker uten foreslattSvar — ingenting å gjøre.");
    return;
  }

  // Ren lesbarhetssjekk: EPOST-saker kan først faktisk få et Gmail-utkast
  // når de godkjennes (src/lib/saker/godkjenn.ts) — mangler tilkoblingen,
  // er det verdt å si fra nå fremfor å oppdage det ved Godkjenn.
  const epostSaker = sakerAaBehandle.filter((s) => s.kanal === "EPOST").length;
  if (epostSaker > 0 && !(await hentAdminGoogleTilkobling())) {
    console.warn(
      "[saker-triage] Ingen aktiv Google-tilkobling (ADMIN) — utkast skrives likevel, men Gmail-utkast kan ikke opprettes før tilkoblingen er på plass igjen.",
    );
  }

  console.log(`[saker-triage] Behandler ${sakerAaBehandle.length} sak(er) uten foreslattSvar.`);

  let utkastSkrevet = 0;
  let hoppetOver = 0;
  let feilet = 0;

  await runAgent("saker-triage", null, async () => {
    for (const sak of sakerAaBehandle) {
      try {
        const resultat = await behandleSak(sak);
        if (resultat === "utkast") utkastSkrevet++;
        else if (resultat === "hoppetOver") hoppetOver++;
        else feilet++;
      } catch (err) {
        feilet++;
        console.error(`[saker-triage] Uventet feil ved behandling av sak ${sak.id}:`, err instanceof Error ? err.message : err);
      }
    }
    return { output: { behandlet: sakerAaBehandle.length, utkastSkrevet, hoppetOver, feilet } };
  });

  const oppsummering = `Saker-triage ferdig: ${utkastSkrevet} utkast skrevet · ${hoppetOver} hoppet over (Ollama utilgjengelig) · ${feilet} feilet (krever manuell oppfølging).`;
  console.log(`[saker-triage] ${oppsummering}`);

  // Kun ved en STRUKTURELL feil (Ollama nede for HELE runden) varsles Anders
  // separat — enkeltsaker som feiler varsles ikke individuelt (samme
  // filosofi som mulligan-triage: logges for manuell oppfølging, ingen
  // Telegram-støy per rad).
  if (hoppetOver === sakerAaBehandle.length) {
    const botToken = process.env.MEG_TELEGRAM_BOT_TOKEN;
    const subject = adminSubject();
    if (botToken && subject) {
      await sendTelegramMessage(
        botToken,
        subject,
        `⚠️ Saker-triage kunne ikke klassifisere noen saker denne runden — Ollama er utilgjengelig (${sakerAaBehandle.length} sak(er) venter fortsatt).`,
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[saker-triage] Kritisk feil:", err);
    process.exit(1);
  });
