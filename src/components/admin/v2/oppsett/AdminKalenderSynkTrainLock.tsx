"use client";

/**
 * AgencyOS · Innstillinger · Kalender-synk — Train-lock (T13, 27.08.2026).
 *
 * Designport av `AdminKalenderSynkV2` (Paper) — ingen egen fasit tegner
 * kalender-synk-skjermen, så layouten er en mønster-port til tl-kit, ikke
 * pixel. Actions gjenbrukes 1:1 fra
 * src/app/admin/(legacy)/settings/calendar/actions.ts — ingen endring i
 * forretningslogikk.
 *
 * Ærlige tomrom: «Siste sync» viser «Aldri» når feltet er null. En kalender
 * med invalid_grant vises som feil (TL.danger/TL.warn), ikke skjules.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2. `TL.ok`/`TL.warm` er reservert til
 * godkjenning/fullført-hake og brukes derfor IKKE for generelle
 * suksessmeldinger her — «koblet til» og «lagret» vises nøytralt (TL.text),
 * kun feil (TL.danger) og ikke-sperrende varsel (TL.warn) er fargekodet.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  disconnectGoogleCalendar,
  oppdaterSubscriptions,
  refreshCalendarList,
} from "@/app/admin/(legacy)/settings/calendar/actions";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { TlBadge, TlCaps, TlKnapp, TlKort, TlRad, TlSwitchRad, TlTittel, TlTomTilstand } from "./tl-kit";

/* ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────────── */
export interface KalenderRad {
  id: string;
  googleCalendarId: string;
  calendarName: string;
  color: string | null;
  syncPush: boolean;
  syncPull: boolean;
  visIKalender: boolean;
  active: boolean;
  lastError: string | null;
}
export interface AdminKalenderSynkV2Data {
  okParam: boolean;
  errorParam: string | null;
  connection: {
    googleEmail: string;
    status: string;
    lastSyncAt: string | null;
    lastError: string | null;
  } | null;
  subscriptions: KalenderRad[];
}

type Beskjed = { tag: "ok" | "feil"; tekst: string };

/** Varselboks — nøytral (info/ok), feil (TL.danger) eller advarsel (TL.warn, ikke-sperrende). */
function Varselboks({
  tone,
  icon,
  children,
}: {
  tone: "nøytral" | "feil" | "advarsel";
  icon: string;
  children: React.ReactNode;
}) {
  const farge = tone === "feil" ? TL.danger : tone === "advarsel" ? TL.warn : TL.mute;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        borderRadius: TL.radius.card,
        background: tone === "nøytral" ? TL.dock : `color-mix(in srgb, ${farge} 10%, transparent)`,
        boxShadow: tone === "nøytral" ? `inset 0 0 0 1px ${TL.hair}` : `inset 0 0 0 1px ${tone === "advarsel" ? TL.warnHair : farge}`,
        padding: "12px 14px",
        fontSize: 12.5,
        color: TL.text,
        lineHeight: 1.5,
      }}
    >
      <Icon name={icon} size={15} style={{ color: farge, flex: "none", marginTop: 1 }} />
      <div>{children}</div>
    </div>
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
        background: color ?? TL.mute,
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
    <TlKnapp variant="fare" icon="log-out" disabled={pending} onClick={handleClick}>
      {pending ? "Kobler fra …" : "Koble fra"}
    </TlKnapp>
  );
}

