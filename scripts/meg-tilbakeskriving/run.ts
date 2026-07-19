/**
 * Meg tilbakeskrivings-pipeline.
 * Henter uprosesserte logg-rader fra Meg-Supabase, destillerer via Claude
 * og skriver til ak-brain (dagsnotat) og ak-second-brain (varige mønstre).
 *
 * Kjør: npm run meg:tilbakeskriv
 */

import "../_env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import os from "os";
import { mkdir, writeFile } from "fs/promises";
import { destiller, type LogRad } from "./destiller";
import { skrivAkBrain } from "./skriv-ak-brain";
import { skrivSecondBrain } from "./skriv-second-brain";
import { sorterInbox, type InboxRapport } from "./inbox-sortering";
import { skrivVenterPaaDeg } from "./venter-paa-deg";

// ── Konfigurasjon fra env ──────────────────────────────────────────────────

function krevEnv(navn: string): string {
  const v = process.env[navn];
  if (!v) throw new Error(`Mangler påkrevd env-variabel: ${navn}`);
  return v;
}

const SUPABASE_URL = krevEnv("MEG_SUPABASE_URL");
const SUPABASE_KEY = krevEnv("MEG_SUPABASE_SERVICE_ROLE_KEY");
const AK_BRAIN_PATH =
  process.env.AK_BRAIN_PATH ?? path.join(os.homedir(), "ak-brain");
const AK_SECOND_BRAIN_PATH =
  process.env.AK_SECOND_BRAIN_PATH ??
  path.join(os.homedir(), "Developer", "ak-second-brain");
const ARBEIDSLOGG_PATH = path.join(AK_BRAIN_PATH, "Arbeidslogg");

// ── Hjelpefunksjoner ───────────────────────────────────────────────────────

function datoIOslo(isoString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoString));
}

function grupperEtterDato(rader: LogRad[]): Map<string, LogRad[]> {
  const map = new Map<string, LogRad[]>();
  for (const rad of rader) {
    const dato = datoIOslo(rad.created_at);
    if (!map.has(dato)) map.set(dato, []);
    map.get(dato)!.push(rad);
  }
  return map;
}

async function verifiserKolonne(db: SupabaseClient): Promise<void> {
  const { error } = await db.from("me_log").select("destilled_at").limit(0);
  if (
    error &&
    (error.message.includes("destilled_at") || error.message.includes("column"))
  ) {
    console.error(
      "❌ Kolonnen 'destilled_at' mangler i me_log.\n" +
        "   Kjør migration én gang via Supabase SQL Editor:\n" +
        "   scripts/meg-tilbakeskriving/migration.sql",
    );
    process.exit(1);
  }
}

async function hentUprosesserte(db: SupabaseClient): Promise<LogRad[]> {
  const { data, error } = await db
    .from("me_log")
    .select("id, kind, text, value_num, value_unit, tags, source, created_at")
    .is("destilled_at", null)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw new Error(`Supabase-feil ved henting: ${error.message}`);
  return (data ?? []) as LogRad[];
}

