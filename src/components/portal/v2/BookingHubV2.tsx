"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Booking — oversikt (ny default-landing på /portal/booking).
 *
 * Fasit: designsystem/train-lock/BO-02 Mine bookinger.dc.html (kommende
 * timer-listen) + BO-01 Booking ledige luker.dc.html (første ledige-hintet).
 *
 * Bygget 2026-08-04 på Anders' eksplisitte instruks: default-siden skal vise
 * timer/credits-status først, ikke hoppe rett inn i en veiviser.
 *
 * Bruker EKTE data fra getBookingHubData (hub-data.ts) — credits/upcoming/
 * coaches ble hentet der fra før, men var kun delvis brukt (kun credits+
 * coacher gikk videre til den gamle wizard-monteringen på denne ruten;
 * upcoming/past ble hentet og aldri vist noe sted). Ingen ny query.
 *
 * "Book time" leder til /portal/booking/ny — den eksisterende, credits-
 * bevisste wizarden (velger selv credits- eller betaling-modus, se
 * BookingNyV2.tsx). "Kjøp ekstra time mot betaling" er samme wizard med
 * ?betaling=1 — spilleren sendes aldri ut av appen (Anders 2026-08-28).
 */

import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, TomTilstand, Icon } from "@/components/v2";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PaperPage, PaperTopp, PaperKropp, PaperDokk } from "./PaperChrome";
import type { HubCredits, HubBooking, HubCoach, HubForsteLedige } from "@/lib/portal-booking/hub-data";

export type BookingHubV2Data = {
  credits: HubCredits;
  upcoming: HubBooking[];
  coaches: HubCoach[];
  /** Første ledige luke — grunnlaget for «Én ting nå». Null = ingen ledig tid funnet. */
  forsteLedige: HubForsteLedige | null;
  /** Retur fra Stripe Checkout (?betalt=1 / ?avbrutt=1). Null ellers. */
  melding?: "betalt" | "avbrutt" | null;
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

/** Fasitens `rad()` i abonnementskortet: etikett til venstre, verdi til høyre. */
function AboRad({ label, verdi, last }: { label: string; verdi: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
      }}
    >
      <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{label}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, color: TL.text, textAlign: "right" }}>{verdi}</span>
    </div>
  );
}

// Pakkenavnet utledes av credits-tallet (pakkeNavn, domain/abonnement.ts) —
// aldri av tier: ELITE er dødt enum og skal aldri vises (BUSINESS-RULES),
// og tier-verdiene er app-nivåer, ikke coaching-pakker.

