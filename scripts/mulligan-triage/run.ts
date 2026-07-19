/**
 * Mulligan e-post-triage.
 *
 * Klassifiserer uleste e-poster til Mulligan Indoor Golf som booking/drift/
 * generelt (LOKALT via Ollama — se klassifiser.ts for PII-begrunnelsen).
 * Booking-forespørsler får et Gmail-UTKAST med konkrete, kalender-
 * verifiserte ledige tider. Drift/generelt logges for manuell oppfølging.
 * Sender ALDRI e-post — kun utkast Anders godkjenner og sender selv.
 *
 * SMS er IKKE en del av denne bølgen: ingen SMS-leverandør er integrert i
 * repoet ennå. Når én finnes, er triage-klassifiseringen (klassifiser.ts)
 * allerede leverandør-uavhengig og kan gjenbrukes — kun en ny inntaksvei
 * (SMS → tekst) trengs, ikke en ny klassifiserer.
 *
 * Kjør: npm run mulligan:triage
 * LaunchAgent-mal: com.akgolf.mulligan-triage.plist (samme mappe).
 */
import "../_env";
import type { gmail_v1 } from "googleapis";
import { getGmailApi } from "@/lib/google-gmail";
import type { Tidsvindu } from "@/lib/mulligan/ledige-tider";
import { hentAdminGoogleTilkobling } from "./google-tilkobling";
import { lesMulliganTriageEnv } from "./env";
import { klassifiserEpost } from "./klassifiser";
import { finnLedigeTider } from "./kalender";
import { opprettSvarUtkast } from "./gmail-utkast";

const SYV_DAGER_MS = 7 * 24 * 60 * 60 * 1000;

function headerValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, navn: string): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === navn.toLowerCase());
  return h?.value ?? "";
}

/** Rekursivt uttrekk av tekstinnhold (text/plain foretrukket, text/html som fallback). */
function finnTekstDel(part: gmail_v1.Schema$MessagePart | undefined): string | null {
  if (!part) return null;
  if (part.mimeType === "text/plain" && part.body?.data) {
    return Buffer.from(part.body.data, "base64url").toString("utf8");
  }
  if (part.parts) {
    for (const p of part.parts) {
      const funnet = finnTekstDel(p);
      if (funnet) return funnet;
    }
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return Buffer.from(part.body.data, "base64url").toString("utf8").replace(/<[^>]+>/g, " ");
  }
  return null;
}

function hentEpostTekst(message: gmail_v1.Schema$Message): string {
  return finnTekstDel(message.payload) ?? message.snippet ?? "";
}

function formatterKlokkeslett(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(
    dato,
  );
}

function formatterDagOgTid(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dato);
}

/**
 * Bygger svarteksten for et booking-utkast. Kun konkrete, verifiserte ledige
 * tider — ALDRI pris/vilkår/refusjon (jf. mulligan-drift.md), og ALDRI en
 * bekreftelse av booking (kunden velger, Anders/systemet bekrefter etterpå).
 */
function byggBookingSvarTekst(ledigeVinduer: Tidsvindu[]): string {
  const forslag = ledigeVinduer
    .slice(0, 5)
    .map((v) => `- ${formatterDagOgTid(v.start)}–${formatterKlokkeslett(v.slutt)}`)
    .join("\n");
  return [
    "Hei,",
    "",
    "Takk for henvendelsen! Her er noen ledige tider hos oss den kommende uken:",
    "",
    forslag,
    "",
    "Si gjerne fra hvilken tid som passer deg, så ordner vi det videre.",
    "",
    "Mvh,",
    "Mulligan Indoor Golf",
  ].join("\n");
}

/**
 * Sender kjøre-oppsummeringen til Anders på Telegram. Gjenbruker samme
 * Meg-bot (MEG_TELEGRAM_BOT_TOKEN/MEG_TELEGRAM_ALLOWED_CHAT_ID) fremfor å
 * kreve en egen Mulligan-bot. HTTP-kallet er kopiert fra
 * sendTelegramMessage() i src/lib/meg/telegram.ts (samme mønster) — den
 * fila har `import "server-only"` og kan ikke importeres av et rent
 * tsx-script (se google-tilkobling.ts-kommentaren for samme begrensning).
 * Mangler env eller feiler kallet: logg og fortsett — aldri en hard
 * avhengighet, kjøringen har uansett logget alt i konsollen/loggfilen.
 */