async function markerProsessert(
  db: SupabaseClient,
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await db
    .from("me_log")
    .update({ destilled_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(`Supabase-feil ved markering: ${error.message}`);
}

async function skrivRapport(dato: string, linjer: string[]): Promise<void> {
  await mkdir(ARBEIDSLOGG_PATH, { recursive: true });
  const ts = new Date().toISOString().slice(11, 16).replace(":", "");
  const filsti = path.join(ARBEIDSLOGG_PATH, `meg-tilbakeskriving-${dato}-${ts}.md`);
  const innhold = `# Meg tilbakeskrivings-rapport ${dato}\n\n${linjer.join("\n")}\n`;
  await writeFile(filsti, innhold, "utf-8");
  console.log(`[rapport] skrevet → ${filsti}`);
}

async function oppdaterVenterPaaDeg(
  dato: string,
  dagensDestillat: string | null,
  inbox: InboxRapport,
): Promise<void> {
  try {
    await skrivVenterPaaDeg(dato, AK_BRAIN_PATH, {
      dagsnotat: dagensDestillat,
      uavklartInbox: inbox.uavklart,
    });
  } catch (err) {
    console.warn(
      `[venter] ⚠️ Venter på deg feilet (ikke kritisk): ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// ── Hoved ─────────────────────────────────────────────────────────────────

async function main() {
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await verifiserKolonne(db);

  // Steg 0: tøm inbox — klassifiser noter til domene-MOC-er (Ollama lokalt,
  // Claude-fallback). Feil her skal aldri stoppe tilbakeskrivingen.
  let inboxRapport: InboxRapport = { sortert: [], uavklart: [], feil: [] };
  try {
    inboxRapport = await sorterInbox(AK_BRAIN_PATH);
  } catch (err) {
    console.warn(
      `[inbox] ⚠️ Sortering feilet (fortsetter): ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const rader = await hentUprosesserte(db);
  const dagensDato = datoIOslo(new Date().toISOString());
  if (rader.length === 0) {
    console.log("[meg:tilbakeskriv] Ingen uprosesserte rader.");
    await oppdaterVenterPaaDeg(dagensDato, null, inboxRapport);
    return;
  }

  console.log(`[meg:tilbakeskriv] Fant ${rader.length} rader fordelt på dager.`);
  const grupper = grupperEtterDato(rader);

  const rapportLinjer: string[] = [
    `Kjørt: ${new Date().toISOString()}`,
    "",
  ];
  let totaltDagsnotater = 0;
  let totaltMonstre = 0;
  let totaltStoy = 0;
  let totaltFeil = 0;
  let dagensDestillat: string | null = null;

  for (const [dato, dagsRader] of grupper) {
    console.log(`\n[${dato}] Prosesserer ${dagsRader.length} rader...`);
    try {
      const destillert = await destiller(dagsRader);

      await skrivAkBrain(dato, destillert.dagsnotat, AK_BRAIN_PATH);

      if (destillert.varige_monstre.length > 0) {
        try {
          await skrivSecondBrain(dato, destillert.varige_monstre, AK_SECOND_BRAIN_PATH);
        } catch (sbErr) {
          const msg = sbErr instanceof Error ? sbErr.message : String(sbErr);
          console.warn(`[${dato}] ⚠️ second-brain feilet (ak-brain OK, markeres prosessert): ${msg}`);
          rapportLinjer.push(`## ${dato}`, `- ⚠️ second-brain-feil: ${msg}`, "");
        }
      }

      await markerProsessert(db, dagsRader.map((r) => r.id));

      if (dato === dagensDato) dagensDestillat = destillert.dagsnotat;
      totaltDagsnotater += 1;
      totaltMonstre += destillert.varige_monstre.length;
      totaltStoy += destillert.stoy_antall;

      rapportLinjer.push(
        `## ${dato}`,
        `- Rader: ${dagsRader.length}`,
        `- Dagsnotat: ✅`,
        `- Varige mønstre: ${destillert.varige_monstre.length}`,
        `- Støy: ${destillert.stoy_antall}`,
        "",
      );
    } catch (err) {
      totaltFeil += 1;
      const melding = err instanceof Error ? err.message : String(err);
      console.error(`[${dato}] ❌ FEIL (rader IKKE markert prosessert): ${melding}`);
      rapportLinjer.push(`## ${dato}`, `- ❌ FEIL: ${melding}`, "");
    }
  }

  // Steg siste: «Venter på deg» — maks 3 aksjonspunkter i dagens notat.
  await oppdaterVenterPaaDeg(dagensDato, dagensDestillat, inboxRapport);

  rapportLinjer.push(
    "---",
    `**Inbox:** ${inboxRapport.sortert.length} sortert · ${inboxRapport.uavklart.length} uavklart · ${inboxRapport.feil.length} feil`,
    `**Totalt:** ${totaltDagsnotater} dagsnotater · ${totaltMonstre} mønstre · ${totaltStoy} støy · ${totaltFeil} feil`,
  );
  await skrivRapport(dagensDato, rapportLinjer);

  console.log(
    `\n[meg:tilbakeskriv] Ferdig. ${totaltDagsnotater} dager · ${totaltMonstre} mønstre · ${totaltFeil} feil.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[meg:tilbakeskriv] Kritisk feil:", err);
    process.exit(1);
  });
