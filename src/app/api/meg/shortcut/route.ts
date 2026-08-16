// src/app/api/meg/shortcut/route.ts
// «Spør Jarvis» — tynn inngang for iOS Snarveier (Siri fra Apple Watch/bil).
// Speiler kjeden i api/meg/telegram/route.ts (rate-limit → BEKREFT-håndtering
// → lokal snarvei → full agent), men uten Telegram-transport: svaret går
// tilbake i HTTP-responsen så Shortcuts kan lese det opp direkte.
//
// Bruker SAMME subject som Telegram-kanalen (admin-personen i allowlisten),
// slik at samtalehistorikk og ventende BEKREFT-handlinger deles på tvers av
// kanaler — «BEKREFT» sagt til Siri kan bekrefte noe Jarvis foreslo på Telegram.
import { NextResponse } from "next/server";
import { readMegEnv, readMegShortcutEnv } from "@/lib/meg/env";
import { shortcutTokenOk } from "@/lib/meg/shortcut-auth";
import { parsePersoner } from "@/lib/meg/access";
import { storeConversation } from "@/lib/meg/store";
import { hentSamtaleHistorikk } from "@/lib/meg/read";
import { runMegAgent } from "@/lib/meg/agent";
import { handleConfirmation } from "@/lib/meg/confirm";
import { tryLocalFastPath } from "@/lib/meg/router";
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

type ShortcutBody = { melding?: unknown };

/** Admin-personen (Anders) i allowlisten — samme identitet som Telegram-kanalen. */
function adminPerson() {
  return parsePersoner().find((p) => p.rolle === "admin") ?? null;
}

export async function POST(req: Request) {
  const shortcutEnv = readMegShortcutEnv();
  if (!shortcutEnv) {
    return NextResponse.json({ feil: "ikke konfigurert" }, { status: 503 });
  }

  if (!shortcutTokenOk(req.headers.get("authorization"), shortcutEnv.token)) {
    return NextResponse.json({ feil: "uautorisert" }, { status: 401 });
  }

  const rl = await rateLimit({ key: "meg-shortcut", max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { feil: "for mange forespørsler, prøv igjen om litt" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  let body: ShortcutBody;
  try {
    body = (await req.json()) as ShortcutBody;
  } catch {
    return NextResponse.json({ feil: "ugyldig JSON" }, { status: 400 });
  }

  const melding = typeof body.melding === "string" ? body.melding.trim() : "";
  if (!melding) {
    return NextResponse.json({ feil: "mangler melding" }, { status: 400 });
  }

  const env = readMegEnv();
  const person = adminPerson();
  if (!env || !person) {
    return NextResponse.json({ feil: "meg er ikke konfigurert" }, { status: 503 });
  }
  const subject = person.chatId;
  const start = Date.now();

  await storeConversation("user", melding, subject);

  // Bekreftelsesflyt: «BEKREFT»/avbryt på en ventende skrive-handling —
  // felles med Telegram, siden begge kanaler deler subject.
  const confirmReply = await handleConfirmation(melding, subject);
  if (confirmReply !== null) {
    await storeConversation("assistant", confirmReply, subject);
    console.info("[meg/shortcut] bekreftelse", { ms: Date.now() - start });
    return NextResponse.json({ svar: confirmReply });
  }

  // Lokal snarvei: enkle logg-meldinger håndteres billig uten å vekke agenten.
  const fastPath = await tryLocalFastPath({ text: melding, subject });
  if (fastPath !== null) {
    await storeConversation("assistant", fastPath.reply, subject);
    console.info("[meg/shortcut] lokal snarvei", { engine: fastPath.engine, ms: Date.now() - start });
    return NextResponse.json({ svar: fastPath.reply });
  }

  const history = await hentSamtaleHistorikk(subject, 20);
  // Fjern siste user-melding fra historikk (lagret rett over, sendes separat til agenten)
  const trimmedHistory = history.filter((_, i) => i < history.length - 1);

  const result = await runMegAgent({
    text: melding,
    history: trimmedHistory,
    subject,
    navn: person.navn,
    rolle: person.rolle,
  });

  if (!result.ok) {
    await logError({
      context: "meg.shortcut.agent-feil",
      error: result.error,
      meta: { lengde: melding.length },
    });
    console.info("[meg/shortcut] feil", { ms: Date.now() - start });
    return NextResponse.json({ feil: "noe gikk galt, prøv igjen" }, { status: 502 });
  }

  console.info("[meg/shortcut] svar", { lengde: melding.length, ms: Date.now() - start });
  return NextResponse.json({ svar: result.text });
}