async function sendTelegramOppsummering(tekst: string): Promise<void> {
  const botToken = process.env.MEG_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MEG_TELEGRAM_ALLOWED_CHAT_ID;
  if (!botToken || !chatId) {
    console.log("[mulligan-triage] Telegram-env mangler — hopper over oppsummering (se konsoll-logg over).");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: tekst }),
    });
    if (!res.ok) {
      console.error("[mulligan-triage] Telegram sendMessage feilet:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[mulligan-triage] Telegram-kall feilet:", err instanceof Error ? err.message : err);
  }
}

async function main() {
  const env = lesMulliganTriageEnv();

  const conn = await hentAdminGoogleTilkobling();
  if (!conn) {
    console.error("[mulligan-triage] Ingen aktiv Google-tilkobling (ADMIN) — kan ikke hente e-post. Avbryter.");
    await sendTelegramOppsummering(
      "⚠️ Mulligan e-post-triage kunne ikke kjøre: ingen aktiv Google-tilkobling. Koble til på nytt i AgencyOS.",
    );
    return;
  }

  const gmail = getGmailApi(conn);
  let meldinger: gmail_v1.Schema$Message[] = [];
  try {
    const liste = await gmail.users.messages.list({ userId: "me", q: env.gmailQuery, maxResults: 25 });
    meldinger = liste.data.messages ?? [];
  } catch (err) {
    console.error("[mulligan-triage] Kunne ikke liste e-post:", err instanceof Error ? err.message : err);
    await sendTelegramOppsummering("⚠️ Mulligan e-post-triage kunne ikke liste e-post fra Gmail. Sjekk manuelt.");
    return;
  }

  console.log(`[mulligan-triage] Fant ${meldinger.length} e-post(er) å vurdere (søk: "${env.gmailQuery}").`);

  let bookingUtkast = 0;
  let bookingManuell = 0;
  let driftFlagget = 0;
  let generelt = 0;
  let uklassifisert = 0;

  for (const m of meldinger) {
    if (!m.id) continue;
    try {
      const full = await gmail.users.messages.get({ userId: "me", id: m.id, format: "full" });
      const headers = full.data.payload?.headers ?? undefined;
      const emne = headerValue(headers, "Subject") || "(uten emne)";
      const tekst = hentEpostTekst(full.data);
      const threadId = full.data.threadId ?? m.id;

      const klasse = await klassifiserEpost(emne, tekst);
      if (!klasse) {
        uklassifisert++;
        console.log(`[mulligan-triage] Uklassifisert (Ollama feilet/usikker) — "${emne}". Krever manuell vurdering.`);
        continue;
      }

      if (klasse === "booking") {
        const naa = new Date();
        const ledige = await finnLedigeTider(naa, new Date(naa.getTime() + SYV_DAGER_MS));
        if (!ledige || ledige.length === 0) {
          bookingManuell++;
          console.log(
            `[mulligan-triage] Booking "${emne}" — ingen verifisert ledig tid funnet (eller kalender-sjekk feilet). Hopper over utkast, krever manuell oppfølging.`,
          );
          continue;
        }
        const ok = await opprettSvarUtkast(threadId, m.id, byggBookingSvarTekst(ledige));
        if (ok) {
          bookingUtkast++;
          console.log(`[mulligan-triage] Booking-utkast opprettet for "${emne}".`);
        } else {
          bookingManuell++;
          console.log(`[mulligan-triage] Booking-utkast FEILET for "${emne}" — krever manuell oppfølging.`);
        }
      } else if (klasse === "drift") {
        driftFlagget++;
        console.log(`[mulligan-triage] DRIFT/feilmelding flagget: "${emne}" — ingen automatisk handling.`);
      } else {
        generelt++;
        console.log(`[mulligan-triage] Generelt: "${emne}" — logget for manuell oppfølging.`);
      }
    } catch (err) {
      uklassifisert++;
      console.error(`[mulligan-triage] Feil ved behandling av e-post ${m.id}:`, err instanceof Error ? err.message : err);
    }
  }

  const oppsummering =
    `Mulligan e-post-triage ferdig: ${bookingUtkast} booking-utkast opprettet · ` +
    `${bookingManuell} booking krever manuell oppfølging · ${driftFlagget} drift-saker flagget · ` +
    `${generelt} generelt · ${uklassifisert} uklassifisert/feilet.`;
  console.log(`[mulligan-triage] ${oppsummering}`);
  await sendTelegramOppsummering(oppsummering);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[mulligan-triage] Kritisk feil:", err);
    process.exit(1);
  });
