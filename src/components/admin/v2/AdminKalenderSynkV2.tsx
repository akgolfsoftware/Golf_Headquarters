"use client";

/**
 * AgencyOS Kalender-synk — v2 (retning C «Presis»). Rekomponerer
 * /admin/settings/calendar (Google Calendar 2-veis synk) i v2-språket.
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc UI, ingen rå hex (kun T.*). Actions gjenbrukes 1:1 fra
 * src/app/admin/(legacy)/settings/calendar/actions.ts (disconnect, oppdater
 * subscriptions, refresh kalender-liste) — ingen endring i forretningslogikk.
 *
 * Ærlige tomrom: «Siste sync» viser «Aldri» når feltet er null — ingen
 * fabrikerte tidsstempler. En kalender med invalid_grant vises som feil,
 * ikke skjules.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  disconnectGoogleCalendar,
  oppdaterSubscriptions,
  refreshCalendarList,
} from "@/app/admin/(legacy)/settings/calendar/actions";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  Knapp,
  CTAPill,
  TomTilstand,
  Icon,
} from "@/components/v2";

/* ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────────── */
export interface KalenderRad {
  id: string;
  googleCalendarId: string;
  calendarName: string;
  color: string | null;
  syncPush: boolean;
  syncPull: boolean;
  active: boolean;
  lastError: string | null;
}
export interface AdminKalenderSynkV2Data {
  /** searchParams ok=1 etter fullført OAuth-redirect fra Google. */
  okParam: boolean;
  /** searchParams error=... hvis OAuth-kobling feilet. */
  errorParam: string | null;
  connection: {
    googleEmail: string;
    status: string;
    /** Ferdigformatert nb-NO-dato, eller null hvis aldri synket. */
    lastSyncAt: string | null;
    lastError: string | null;
  } | null;
  subscriptions: KalenderRad[];
}

type Beskjed = { tag: "ok" | "feil"; tekst: string };

/** Liten varsel-boks — ok/feil/advarsel — delt av alle meldingene på siden. */
function Varselboks({
  tone,
  icon,
  children,
}: {
  tone: "ok" | "feil" | "advarsel";
  icon: string;
  children: React.ReactNode;
}) {
  const c = tone === "ok" ? T.up : tone === "feil" ? T.down : T.warn;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        borderRadius: 12,
        border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
        background: `color-mix(in srgb, ${c} 8%, transparent)`,
        padding: "12px 14px",
        fontFamily: T.ui,
        fontSize: 12.5,
        color: T.fg,
        lineHeight: 1.5,
      }}
    >
      <Icon name={icon} size={15} style={{ color: c, flex: "none", marginTop: 1 }} />
      <div>{children}</div>
    </div>
  );
}

/** Kompakt av/på-bryter uten eget label (label ligger i Rad.title). */
function Vippe({
  on,
  onToggle,
  disabled,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      style={{
        appearance: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        padding: 0,
        width: 37,
        height: 22,
        borderRadius: 9999,
        flex: "none",
        position: "relative",
        display: "inline-block",
        background: on ? T.lime : T.panel3,
        border: `1px solid ${on ? "transparent" : T.borderS}`,
        transition: "background 160ms",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: on ? 17.5 : 2.5,
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: on ? T.onLime : T.mut,
          transition: "left 160ms",
        }}
      />
    </button>
  );
}

function KalenderDot({ color }: { color: string | null }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: 9999,
        background: color ?? T.mut,
        flex: "none",
      }}
      aria-hidden
    />
  );
}

/** «Koble fra»-knapp — bekreftelse + server action + refresh. */
function KobleFraKnapp() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Koble fra Google Calendar? Bookinger pushes ikke lenger.")) return;
    startTransition(async () => {
      await disconnectGoogleCalendar();
      router.refresh();
    });
  }

  return (
    <Knapp ghost icon="log-out" disabled={pending} onClick={handleClick}>
      {pending ? "Kobler fra …" : "Koble fra"}
    </Knapp>
  );
}