export function AdminKalenderSynkTrainLock({ data }: { data: AdminKalenderSynkV2Data }) {
  const router = useRouter();
  const { connection, subscriptions } = data;

  const initialPushId = subscriptions.find((r) => r.syncPush && r.active)?.id ?? "";
  const initialPullIds = new Set(subscriptions.filter((r) => r.syncPull && r.active).map((r) => r.id));
  const initialVisIds = new Set(subscriptions.filter((r) => r.visIKalender && r.active).map((r) => r.id));

  const [pushId, setPushId] = useState(initialPushId);
  const [pullIds, setPullIds] = useState<Set<string>>(initialPullIds);
  const [visIds, setVisIds] = useState<Set<string>>(initialVisIds);
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

  function toggleVis(id: string) {
    setVisIds((prev) => {
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
        const erVis = visIds.has(r.id);
        return {
          id: r.id,
          syncPush: erPush,
          syncPull: erPull,
          visIKalender: erVis,
          active: erPush || erPull || erVis,
        };
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <TlTittel sub="AgencyOS">Kalender-synk</TlTittel>
        <p style={{ marginTop: 8, fontSize: 13, color: TL.mute, lineHeight: 1.6, maxWidth: 560 }}>
          Koble Google-kontoen din og velg hvilke kalendere som skal pushe bookinger og blokkere
          tider. Endringer i Google Calendar reflekteres tilbake hit.
        </p>
      </div>

      {data.okParam && (
        <Varselboks tone="nøytral" icon="check-circle">
          Google Calendar er koblet til. Velg hvilke kalendere du vil synke.
        </Varselboks>
      )}
      {data.errorParam && (
        <Varselboks tone="feil" icon="alert-triangle">
          Kobling feilet: {data.errorParam.replace(/-/g, " ")}
        </Varselboks>
      )}

      {connection ? (
        <TlKort eyebrow="Tilkobling">
          <TlRad
            title="Koblet til"
            sub={connection.googleEmail}
            meta={<TlBadge>{connection.status}</TlBadge>}
            chevron={false}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, margin: "14px 0" }}>
            <div>
              <TlCaps size={9}>Siste sync</TlCaps>
              <div style={{ marginTop: 6, fontFamily: TL.font.mono, fontSize: 13, color: TL.text }}>
                {connection.lastSyncAt ?? "Aldri"}
              </div>
            </div>
            <div>
              <TlCaps size={9}>Antall kalendere</TlCaps>
              <div style={{ marginTop: 6, fontFamily: TL.font.mono, fontSize: 13, color: TL.text }}>
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
            <TlKnapp variant="sekundaer" icon="refresh-cw" href="/api/google-calendar/connect">
              Koble på nytt
            </TlKnapp>
            <KobleFraKnapp />
          </div>
        </TlKort>
      ) : (
        <TlKort>
          <TlTomTilstand
            icon="calendar-check"
            title="Ikke koblet til"
            sub="Koble til Google Calendar for å synke bookinger. Du blir sendt til Google for å bekrefte tilgang — vi ber om lese- og skrive-tilgang for å unngå dobbel-booking."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <TlKnapp variant="primaer" icon="plug" href="/api/google-calendar/connect">
              Koble til Google Calendar
            </TlKnapp>
          </div>
        </TlKort>
      )}

      {connection && subscriptions.length === 0 && (
        <TlKort>
          <TlTomTilstand icon="calendar" title="Ingen kalendere funnet" sub="Klikk under for å hente kalender-listen fra Google på nytt." />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <TlKnapp variant="primaer" icon="refresh-cw" disabled={refreshing} onClick={handleRefresh}>
              {refreshing ? "Henter …" : "Hent kalender-liste"}
            </TlKnapp>
          </div>
        </TlKort>
      )}

      {connection && subscriptions.length > 0 && (
        <>
          {beskjed && (
            <Varselboks tone={beskjed.tag === "ok" ? "nøytral" : "feil"} icon={beskjed.tag === "ok" ? "check-circle" : "alert-triangle"}>
              {beskjed.tekst}
            </Varselboks>
          )}

          {antallMedFeil > 0 && (
            <Varselboks tone="advarsel" icon="alert-triangle">
              <strong style={{ color: TL.text, fontWeight: 600 }}>
                {antallMedFeil} {antallMedFeil === 1 ? "kalender" : "kalendere"} kan ikke nås.
              </strong>{" "}
              Tilgangen er utgått. Koble Google på nytt for å gi systemet tilgang igjen — inntil
              det er fikset blokkerer ikke disse kalenderne booking-tider.
            </Varselboks>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <TlCaps size={9}>Dine kalendere</TlCaps>
              <p style={{ marginTop: 4, fontSize: 12.5, color: TL.mute }}>
                Velg én kalender for nye bookinger og hvilke som skal blokkere ledige tider.
              </p>
            </div>
            <TlKnapp variant="sekundaer" icon="refresh-cw" disabled={refreshing || pending} onClick={handleRefresh}>
              {refreshing ? "Henter …" : "Hent på nytt"}
            </TlKnapp>
          </div>

          <TlKort eyebrow="Hvor skal nye bookinger legges?" pad="4px 20px 6px">
            {subscriptions.map((rad, i) => (
              <TlSwitchRad
                key={rad.id}
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <KalenderDot color={rad.color} /> {rad.calendarName}
                  </span>
                }
                sub={rad.lastError ? "Tilgang utgått" : undefined}
                on={pushId === rad.id}
                disabled={!!rad.lastError}
                onChange={() => setPushId(pushId === rad.id ? "" : rad.id)}
                last={i === subscriptions.length - 1}
              />
            ))}
          </TlKort>

          <TlKort eyebrow="Hvilke kalendere skal vises i AgencyOS-kalenderen?" pad="4px 20px 6px">
            {subscriptions.map((rad, i) => (
              <TlSwitchRad
                key={rad.id}
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <KalenderDot color={rad.color} /> {rad.calendarName}
                  </span>
                }
                sub={rad.lastError ? "Tilgang utgått" : undefined}
                on={visIds.has(rad.id)}
                disabled={!!rad.lastError}
                onChange={() => toggleVis(rad.id)}
                last={i === subscriptions.length - 1}
              />
            ))}
          </TlKort>

          <TlKort eyebrow="Hvilke kalendere skal blokkere booking-tider?" pad="4px 20px 6px">
            {subscriptions.map((rad, i) => (
              <TlSwitchRad
                key={rad.id}
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <KalenderDot color={rad.color} /> {rad.calendarName}
                  </span>
                }
                sub={rad.lastError ? "Tilgang utgått" : undefined}
                on={pullIds.has(rad.id)}
                disabled={!!rad.lastError}
                onChange={() => togglePull(rad.id)}
                last={i === subscriptions.length - 1}
              />
            ))}
          </TlKort>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <TlKnapp variant="primaer" icon="check" disabled={pending} onClick={handleLagre}>
              {pending ? "Lagrer …" : "Lagre"}
            </TlKnapp>
          </div>

          <TlKort eyebrow="Slik fungerer det">
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: TL.mute, lineHeight: 1.6 }}>
              <li>
                <span style={{ fontFamily: TL.font.mono, color: TL.text }}>1.</span> Kalenderen med bryteren på i første liste blokkerer ledige slots i AK Golf HQ.
              </li>
              <li>
                <span style={{ fontFamily: TL.font.mono, color: TL.text }}>2.</span> Kalenderen med bryteren på i andre liste mottar nye, bekreftede bookinger.
              </li>
              <li>
                <span style={{ fontFamily: TL.font.mono, color: TL.text }}>3.</span> Endringer i Google (flyttet eller slettet hendelse) reflekteres tilbake til booking-tabellen via webhook.
              </li>
              <li>
                <span style={{ fontFamily: TL.font.mono, color: TL.text }}>4.</span> Du kan slå av enkeltkalendere uten å koble fra hele tilkoblingen.
              </li>
            </ol>
          </TlKort>
        </>
      )}
    </div>
  );
}
