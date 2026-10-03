"use client";

import Link from "next/link";
import { StatusPille, TomTilstand } from "@/components/precision/pa";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { Calendar } from "lucide-react";
import type { HubCredits, HubBooking, HubCoach, HubForsteLedige } from "@/lib/portal-booking/hub-data";

export type BookingHubV2Data = {
  credits: HubCredits;
  upcoming: HubBooking[];
  coaches: HubCoach[];
  forsteLedige: HubForsteLedige | null;
  melding?: "betalt" | "avbrutt" | null;
};

const UKEDAG = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const MND = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];

function formatDatoTid(iso: string): { dato: string; kl: string } {
  const d = new Date(iso);
  const dato = new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "numeric", month: "short" }).format(d);
  const kl = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" }).format(d);
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
  const { credits, upcoming, coaches, forsteLedige, melding } = data;
  const harPakke = credits.monthlyCredits > 0;
  const tomtForCredits = harPakke && credits.creditsRemaining <= 0;
  const bookLabel = tomtForCredits ? "Book — betal per time" : forsteLedige ? "Se alle ledige tider" : "Book time";

  return (
    <div className="ph23b" data-od-id="playerhq-booking">
      <header>
        <h1>Book time</h1>
        <p>{coaches[0]?.name ? `med ${coaches[0].name}` : "AK Golf Academy"}</p>
      </header>
      <Link href="/portal" className="ph-tilbake">Til hjem</Link>

      {melding === "betalt" && <p className="ph23b-melding" role="status">Betalingen er mottatt. Timen bekreftes om et øyeblikk og dukker opp under kommende timer. Du får også e-post.</p>}
      {melding === "avbrutt" && <p className="ph23b-melding" role="status">Betalingen ble avbrutt — tiden er ikke reservert. Velg gjerne en ny tid under.</p>}

      {forsteLedige && (
        <section className="pa-card ph23b-kort" data-od-id="pb-one-thing-now">
          <p>Én ting nå</p>
          <h2>Første ledige time er {forsteLedige.ukedagKort} kl. {forsteLedige.kl}</h2>
          <p>
            {forsteLedige.serviceName} med {forsteLedige.coachNavn} · {formatDato(forsteLedige.datoIso)}.{" "}
            {harPakke
              ? tomtForCredits
                ? "Abonnementstimene dine er brukt opp denne perioden, så denne betales per time."
                : `Du har ${credits.creditsRemaining === 1 ? "én time" : `${credits.creditsRemaining} timer`} igjen i abonnementet denne perioden.`
              : "Uten coaching-pakke betales timen per gang."}
          </p>
          <Link href="/portal/booking/ny" className="pa-btn pa-btn--primary pa-btn--full" data-od-id="pb-ta-luke">
            Ta {forsteLedige.ukedagKort} {forsteLedige.kl}
          </Link>
        </section>
      )}

      <section className="pa-card ph23b-kort">
        {harPakke ? (
          <>
            <p>Timer denne perioden</p>
            <strong>{credits.creditsRemaining}</strong>
            <span>av {credits.monthlyCredits} timer igjen</span>
            <StatusPille tone={tomtForCredits ? "warn" : "ok"}>{tomtForCredits ? "Brukt opp" : `${credits.creditsRemaining} ledig`}</StatusPille>
            {credits.renewsAtIso && <p>Fornyes {formatDato(credits.renewsAtIso)}</p>}
          </>
        ) : (
          <TomTilstand icon={Calendar} title="Ingen aktiv coaching-pakke" text="Book og betal per time under, eller se abonnement." />
        )}
        <Link href="/portal/booking/ny" className={forsteLedige ? "pa-btn pa-btn--secondary pa-btn--full" : "pa-btn pa-btn--primary pa-btn--full"} data-od-id="pb-book">{bookLabel}</Link>
        <Link href="/portal/booking/ny?betaling=1" className="ph23b-ekstra">Kjøp ekstra time mot betaling</Link>
      </section>

      <section className="pa-card ph23b-kort">
        <header>
          <p>Kommende timer</p>
          {upcoming.length > 0 && <Link href="/portal/meg/bookinger">Se alle</Link>}
        </header>
        {upcoming.length === 0 ? (
          <TomTilstand icon={Calendar} title="Ingen kommende timer" text="Book en time over for å komme i gang." />
        ) : (
          <ul>
            {upcoming.slice(0, 4).map((b) => {
              const { dato, kl } = formatDatoTid(b.startIso);
              return (
                <li key={b.id}>
                  <Link href={`/portal/booking/${b.id}`}>
                    <small>{dato}</small>
                    <strong>{b.serviceName}</strong>
                    <span>{[b.coachName, b.locationName].filter(Boolean).join(" · ")}</span>
                  </Link>
                  <b>{kl}</b>
                  <StatusPille tone={b.status === "CONFIRMED" ? "ok" : "warn"}>{STATUS_LABEL[b.status]}</StatusPille>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {harPakke && (
        <section className="pa-card ph23b-kort">
          <p>Abonnement</p>
          <dl>
            <div><dt>{pakkeNavn(credits.monthlyCredits) ?? "Coaching-pakke"}</dt><dd>{credits.monthlyCredits} timer per måned</dd></div>
            <div><dt>Brukt i perioden</dt><dd>{credits.monthlyCredits - credits.creditsRemaining} av {credits.monthlyCredits}</dd></div>
            <div><dt>PlayerHQ</dt><dd>inkludert</dd></div>
            <div><dt>Ubrukte timer</dt><dd>{credits.renewsAtIso ? `nullstilles ${formatDato(credits.renewsAtIso)}` : "nullstilles ved periodeskifte"}</dd></div>
          </dl>
        </section>
      )}

      <Link href="/portal/booking/ny" className="pa-btn pa-btn--secondary pa-btn--full" data-od-id="pb-neste">Velg en dag</Link>
    </div>
  );
}
