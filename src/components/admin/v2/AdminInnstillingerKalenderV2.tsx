/**
 * AgencyOS v2 — Google Calendar-sync (`CalendarSyncSectionV2`, AgencyOS
 * Bølge 3.36, 2026-07-14). Port fra `(legacy)/settings/calendar/
 * calendar-sync-section.tsx` — samme Prisma-modell (`googleCalendarConnection`
 * + `subscriptions`), samme to steder den brukes: `/admin/settings/calendar`
 * OG `/admin/availability` (Tilgjengelighet), slik at én coach setter
 * arbeidstider og velger blokkerende kalendere på én skjerm.
 *
 * Async SERVER-komponent (ikke "use client") — kan derfor importeres direkte
 * av andre server-komponenter (`page.tsx`-filene), men IKKE av en klient-
 * komponent (se `AdminTilgjengelighetV2`, som tar den inn som en
 * `calendarSync`-slot-prop i stedet). Klient-delen (skjema/knapper) bor i
 * `AdminInnstillingerKalenderKlientV2.tsx`.
 */

import Link from "next/link";
import { Kort, Knapp, Icon, T } from "@/components/v2";
import { prisma } from "@/lib/prisma";
import { DisconnectKnappV2, SubscriptionsFormV2, type SubscriptionRowV2 } from "./AdminInnstillingerKalenderKlientV2";

function RadV2({ label, value, feil }: { label: string; value: string; feil?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>{label}</div>
      <div style={{ marginTop: 4, fontFamily: feil ? T.ui : T.mono, fontSize: 13, color: feil ? T.down : T.fg }}>{value}</div>
    </div>
  );
}

export async function CalendarSyncSectionV2({ userId, ok, error }: { userId: string; ok?: string; error?: string }) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    include: { subscriptions: { orderBy: [{ syncPush: "desc" }, { calendarName: "asc" }] } },
  });

  const rader: SubscriptionRowV2[] =
    conn?.subscriptions.map((s) => ({
      id: s.id,
      googleCalendarId: s.googleCalendarId,
      calendarName: s.calendarName,
      color: s.color,
      syncPush: s.syncPush,
      syncPull: s.syncPull,
      active: s.active,
      lastSyncAt: s.lastSyncAt ? s.lastSyncAt.toISOString() : null,
      lastError: s.lastError,
      watchExpiresAt: s.watchExpiresAt ? s.watchExpiresAt.toISOString() : null,
    })) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {ok === "1" && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 10, border: `1px solid ${T.lime}`, background: `color-mix(in srgb, ${T.lime} 8%, transparent)`, padding: 14, fontFamily: T.ui, fontSize: 13, color: T.fg }}>
          <Icon name="check-circle" size={16} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
          <span>Google Calendar er koblet til. Velg hvilke kalendere du vil synke.</span>
        </div>
      )}
      {error && (
        <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 10, border: `1px solid ${T.down}`, background: `color-mix(in srgb, ${T.down} 8%, transparent)`, padding: 14, fontFamily: T.ui, fontSize: 13, color: T.down }}>
          <Icon name="info" size={16} style={{ flex: "none", marginTop: 1 }} />
          <span>Kobling feilet: {error.replace(/-/g, " ")}</span>
        </div>
      )}

      {conn ? (
        <>
          <Kort>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, color: T.lime }}>
                  <Icon name="calendar-check" size={18} />
                </span>
                <div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Koblet til</div>
                  <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{conn.googleEmail}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Link href="/api/google-calendar/connect" style={{ display: "inline-flex", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "9px 16px", textDecoration: "none", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Koble på nytt</Link>
                <DisconnectKnappV2 />
              </div>
            </div>

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              <RadV2 label="Status" value={conn.status} />
              <RadV2 label="Siste sync" value={conn.lastSyncAt ? conn.lastSyncAt.toLocaleString("nb-NO", { dateStyle: "medium", timeStyle: "short" }) : "Aldri"} />
              <RadV2 label="Antall kalendere" value={String(rader.length)} />
              {conn.lastError && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <RadV2 label="Siste feil" value={conn.lastError} feil />
                </div>
              )}
            </div>
          </Kort>

          <SubscriptionsFormV2 rows={rader} />
        </>
      ) : (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 0", textAlign: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, color: T.lime }}>
              <Icon name="calendar-check" size={22} />
            </span>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>Ikke koblet til</div>
            <p style={{ maxWidth: 420, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
              Klikk under for å koble til Google Calendar. Du blir sendt til Google for å bekrefte tilgang. Vi ber om lese- og skrive-tilgang for å unngå dobbel-booking.
            </p>
            <Link href="/api/google-calendar/connect" style={{ marginTop: 6 }}>
              <Knapp>Koble til Google Calendar</Knapp>
            </Link>
          </div>
        </Kort>
      )}

      <Kort>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Slik fungerer det</div>
        <ol style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
          <li><span style={{ fontFamily: T.mono, color: T.fg }}>1.</span> <strong style={{ color: T.fg }}>Pull</strong> — kalendere med denne på blokkerer ledige slots i AK Golf HQ.</li>
          <li><span style={{ fontFamily: T.mono, color: T.fg }}>2.</span> <strong style={{ color: T.fg }}>Push</strong> — bekreftede bookinger pushes til kalendere med denne på.</li>
          <li><span style={{ fontFamily: T.mono, color: T.fg }}>3.</span> Endringer i Google (event flyttet eller slettet) reflekteres tilbake til Booking-tabellen via webhook.</li>
          <li><span style={{ fontFamily: T.mono, color: T.fg }}>4.</span> Du kan slå av individuelle kalendere uten å koble fra hele tilkoblingen.</li>
        </ol>
      </Kort>
    </div>
  );
}
