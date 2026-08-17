/**
 * iMessage/SMS-innsamler for Jarvis' "Saker"-kø (steg 2 av jarvis-masterplan.md,
 * DEL A steg 2). Leser macOS' lokale Meldinger-database (`chat.db`) direkte —
 * INGEN skyleverandør, INGEN kall til Beeper eller andre tredjeparter.
 *
 * VALG AV KILDE (undersøkt empirisk 2026-08-16, se README "iMessage/SMS —
 * status"): Beeper Desktop sin lokale HTTP-API ble vurdert som et bredere
 * alternativ (dekker flere kanaler enn ren iMessage/SMS), men krever at
 * Beeper Desktop-appen faktisk kjører og har API-et skrudd på — en GUI-
 * avhengighet som passer dårlig med en headless LaunchAgent. Beeper-appen
 * kjørte ikke og lyttet ikke på noen lokal port under undersøkelsen.
 * `chat.db` er macOS' egen database og krever kun Full Disk Access — ingen
 * ekstra app må holdes åpen. Derfor: `chat.db` er valgt kilde.
 *
 * TILGANG PÅ BYGGETIDSPUNKTET: Full Disk Access er IKKE gitt til prosessen
 * som bygget dette scriptet (bekreftet: både `sqlite3 chat.db` og
 * `node:sqlite` feilet med "unable to open database file"/"authorization
 * denied"). Skjemaet under (message/handle-tabellene, kolonnenavn,
 * dato-format, attributedBody-fallback) er derfor basert på macOS' offentlig
 * dokumenterte chat.db-struktur — IKKE verifisert mot ekte data i denne
 * økten. Se README for sjekkliste for å gi tilgang, og test på nytt (npm run
 * saker:imessage) når den er gitt.
 *
 * Leser aldri utgående meldinger (is_from_me). Oppretter ALDRI/sender ALDRI
 * noe i Meldinger — kun leser og lager `Sak`-rader.
 *
 * Kjør: npm run saker:imessage
 */
import "../_env";
import { DatabaseSync } from "node:sqlite";
import { homedir } from "node:os";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { SAKER_SLA_TIMER } from "./env";
import type { $Enums } from "@/generated/prisma/client";

const CHAT_DB_PATH = join(homedir(), "Library", "Messages", "chat.db");
const EN_TIME_MS = 60 * 60 * 1000;
const TO_DAGER_MS = 2 * 24 * 60 * 60 * 1000;

/** Sekunder fra Unix-epoke (1970-01-01) til Apple-epoke (2001-01-01). */
const APPLE_EPOKE_FORSKYVNING_SEKUNDER = 978307200;

type ChatDbRad = {
  rowid: number;
  text: string | null;
  attributedBody: Uint8Array | null;
  date: number;
  service: string | null;
  handle: string | null;
};

/**
 * Nyere macOS (Big Sur+) lagrer ofte meldingsteksten KUN i `attributedBody`
 * (en arkivert NSAttributedString), ikke i `text`-kolonnen. Dette er en
 * best-effort-utpakking av ren tekst fra den binære archiveren — et kjent,
 * mye brukt mønster i tredjeparts chat.db-lesere, men IKKE testet mot ekte
 * data her (se filhode). Returnerer null hvis mønsteret ikke gjenkjennes —
 * kalleren logger og hopper over meldingen fremfor å gjette innholdet.
 */
function pakkUtAttributedBodyTekst(blob: Uint8Array): string | null {
  try {
    const buf = Buffer.from(blob);
    const raa = buf.toString("utf8");
    const markorIndeks = raa.indexOf("NSString");
    if (markorIndeks === -1) return null;
    // Etter "NSString"-markøren følger typisk noen kontrollbyte og så selve
    // teksten frem til neste arkiv-nøkkel ("NSDictionary"/"NSNumber" e.l.)
    // eller en kontroll-byte-sekvens. Vi tar en konservativ substring og
    // trimmer bort ikke-utskrivbare tegn i endene.
    const etterMarkor = raa.slice(markorIndeks + "NSString".length);
    const nesteNokkel = etterMarkor.search(/NSDictionary|NSNumber|NSAttributeName|iI/);
    const kandidat = (nesteNokkel > 0 ? etterMarkor.slice(0, nesteNokkel) : etterMarkor.slice(0, 500))
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
      .trim();
    return kandidat.length > 0 ? kandidat : null;
  } catch {
    return null;
  }
}

function tilSakKanal(service: string | null): $Enums.SakKanal {
  return service === "iMessage" ? "IMESSAGE" : "SMS";
}

