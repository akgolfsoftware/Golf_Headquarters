"use client";

/**
 * AgencyOS v2 — klient-delen av Google Calendar-sync (`SubscriptionsFormV2`,
 * `DisconnectKnappV2`). Del av AgencyOS Bølge 3.36 (2026-07-14). Port fra
 * `(legacy)/settings/calendar/subscriptions-form.tsx` + `disconnect-button.tsx`
 * — samme `oppdaterSubscriptions`/`refreshCalendarList`/
 * `disconnectGoogleCalendar`-kontrakt (bor i `(legacy)/settings/calendar/
 * actions.ts`, uendret).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Icon, T } from "@/components/v2";
import { oppdaterSubscriptions, refreshCalendarList, disconnectGoogleCalendar } from "@/app/admin/(legacy)/settings/calendar/actions";

export type SubscriptionRowV2 = {
  id: string;
  googleCalendarId: string;
  calendarName: string;
  color: string | null;
  syncPush: boolean;
  syncPull: boolean;
  active: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  watchExpiresAt: string | null;
};

type Beskjed = { tag: "ok" | "feil"; tekst: string };

export function DisconnectKnappV2() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function handleClick() {
    if (!confirm("Koble fra Google Calendar? Bookinger pushes ikke lenger.")) return;
    startTransition(async () => {
      await disconnectGoogleCalendar();
      router.refresh();
    });
  }
  return <Knapp ghost onClick={handleClick} disabled={pending}>{pending ? "Kobler fra …" : "Koble fra"}</Knapp>;
}

export function SubscriptionsFormV2({ rows }: { rows: SubscriptionRowV2[] }) {
  const router = useRouter();
  const initialPushId = rows.find((r) => r.syncPush && r.active)?.id ?? "";
  const initialPullIds = new Set(rows.filter((r) => r.syncPull && r.active).map((r) => r.id));

  const [pushId, setPushId] = useState<string>(initialPushId);
  const [pullIds, setPullIds] = useState<Set<string>>(initialPullIds);
  const [pending, startTransition] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const [beskjed, setBeskjed] = useState<Beskjed | null>(null);

  function togglePull(id: string) {
    setPullIds((prev) => {
      const ny = new Set(prev);
      if (ny.has(id)) ny.delete(id);
      else ny.add(id);
      return ny;
    });
  }

  function handleLagre() {
    setBeskjed(null);
    startTransition(async () => {
      const input = rows.map((r) => {
        const erPush = r.id === pushId;
        const erPull = pullIds.has(r.id);
        return { id: r.id, syncPush: erPush, syncPull: erPull, active: erPush || erPull };
      });
      const result = await oppdaterSubscriptions(input);
      if (result.ok) {
        setBeskjed({ tag: "ok", tekst: `Lagret innstillinger for ${result.oppdatert} kalendere.` });
        router.refresh();
      } else {
        setBeskjed({ tag: "feil", tekst: result.error });
      }
    });
  }

  function handleRefresh() {
    setBeskjed(null);
    startRefresh(async () => {
      const result = await refreshCalendarList();
      if (result.ok) {
        setBeskjed({ tag: "ok", tekst: `Hentet ${result.found} kalendere (${result.upserted} oppdatert, ${result.skipped} hoppet over).` });
        router.refresh();
      } else {
        setBeskjed({ tag: "feil", tekst: result.error });
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 32, textAlign: "center" }}>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen kalendere funnet. Klikk «Hent kalender-liste» for å forsøke igjen.</p>
        <span style={{ marginTop: 20, display: "inline-block" }}>
          <Knapp ghost icon="refresh-cw" onClick={handleRefresh} disabled={refreshing}>{refreshing ? "Henter …" : "Hent kalender-liste"}</Knapp>
        </span>
      </div>
    );
  }

  const antallMedFeil = rows.filter((r) => r.lastError).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Dine kalendere</div>
          <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Velg én kalender for nye bookinger og hvilke kalendere som skal blokkere ledige tider.</p>
        </div>
        <Knapp ghost icon="refresh-cw" onClick={handleRefresh} disabled={refreshing || pending}>{refreshing ? "Henter …" : "Hent på nytt"}</Knapp>
      </div>

      {beskjed && (
        <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 10, border: `1px solid ${beskjed.tag === "ok" ? T.up : T.down}`, background: `color-mix(in srgb, ${beskjed.tag === "ok" ? T.up : T.down} 8%, transparent)`, padding: 14, fontFamily: T.ui, fontSize: 13, color: T.fg }}>
          <Icon name={beskjed.tag === "ok" ? "check-circle" : "info"} size={16} style={{ color: beskjed.tag === "ok" ? T.up : T.down, flex: "none", marginTop: 1 }} />
          <span>{beskjed.tekst}</span>
        </div>
      )}

      {antallMedFeil > 0 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 10, border: `1px solid ${T.warn}`, background: `color-mix(in srgb, ${T.warn} 8%, transparent)`, padding: 14 }}>
          <Icon name="alert-triangle" size={16} style={{ color: T.warn, flex: "none", marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{antallMedFeil} {antallMedFeil === 1 ? "kalender" : "kalendere"} kan ikke nås</p>
            <p style={{ marginTop: 2, fontFamily: T.ui, fontSize: 12, color: T.mut }}>Tilgangen er utgått (invalid_grant). Koble Google på nytt for å gi systemet tilgang igjen. Inntil det er fikset er ikke disse kalenderne med på å blokkere booking-tider.</p>
          </div>
        </div>
      )}

      <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, borderBottom: `1px solid ${T.border}`, padding: "14px 18px" }}>
          <Icon name="calendar" size={16} style={{ color: T.lime, flex: "none", marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Hvor skal nye bookinger legges?</div>
            <p style={{ marginTop: 2, fontFamily: T.ui, fontSize: 12, color: T.mut }}>Når en kunde booker en time, opprettes hendelsen i denne kalenderen. Velg den du bruker til jobb.</p>
          </div>
        </div>
        {rows.map((rad, i) => (
          <label key={rad.id} htmlFor={`push-${rad.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`, cursor: rad.lastError ? "not-allowed" : "pointer", opacity: rad.lastError ? 0.5 : 1 }}>
            <input type="radio" id={`push-${rad.id}`} name="push-calendar" checked={pushId === rad.id} onChange={() => setPushId(rad.id)} disabled={!!rad.lastError} style={{ accentColor: T.lime, cursor: rad.lastError ? "not-allowed" : "pointer" }} />
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 9999, background: rad.color ?? T.mut, flex: "none" }} />
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, color: T.fg }}>{rad.calendarName}</span>
            {rad.lastError && <span style={{ fontFamily: T.mono, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em", color: T.down }}>invalid_grant</span>}
          </label>
        ))}
      </div>

      <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, borderBottom: `1px solid ${T.border}`, padding: "14px 18px" }}>
          <Icon name="x-circle" size={16} style={{ color: T.down, flex: "none", marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>Hvilke kalendere skal blokkere booking-tider?</div>
            <p style={{ marginTop: 2, fontFamily: T.ui, fontSize: 12, color: T.mut }}>Tider med hendelser i disse kalenderne vises ikke som ledige i booking-systemet. Huk av alle kalendere som inneholder ting du ikke vil bli avbrutt på.</p>
          </div>
        </div>
        {rows.map((rad, i) => (
          <label key={rad.id} htmlFor={`pull-${rad.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`, cursor: rad.lastError ? "not-allowed" : "pointer", opacity: rad.lastError ? 0.5 : 1 }}>
            <input type="checkbox" id={`pull-${rad.id}`} checked={pullIds.has(rad.id)} onChange={() => togglePull(rad.id)} disabled={!!rad.lastError} style={{ accentColor: T.lime, cursor: rad.lastError ? "not-allowed" : "pointer" }} />
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 9999, background: rad.color ?? T.mut, flex: "none" }} />
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13, color: T.fg }}>{rad.calendarName}</span>
            {rad.lastError && <span style={{ fontFamily: T.mono, fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em", color: T.down }}>invalid_grant</span>}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Knapp icon="save" onClick={handleLagre} disabled={pending}>{pending ? "Lagrer …" : "Lagre"}</Knapp>
      </div>
    </div>
  );
}
