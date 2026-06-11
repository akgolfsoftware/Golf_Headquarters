/**
 * Diagnostiserer Google Kalender-tilkoblingen for Meg.
 * Viser hvilke kalendere som er tilgjengelig + hendelser i dag.
 *
 * Kjør: npx tsx scripts/meg-kalender-diagnose.ts
 */

import "./_env";
import { prisma } from "@/lib/prisma";
import { getCalendarApi } from "@/lib/google-calendar";

async function main() {
  // 1. Finn ADMIN-tilkoblingen
  const conn = await prisma.googleCalendarConnection.findFirst({
    where: { user: { role: "ADMIN" }, status: "ACTIVE" },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!conn) {
    console.error("❌ Ingen aktiv ADMIN Google-tilkobling funnet i databasen.");
    console.log("   Gå til /admin/innstillinger og koble til Google på nytt.");
    process.exit(1);
  }

  console.log(`✅ Tilkobling funnet for: ${conn.user.email ?? conn.user.name}`);
  console.log(`   Status: ${conn.status} | Opprettet: ${conn.createdAt.toISOString().slice(0, 10)}\n`);

  const cal = getCalendarApi(conn);

  // 2. List alle kalendere
  console.log("── Tilgjengelige kalendere ──────────────────────────────");
  const listRes = await cal.calendarList.list({ maxResults: 20 });
  const kalendere = listRes.data.items ?? [];
  if (kalendere.length === 0) {
    console.log("Ingen kalendere funnet — token mangler kanskje calendar-scope.");
  }
  for (const k of kalendere) {
    console.log(`  [${k.id}]  ${k.summary ?? "(uten navn)"}  (primær: ${k.primary ? "ja" : "nei"})`);
  }

  // 3. Sjekk hendelser i dag på ALLE kalendere
  console.log("\n── Hendelser i dag (alle kalendere) ─────────────────────");
  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date();
  dagSlutt.setHours(23, 59, 59, 999);

  let totalt = 0;
  for (const k of kalendere) {
    if (!k.id) continue;
    const evRes = await cal.events.list({
      calendarId: k.id,
      timeMin: dagStart.toISOString(),
      timeMax: dagSlutt.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });
    const events = evRes.data.items ?? [];
    if (events.length > 0) {
      console.log(`\n  📅 ${k.summary} (${k.id}):`);
      for (const e of events) {
        const start = e.start?.dateTime ?? e.start?.date ?? "";
        const kl = start.length > 10 ? start.slice(11, 16) : start;
        console.log(`     ${kl}  ${e.summary ?? "(uten tittel)"}`);
        totalt++;
      }
    }
  }

  if (totalt === 0) {
    console.log("  Ingen hendelser i dag på noen kalender.");
    console.log("\n  Mulige årsaker:");
    console.log("  1. Google-kontoen som er koblet er ikke den du bruker til kalender");
    console.log("  2. Token er utløpt — koble til på nytt under /admin/innstillinger");
    console.log("  3. Hendelsene ligger i en delt kalender du ikke eier");
  } else {
    console.log(`\n✅ Fant ${totalt} hendelse(r) i dag.`);
    console.log("\n  Neste steg: oppdater kalenderAgenda() til å bruke riktig kalender-ID");
    console.log("  eller legg til MEG_CALENDAR_ID=<id> i .env.local");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error("Feil:", e instanceof Error ? e.message : e); process.exit(1); });