async function sendTelegramOppsummering(tekst: string): Promise<void> {
  const botToken = process.env.MEG_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MEG_TELEGRAM_ALLOWED_CHAT_ID;
  if (!botToken || !chatId) {
    console.log("[saker-imessage] Telegram-env mangler — hopper over oppsummering (se konsoll-logg over).");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: tekst }),
    });
    if (!res.ok) {
      console.error("[saker-imessage] Telegram sendMessage feilet:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[saker-imessage] Telegram-kall feilet:", err instanceof Error ? err.message : err);
  }
}

async function main() {
  const naa = new Date();
  const cutoffApple = Math.floor(
    (naa.getTime() - TO_DAGER_MS) / 1000 - APPLE_EPOKE_FORSKYVNING_SEKUNDER,
  ) * 1_000_000_000;

  let db: DatabaseSync;
  try {
    db = new DatabaseSync(CHAT_DB_PATH, { readOnly: true });
  } catch (err) {
    console.error(
      "[saker-imessage] Kan ikke åpne chat.db — mangler sannsynligvis Full Disk Access. Avbryter:",
      err instanceof Error ? err.message : err,
    );
    await sendTelegramOppsummering(
      "⚠️ Saker-innsamler (iMessage/SMS) kunne ikke åpne Meldinger-databasen. Full Disk Access mangler trolig — se README-sjekkliste.",
    );
    return;
  }

  let rader: ChatDbRad[] = [];
  try {
    const stmt = db.prepare(`
      SELECT m.ROWID AS rowid, m.text AS text, m.attributedBody AS attributedBody,
             m.date AS date, m.service AS service, h.id AS handle
      FROM message m
      LEFT JOIN handle h ON h.ROWID = m.handle_id
      WHERE m.is_from_me = 0 AND m.date > ?
      ORDER BY m.date DESC
      LIMIT 200
    `);
    rader = stmt.all(cutoffApple) as unknown as ChatDbRad[];
  } catch (err) {
    console.error("[saker-imessage] Spørring mot chat.db feilet:", err instanceof Error ? err.message : err);
    await sendTelegramOppsummering("⚠️ Saker-innsamler (iMessage/SMS) — spørring mot chat.db feilet. Sjekk manuelt.");
    db.close();
    return;
  }
  db.close();

  console.log(`[saker-imessage] Fant ${rader.length} innkommende melding(er) siste 2 døgn.`);

  let nyeSaker = 0;
  let hoppetOverDuplikat = 0;
  let hoppetOverUleselig = 0;
  let feilet = 0;

  for (const rad of rader) {
    try {
      const kanal = tilSakKanal(rad.service);
      const kildeId = String(rad.rowid);

      const finnesAllerede = await prisma.sak.findFirst({
        where: { kanal, kildeId },
        select: { id: true },
      });
      if (finnesAllerede) {
        hoppetOverDuplikat++;
        continue;
      }

      const tekst = rad.text ?? (rad.attributedBody ? pakkUtAttributedBodyTekst(rad.attributedBody) : null);
      if (!tekst) {
        hoppetOverUleselig++;
        console.log(`[saker-imessage] Melding ${rad.rowid} har ingen lesbar tekst (vedlegg/rik tekst?) — hopper over.`);
        continue;
      }

      await prisma.sak.create({
        data: {
          kanal,
          avsender: rad.handle ?? null,
          emne: null,
          innhold: tekst,
          status: "VENTER",
          kildeId,
          frist: new Date(naa.getTime() + SAKER_SLA_TIMER * EN_TIME_MS),
          provenance: { kilde: "imessage-innsamler", kjort: naa.toISOString() },
        },
      });
      nyeSaker++;
      console.log(`[saker-imessage] Ny sak (${kanal}) fra ${rad.handle ?? "ukjent"}.`);
    } catch (err) {
      feilet++;
      console.error(`[saker-imessage] Feil ved behandling av melding ${rad.rowid}:`, err instanceof Error ? err.message : err);
    }
  }

  const oppsummering =
    `Saker-innsamler (iMessage/SMS) ferdig: ${nyeSaker} nye saker · ${hoppetOverDuplikat} allerede i køen · ` +
    `${hoppetOverUleselig} uleselig innhold · ${feilet} feilet.`;
  console.log(`[saker-imessage] ${oppsummering}`);
  await sendTelegramOppsummering(oppsummering);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[saker-imessage] Kritisk feil:", err);
    process.exit(1);
  });
