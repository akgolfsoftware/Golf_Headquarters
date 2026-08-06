"use client";

/**
 * PlayerHQ Booking — oversikt (ny default-landing på /portal/booking).
 * Bygget 2026-08-04 på Anders' eksplisitte instruks: default-siden skal vise
 * timer/credits-status først, ikke hoppe rett inn i en veiviser.
 *
 * Bruker EKTE data fra getBookingHubData (hub-data.ts) — credits/upcoming/
 * coaches ble hentet der fra før, men var kun delvis brukt (kun credits+
 * coacher gikk videre til den gamle wizard-monteringen på denne ruten;
 * upcoming/past ble hentet og aldri vist noe sted). Ingen ny query.
 *
 * "Book time" leder til /portal/booking/ny — den eksisterende, credits-
 * bevisste wizardpry (håndterer GRATIS-redirect til /coaching og
 * brukt-opp-tilstand selv, se BookingNyV2.tsx). Denne siden dupliserer
 * ikke den logikken. "Kjøp drop-in mot betaling" peker til samme sted
 * (/booking, offentlig side) som BruktOppV2 allerede bruker for akkurat
 * dette — samme mønster, ikke en ny betalingsflyt.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  AvatarInit,
  TomTilstand,
  Icon,
} from "@/components/v2";
import type { HubCredits, HubBooking, HubCoach } from "@/lib/portal-booking/hub-data";

export type BookingHubV2Data = {
  credits: HubCredits;
  upcoming: HubBooking[];
  coaches: HubCoach[];
};

const UKEDAG = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const MND = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];

/** Oslo-korrekt dato/klokke — samme gotcha som resten av booking-flatene (Vercel=UTC). */
function formatDatoTid(iso: string): { dato: string; kl: string } {
  const d = new Date(iso);
  const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short" }).format(d);
  const kl = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(d);
  return { dato: dato.charAt(0).toUpperCase() + dato.slice(1), kl };
}
function formatDato(iso: string): string {
  const d = new Date(iso);
  const uke = UKEDAG[d.getDay()];
  return `${uke.charAt(0).toUpperCase()}${uke.slice(1)} ${d.getDate()}. ${MND[d.getMonth()]}`;
}

const STATUS_LABEL: Record<HubBooking["status"], string> = {
  PENDING: "Behandler",
  CONFIRMED: "Bekreftet",
  COMPLETED: "Gjennomført",
  CANCELLED: "Avbestilt",
};

export function BookingHubV2({ data }: { data: BookingHubV2Data }) {
  const { credits, upcoming, coaches } = data;
  const harPakke = credits.monthlyCredits > 0;
  const tomtForCredits = harPakke && credits.creditsRemaining <= 0;

  return (
    <div data-paper-portal-booking style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div>
        <Caps>Booking · AK Golf Academy</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="coachingtime.">Book</Tittel>
        </div>
      </div>

      {/* Timer/credits — det Anders ba om skal stå først, ikke gjemt i en veiviser. */}
      <Kort tint>
        {harPakke ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <Caps size={9}>Timer denne perioden</Caps>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 40, color: T.fg, lineHeight: 1 }}>
                    {credits.creditsRemaining}
                  </span>
                  <span style={{ fontFamily: T.ui, fontSize: 14, color: T.mut }}>av {credits.monthlyCredits} timer igjen</span>
                </div>
              </div>
              <StatusPill tone={tomtForCredits ? "warn" : "up"}>
                {tomtForCredits ? "Brukt opp" : `${credits.creditsRemaining} ledig`}
              </StatusPill>
            </div>
            {credits.renewsAtIso && (
              <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 10 }}>
                Fornyes {formatDato(credits.renewsAtIso)}
              </div>
            )}
          </>
        ) : (
          <TomTilstand icon="target" title="Ingen aktiv coaching-pakke" sub="Book og betal per time under, eller se abonnement." />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <Link
            href="/portal/booking/ny"
            data-od-id="booking-book-time"
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 48,
              width: "100%",
              borderRadius: 10,
              background: T.handling,
              color: T.onHandling,
              fontFamily: T.ui,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {tomtForCredits ? "Book — betal per time" : "Book time"}
          </Link>
          {/* Samme mål som BruktOppV2 sin drop-in-CTA (BookingNyV2.tsx) — ikke en ny betalingsflyt. */}
          <Link
            href="/booking"
            style={{ textDecoration: "none", textAlign: "center", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, padding: "6px 0" }}
          >
            Kjøp ekstra time mot betaling →
          </Link>
        </div>
      </Kort>

      {/* Kommende — henter fra samme data som var utrukket her fra før. */}
      <Kort eyebrow="Kommende timer" action={upcoming.length > 0 ? <Link href="/portal/meg/bookinger" style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}>Se alle →</Link> : undefined}>
        {upcoming.length === 0 ? (
          <TomTilstand icon="calendar" title="Ingen kommende timer" sub="Book en time over for å komme i gang." />
        ) : (
          upcoming.slice(0, 4).map((b, i, arr) => {
            const { dato, kl } = formatDatoTid(b.startIso);
            return (
              <Link key={b.id} href={`/portal/booking/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Rad
                  leading={<span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{dato}</span>}
                  title={b.serviceName}
                  sub={[b.coachName, b.locationName].filter(Boolean).join(" · ")}
                  meta={
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{kl}</span>
                      <StatusPill tone={b.status === "CONFIRMED" ? "up" : "warn"}>{STATUS_LABEL[b.status]}</StatusPill>
                    </span>
                  }
                  trailing={<Icon name="chevron-right" size={14} style={{ color: T.mut }} />}
                  last={i === arr.length - 1}
                />
              </Link>
            );
          })
        )}
      </Kort>

      {coaches.length > 0 && (
        <Kort eyebrow="Coacher">
          {coaches.map((c, i, arr) => (
            <Rad
              key={c.id}
              leading={<AvatarInit navn={c.name} size={32} />}
              title={c.name}
              sub={`${c.serviceCount} ${c.serviceCount === 1 ? "tjeneste" : "tjenester"}${c.fromPrice ? ` · fra ${c.fromPrice}` : ""}`}
              trailing={null}
              last={i === arr.length - 1}
            />
          ))}
        </Kort>
      )}
    </div>
  );
}
