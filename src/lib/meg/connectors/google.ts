// src/lib/meg/connectors/google.ts
// Gmail + Google Disk for Meg. Gjenbruker ADMIN-brukerens Google-tilkobling
// (GoogleCalendarConnection). Les-funksjoner kjøres direkte; skrive (send
// e-post, opprett fil) kalles KUN via bekreftelsesflyt (confirm.ts).
import "server-only";
import { prisma } from "@/lib/prisma";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";
import { getGmailApi, buildRawMessage } from "@/lib/google-gmail";
import { getDriveApi } from "@/lib/google-drive";
import { getCalendarApi } from "@/lib/google-calendar";

async function getOwnerConnection(): Promise<GoogleCalendarConnection | null> {
  const conn = await prisma.googleCalendarConnection.findFirst({
    where: { user: { role: "ADMIN" }, status: "ACTIVE" },
  });
  return conn;
}

function headerValue(headers: { name?: string | null; value?: string | null }[] | undefined, name: string): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === name.toLowerCase());
  return h?.value ?? "";
}

// ── Gmail: les (direkte) ─────────────────────────────────────────────────────

export async function gmailSok(query: string, limit = 5): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const gmail = getGmailApi(conn);
    const list = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: Math.min(Math.max(limit, 1), 10),
    });
    const msgs = list.data.messages ?? [];
    if (msgs.length === 0) return `Ingen e-post for "${query}".`;
    const linjer = await Promise.all(
      msgs.map(async (m) => {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: m.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });
        const h = full.data.payload?.headers ?? undefined;
        const fra = headerValue(h, "From");
        const emne = headerValue(h, "Subject") || "(uten emne)";
        const snippet = full.data.snippet ?? "";
        return `- ${emne} — fra ${fra} [tråd:${m.threadId}]\n  ${snippet.slice(0, 140)}`;
      }),
    );
    return linjer.join("\n");
  } catch (err) {
    return `Gmail-søk feilet: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function gmailLesTraad(threadId: string): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const gmail = getGmailApi(conn);
    const thread = await gmail.users.threads.get({ userId: "me", id: threadId, format: "full" });
    const msgs = thread.data.messages ?? [];
    if (msgs.length === 0) return "Tom tråd.";
    return msgs
      .map((m) => {
        const h = m.payload?.headers ?? undefined;
        const fra = headerValue(h, "From");
        const dato = headerValue(h, "Date");
        return `Fra ${fra} (${dato}):\n${m.snippet ?? ""}`;
      })
      .join("\n\n");
  } catch (err) {
    return `Kunne ikke lese tråd: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Gmail: send (KUN via bekreftelse) ────────────────────────────────────────

export async function gmailSend(args: { til: string; emne: string; tekst: string }): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const gmail = getGmailApi(conn);
    const raw = buildRawMessage(args);
    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    return `Sendt e-post til ${args.til}: "${args.emne}".`;
  } catch (err) {
    return `Kunne ikke sende e-post: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Kalender: les (direkte) ──────────────────────────────────────────────────

export async function kalenderAgenda(dager = 1): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const cal = getCalendarApi(conn);
    const naa = new Date();
    const til = new Date(naa.getTime() + Math.min(Math.max(dager, 1), 30) * 24 * 60 * 60 * 1000);

    // Hent alle kalendere og spørr hver enkelt — "primary" er bare én av mange
    const kalListRes = await cal.calendarList.list({ maxResults: 50 });
    const kalenderIds = (kalListRes.data.items ?? [])
      .map((k) => k.id)
      .filter((id): id is string => !!id);

    type EventItem = { start: string; tekst: string; eid: string };
    const alle: EventItem[] = [];

    // allSettled: én 403 (delt kalender) kansellerer ikke de andre
    await Promise.allSettled(
      kalenderIds.map(async (calendarId) => {
        const res = await cal.events.list({
          calendarId,
          timeMin: naa.toISOString(),
          timeMax: til.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 20,
        });
        for (const e of res.data.items ?? []) {
          const start = e.start?.dateTime ?? e.start?.date ?? "";
          const naar =
            start.length > 10
              ? new Date(start).toLocaleString("sv-SE", {
                  timeZone: "Europe/Oslo",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : start;
          alle.push({
            start,
            tekst: `- ${naar}: ${e.summary ?? "(uten tittel)"}${e.location ? ` @ ${e.location}` : ""}`,
            eid: e.iCalUID ?? e.id ?? "",
          });
        }
      }),
    );

    // Dedup: samme hendelse kan dukke opp fra primary + delte kalendere
    const seenIds = new Set<string>();
    const deduped = alle.filter((e) => {
      if (!e.eid) return true;
      if (seenIds.has(e.eid)) return false;
      seenIds.add(e.eid);
      return true;
    });

    if (deduped.length === 0) return `Ingen hendelser de neste ${dager} dagene.`;
    deduped.sort((a, b) => a.start.localeCompare(b.start));
    return deduped.map((e) => e.tekst).join("\n");
  } catch (err) {
    return `Kunne ikke lese kalender: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Disk: les (direkte) ──────────────────────────────────────────────────────

export async function diskSok(query: string, limit = 5): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const drive = getDriveApi(conn);
    const res = await drive.files.list({
      q: `name contains '${query.replace(/'/g, "\\'")}' and trashed = false`,
      pageSize: Math.min(Math.max(limit, 1), 10),
      fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
    });
    const files = res.data.files ?? [];
    if (files.length === 0) return `Ingen filer for "${query}".`;
    return files.map((f) => `- ${f.name} [${f.id}]${f.webViewLink ? ` (${f.webViewLink})` : ""}`).join("\n");
  } catch (err) {
    return `Disk-søk feilet: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function diskLesFil(fileId: string): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const drive = getDriveApi(conn);
    const meta = await drive.files.get({ fileId, fields: "name, mimeType" });
    const mimeType = meta.data.mimeType ?? "";
    let text: string;
    if (mimeType.startsWith("application/vnd.google-apps")) {
      const res = await drive.files.export({ fileId, mimeType: "text/plain" }, { responseType: "text" });
      text = String(res.data);
    } else {
      const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "text" });
      text = String(res.data);
    }
    return text.slice(0, 4000) || "(tom fil)";
  } catch (err) {
    return `Kunne ikke lese fil: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Disk: opprett (KUN via bekreftelse) ──────────────────────────────────────

export async function diskOpprett(args: { navn: string; innhold: string }): Promise<string> {
  const conn = await getOwnerConnection();
  if (!conn) return "Google er ikke koblet (ingen aktiv ADMIN-tilkobling).";
  try {
    const drive = getDriveApi(conn);
    const res = await drive.files.create({
      requestBody: { name: args.navn, mimeType: "text/plain" },
      media: { mimeType: "text/plain", body: args.innhold },
      fields: "id, webViewLink",
    });
    const link = res.data.webViewLink;
    return `Opprettet fil "${args.navn}" i Disk${link ? ` (${link})` : ""}.`;
  } catch (err) {
    return `Kunne ikke opprette fil: ${err instanceof Error ? err.message : String(err)}`;
  }
}