export function AdminKalenderSynkV2({ data }: { data: AdminKalenderSynkV2Data }) {
  const router = useRouter();
  const { connection, subscriptions } = data;

  const initialPushId = subscriptions.find((r) => r.syncPush && r.active)?.id ?? "";
  const initialPullIds = new Set(
    subscriptions.filter((r) => r.syncPull && r.active).map((r) => r.id),
  );

  const [pushId, setPushId] = useState(initialPushId);
  const [pullIds, setPullIds] = useState<Set<string>>(initialPullIds);
  const [pending, startLagre] = useTransition();
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
    startLagre(async () => {
      const input = subscriptions.map((r) => {
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
        setBeskjed({
          tag: "ok",
          tekst: `Hentet ${result.found} kalendere (${result.upserted} oppdatert, ${result.skipped} hoppet over).`,
        });
        router.refresh();
      } else {
        setBeskjed({ tag: "feil", tekst: result.error });
      }
    });
  }

  const antallMedFeil = subscriptions.filter((r) => r.lastError).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Innstillinger</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="2-veis synk.">Google Calendar</Tittel>
        </div>
        <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, maxWidth: 560 }}>
          Koble Google-kontoen din og velg hvilke kalendere som skal pushe bookinger og blokkere
          tider. Endringer i Google Calendar reflekteres tilbake hit.
        </p>
      </div>

      {data.okParam && (
        <Varselboks tone="ok" icon="check-circle">
          Google Calendar er koblet til. Velg hvilke kalendere du vil synke.
        </Varselboks>
      )}
      {data.errorParam && (
        <Varselboks tone="feil" icon="alert-triangle">
          Kobling feilet: {data.errorParam.replace(/-/g, " ")}
        </Varselboks>
      )}

      {connection ? (
        <Kort eyebrow="Tilkobling">
          <Rad
            leading={
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `color-mix(in srgb, ${T.lime} 12%, transparent)`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <Icon name="calendar-check" size={16} style={{ color: T.lime }} />
              </span>
            }
            title="Koblet til"
            sub={connection.googleEmail}
            meta={<StatusPill tone="up">{connection.status}</StatusPill>}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, margin: "14px 0" }}>
            <div>
              <Caps size={9}>Siste sync</Caps>
              <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 13, color: T.fg }}>
                {connection.lastSyncAt ?? "Aldri"}
              </div>
            </div>
            <div>
              <Caps size={9}>Antall kalendere</Caps>
              <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 13, color: T.fg }}>
                {subscriptions.length}
              </div>
            </div>
          </div>
          {connection.lastError && (
            <div style={{ marginBottom: 14 }}>
              <Varselboks tone="feil" icon="alert-triangle">
                Siste feil: {connection.lastError}
              </Varselboks>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/api/google-calendar/connect" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="refresh-cw">Koble på nytt</CTAPill>
            </Link>
            <KobleFraKnapp />
          </div>
        </Kort>
      ) : (
        <Kort>
          <TomTilstand
            icon="calendar-check"
            title="Ikke koblet til"
            sub="Koble til Google Calendar for å synke bookinger. Du blir sendt til Google for å bekrefte tilgang — vi ber om lese- og skrive-tilgang for å unngå dobbel-booking."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/api/google-calendar/connect" style={{ textDecoration: "none" }}>
              <CTAPill icon="plug">Koble til Google Calendar</CTAPill>
            </Link>
          </div>
        </Kort>
      )}

      {connection && subscriptions.length === 0 && (
        <Kort>
          <TomTilstand
            icon="calendar"
            title="Ingen kalendere funnet"
            sub="Klikk under for å hente kalender-listen fra Google på nytt."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Knapp icon="refresh-cw" disabled={refreshing} onClick={handleRefresh}>
              {refreshing ? "Henter …" : "Hent kalender-liste"}
            </Knapp>
          </div>
        </Kort>
      )}

      {connection && subscriptions.length > 0 && (
        <>
          {beskjed && (
            <Varselboks tone={beskjed.tag === "ok" ? "ok" : "feil"} icon={beskjed.tag === "ok" ? "check-circle" : "alert-triangle"}>
              {beskjed.tekst}
            </Varselboks>
          )}

          {antallMedFeil > 0 && (
            <Varselboks tone="advarsel" icon="alert-triangle">
              <strong style={{ color: T.fg, fontWeight: 600 }}>
                {antallMedFeil} {antallMedFeil === 1 ? "kalender" : "kalendere"} kan ikke nås.
              </strong>{" "}
              Tilgangen er utgått. Koble Google på nytt for å gi systemet tilgang igjen — inntil
              det er fikset blokkerer ikke disse kalenderne booking-tider.
            </Varselboks>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <Caps size={9}>Dine kalendere</Caps>
              <p style={{ marginTop: 4, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
                Velg én kalender for nye bookinger og hvilke som skal blokkere ledige tider.
              </p>
            </div>
            <Knapp ghost icon="refresh-cw" disabled={refreshing || pending} onClick={handleRefresh}>
              {refreshing ? "Henter …" : "Hent på nytt"}
            </Knapp>
          </div>

          <Kort eyebrow="Nye bookinger" pad="4px 20px 6px">
            <p style={{ margin: "0 0 10px", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
              Velg hvilken kalender som skal motta hendelsen når en kunde booker en time.
            </p>
            {subscriptions.map((rad, i) => (
              <Rad
                key={rad.id}
                leading={<KalenderDot color={rad.color} />}
                title={rad.calendarName}
                sub={rad.lastError ? "Tilgang utgått" : undefined}
                trailing={
                  <Vippe
                    on={pushId === rad.id}
                    disabled={!!rad.lastError}
                    label={`Nye bookinger til ${rad.calendarName}`}
                    onToggle={() => setPushId(pushId === rad.id ? "" : rad.id)}
                  />
                }
                last={i === subscriptions.length - 1}
              />
            ))}
          </Kort>

          <Kort eyebrow="Blokker booking-tider" pad="4px 20px 6px">
            <p style={{ margin: "0 0 10px", fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.5 }}>
              Tider med hendelser i disse kalenderne vises ikke som ledige i booking-systemet.
            </p>
            {subscriptions.map((rad, i) => (
              <Rad
                key={rad.id}
                leading={<KalenderDot color={rad.color} />}
                title={rad.calendarName}
                sub={rad.lastError ? "Tilgang utgått" : undefined}
                trailing={
                  <Vippe
                    on={pullIds.has(rad.id)}
                    disabled={!!rad.lastError}
                    label={`Blokker booking-tider fra ${rad.calendarName}`}
                    onToggle={() => togglePull(rad.id)}
                  />
                }
                last={i === subscriptions.length - 1}
              />
            ))}
          </Kort>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Knapp icon="check" disabled={pending} onClick={handleLagre}>
              {pending ? "Lagrer …" : "Lagre"}
            </Knapp>
          </div>

          <Kort eyebrow="Slik fungerer det">
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6 }}>
              <li><span style={{ fontFamily: T.mono, color: T.fg }}>1.</span> Kalenderen med bryteren på i første liste blokkerer ledige slots i AK Golf HQ.</li>
              <li><span style={{ fontFamily: T.mono, color: T.fg }}>2.</span> Kalenderen med bryteren på i andre liste mottar nye, bekreftede bookinger.</li>
              <li><span style={{ fontFamily: T.mono, color: T.fg }}>3.</span> Endringer i Google (flyttet eller slettet hendelse) reflekteres tilbake til booking-tabellen via webhook.</li>
              <li><span style={{ fontFamily: T.mono, color: T.fg }}>4.</span> Du kan slå av enkeltkalendere uten å koble fra hele tilkoblingen.</li>
            </ol>
          </Kort>
        </>
      )}
    </div>
  );
}