export function BookingHubV2({ data }: { data: BookingHubV2Data }) {
  const { credits, upcoming, coaches, forsteLedige, melding } = data;
  const harPakke = credits.monthlyCredits > 0;
  const tomtForCredits = harPakke && credits.creditsRemaining <= 0;

  return (
    <PaperPage odId="playerhq-booking">
      <div data-paper-portal-booking data-paper-slug="playerhq-booking" style={{ display: "contents" }}>
      <PaperTopp
        tittel="Book time"
        sub={coaches[0]?.name ? `med ${coaches[0].name}` : "AK Golf Academy"}
        tilbakeHref="/portal"
        tilbakeLabel="Til hjem"
      />
      <PaperKropp>

      {/* Retur fra Stripe Checkout — kvittering/avbrudd i klarspråk. */}
      {melding === "betalt" && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: TL.radius.card, background: `color-mix(in srgb, ${TL.ok} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${TL.ok} 40%, transparent)` }}>
          <Icon name="check-circle" size={15} style={{ color: TL.ok, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.55 }}>
            Betalingen er mottatt. Timen bekreftes om et øyeblikk og dukker opp under «Kommende timer». Du får også e-post.
          </span>
        </div>
      )}
      {melding === "avbrutt" && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: TL.radius.card, background: `color-mix(in srgb, ${TL.warn} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${TL.warn} 40%, transparent)` }}>
          <Icon name="alert-triangle" size={15} style={{ color: TL.warn, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.55 }}>
            Betalingen ble avbrutt — tiden er ikke reservert. Velg gjerne en ny tid under.
          </span>
        </div>
      )}

      {/* Paper .nowblock — «Én ting nå» peker på EN konkret luke, ikke på
          «book en time» generelt. Vises bare når det finnes en ledig luke. */}
      {forsteLedige && (
        <div
          data-od-id="pb-one-thing-now"
          style={{
            border: `1px solid ${TL.hair}`,
            borderLeft: `3px solid ${TL.fill}`,
            borderRadius: TL.radius.card,
            background: TL.dim,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Caps size={9}>Én ting nå</Caps>
          <h2 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>
            Første ledige time er {forsteLedige.ukedagKort} kl. {forsteLedige.kl}
          </h2>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: TL.storrelse.kropp, color: TL.mute, lineHeight: 1.55, maxWidth: "52ch" }}>
            {forsteLedige.serviceName} med {forsteLedige.coachNavn}
            {formatDato(forsteLedige.datoIso) ? ` · ${formatDato(forsteLedige.datoIso)}` : ""}.{" "}
            {/* Saldoen regnes, aldri skrives — står det «én time igjen» som fast
                tekst, lyver linja i det øyeblikket du booker den siste. */}
            {harPakke
              ? tomtForCredits
                ? "Abonnementstimene dine er brukt opp denne perioden, så denne betales per time."
                : `Du har ${credits.creditsRemaining === 1 ? "én time" : `${credits.creditsRemaining} timer`} igjen i abonnementet denne perioden.`
              : "Uten coaching-pakke betales timen per gang."}
          </p>
          <Link
            href="/portal/booking/ny"
            data-od-id="pb-ta-luke"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              marginTop: 4,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: 12,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Ta {forsteLedige.ukedagKort} {forsteLedige.kl}
          </Link>
        </div>
      )}

      {/* Timer/credits — det Anders ba om skal stå først, ikke gjemt i en veiviser. */}
      <Kort tint>
        {harPakke ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <Caps size={9}>Timer denne perioden</Caps>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 40, color: TL.text, lineHeight: 1 }}>
                    {credits.creditsRemaining}
                  </span>
                  <span style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.mute }}>av {credits.monthlyCredits} timer igjen</span>
                </div>
              </div>
              <StatusPill tone={tomtForCredits ? "warn" : "up"}>
                {tomtForCredits ? "Brukt opp" : `${credits.creditsRemaining} ledig`}
              </StatusPill>
            </div>
            {credits.renewsAtIso && (
              <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 10 }}>
                Fornyes {formatDato(credits.renewsAtIso)}
              </div>
            )}
          </>
        ) : (
          <TomTilstand icon="target" title="Ingen aktiv coaching-pakke" sub="Book og betal per time under, eller se abonnement." />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {/* Clay-monopolet: står «Én ting nå» over med den konkrete luka, faller
              denne til omriss. Uten den er dette skjermens ene handling. */}
          <Link
            href="/portal/booking/ny"
            data-od-id="pb-book"
            {...(forsteLedige ? {} : { "data-paper-en-ting": "true" })}
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: forsteLedige ? 44 : 56,
              width: "100%",
              borderRadius: 12,
              border: forsteLedige ? `1px solid ${TL.hair}` : "none",
              background: forsteLedige ? "transparent" : TL.fill,
              color: forsteLedige ? TL.text : TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {tomtForCredits ? "Book — betal per time" : forsteLedige ? "Se alle ledige tider" : "Book time"}
          </Link>
          {/* Drop-in mot betaling — samme wizard i betaling-modus. Alt skjer i appen. */}
          <Link
            href="/portal/booking/ny?betaling=1"
            style={{ textDecoration: "none", textAlign: "center", fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, padding: "6px 0" }}
          >
            Kjøp ekstra time mot betaling →
          </Link>
        </div>
      </Kort>

      {/* Kommende — henter fra samme data som var utrukket her fra før. */}
      <Kort eyebrow="Kommende timer" action={upcoming.length > 0 ? <Link href="/portal/meg/bookinger" style={{ fontFamily: TL.font.sans, fontSize: 11.5, fontWeight: 600, color: TL.mute, textDecoration: "none" }}>Se alle →</Link> : undefined}>
        {upcoming.length === 0 ? (
          <TomTilstand icon="calendar" title="Ingen kommende timer" sub="Book en time over for å komme i gang." />
        ) : (
          upcoming.slice(0, 4).map((b, i, arr) => {
            const { dato, kl } = formatDatoTid(b.startIso);
            return (
              <Link key={b.id} href={`/portal/booking/${b.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Rad
                  leading={<span style={{ width: 46, flex: "none", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{dato}</span>}
                  title={b.serviceName}
                  sub={[b.coachName, b.locationName].filter(Boolean).join(" · ")}
                  meta={
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text }}>{kl}</span>
                      <StatusPill tone={b.status === "CONFIRMED" ? "up" : "warn"}>{STATUS_LABEL[b.status]}</StatusPill>
                    </span>
                  }
                  trailing={<Icon name="chevron-right" size={14} style={{ color: TL.mute }} />}
                  last={i === arr.length - 1}
                />
              </Link>
            );
          })
        )}
      </Kort>

      {/* Abonnementskortet (fasitens §Abonnement): hva pakken er, hva den
          inneholder, og hvor mye du har brukt i perioden. Prisraden står
          bevisst ute — prisen bor i Stripe, ikke i Subscription, og et tall
          uten kilde er en gjetning. */}
      {harPakke && (
        <Kort eyebrow="Abonnement">
          <AboRad label={pakkeNavn(credits.monthlyCredits) ?? "Coaching-pakke"} verdi={`${credits.monthlyCredits} timer per måned`} />
          <AboRad
            label="Brukt i perioden"
            verdi={`${credits.monthlyCredits - credits.creditsRemaining} av ${credits.monthlyCredits}`}
          />
          <AboRad label="PlayerHQ" verdi="inkludert" />
          <AboRad
            label="Ubrukte timer"
            verdi={credits.renewsAtIso ? `nullstilles ${formatDato(credits.renewsAtIso)}` : "nullstilles ved periodeskifte"}
            last
          />
        </Kort>
      )}

      {/* Coacher-seksjonen er fjernet (signering 12.08): fasiten har den ikke,
          og coachen står allerede i headerens undertittel. */}
      </PaperKropp>

      {/* Fasitens `.dokk` — den faste handlingen står nederst, alltid synlig,
          i stedet for at spilleren må lete etter hvor man kommer videre. */}
      <PaperDokk>
        <Link
          href="/portal/booking/ny"
          data-od-id="pb-neste"
          className="v2-press v2-focus"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
            width: "100%",
            borderRadius: 12,
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            color: TL.text,
            fontFamily: TL.font.sans,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Velg en dag
        </Link>
      </PaperDokk>
      </div>
    </PaperPage>
  );
}
