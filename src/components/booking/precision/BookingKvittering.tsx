"use client";

/**
 * BK-03: kvittering etter betaling. Tegning: Claude Design 7d7c2994,
 * ui_kits/booking/screens/BK.jsx (start=4). Stripe success_url lander her.
 *
 * BEVISST UENDRET fra MarkedBookingKvitteringV2: PENDING-pollingen
 * (router.refresh hvert 3. sekund, maks 10 forsøk) og CONFIRMED-deteksjonen.
 * Ny: e-postadressen står ikke lenger i kontolenken (beslutninger.md), og
 * «Legg i kalender» lager en .ics-fil i nettleseren fra bookingens tider.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarPlus, UserPlus } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { BookingRamme } from "./BookingRamme";
import { Nokkelverdi } from "./felt";

export interface KvitteringProps {
  bekreftet: boolean;
  innlogget: boolean;
  epost: string | null;
  referanse: string;
  tjeneste: string;
  varighetMin: number;
  dato: string;
  klokkeslett: string;
  coach: string | null;
  spiller: string | null;
  sted: string;
  prisTekst: string;
  /** Avbestillingsfrist ferdig formatert («28. september kl. 17:00»), eller null. */
  fristTekst: string | null;
  /** Faktisk start og slutt (ISO, UTC) til kalenderfilen. */
  startIso: string;
  sluttIso: string;
}

const MAKS_FORSOK = 10;

/** Poller til Stripe-webhooken har bekreftet bookingen (typisk 2 til 10 sekunder). */
function usePolling(aktiv: boolean) {
  const router = useRouter();
  const [gittOpp, setGittOpp] = useState(false);
  useEffect(() => {
    if (!aktiv) return;
    let forsok = 0;
    const id = setInterval(() => {
      forsok++;
      router.refresh();
      if (forsok >= MAKS_FORSOK) { clearInterval(id); setGittOpp(true); }
    }, 3000);
    return () => clearInterval(id);
  }, [aktiv, router]);
  return gittOpp;
}

const ics = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function lastNedKalender(p: KvitteringProps) {
  const linjer = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AK Golf Academy//Booking//NO", "BEGIN:VEVENT",
    `UID:${p.referanse.replace("#", "")}@akgolf.no`,
    `DTSTAMP:${ics(new Date().toISOString())}`,
    `DTSTART:${ics(p.startIso)}`, `DTEND:${ics(p.sluttIso)}`,
    `SUMMARY:${p.tjeneste} · AK Golf`, `LOCATION:${p.sted}`,
    "END:VEVENT", "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(new Blob([linjer.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `booking-${p.referanse.replace("#", "")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BookingKvittering(p: KvitteringProps) {
  const gittOpp = usePolling(!p.bekreftet);

  return (
    <BookingRamme smal>
      <div className="bk-rad">
        {p.bekreftet ? <StatusPille tone="ok">Bekreftet</StatusPille> : <StatusPille>Behandler betalingen</StatusPille>}
      </div>
      <h1 className="bk-tittel">{p.bekreftet ? "Timen er bekreftet" : "Behandler betalingen …"}</h1>
      {!p.bekreftet && (
        <p className="bk-tekst">
          {gittOpp
            ? "Betalingen er ikke bekreftet ennå. Bookingen er lagret, og kvitteringen kommer på e-post når betalingen er gjennomført."
            : "Betalingen ser ut til å gå gjennom. Siden oppdaterer seg automatisk."}
        </p>
      )}

      <div className="bk-blokk">
        <Meta>REFERANSE</Meta>
        <span className="bk-ref">{p.referanse}</span>
      </div>

      <Nokkelverdi items={[
        ["Tjeneste", `${p.tjeneste} · ${p.varighetMin} min`, { mono: false }],
        ["Tid", `${p.dato} · ${p.klokkeslett}`],
        ["Sted", p.sted, { mono: false }],
        ["Coach", p.coach, { mono: false }],
        ["Spiller", p.spiller, { mono: false }],
        [p.bekreftet ? "Betalt" : "Beløp", p.prisTekst, { hint: p.bekreftet ? "VIA STRIPE" : undefined }],
        ["Kvittering sendt til", p.epost, { mono: false }],
      ]} />

      {p.bekreftet && (
        <>
          <div className="bk-rad">
            <Knapp icon={CalendarPlus} onClick={() => lastNedKalender(p)}>Legg i kalender</Knapp>
          </div>
          {p.fristTekst && <Meta>GRATIS AVBESTILLING TIL {p.fristTekst.toUpperCase()} (24 TIMER FØR)</Meta>}
        </>
      )}

      {p.bekreftet && (p.innlogget ? (
        <div className="bk-rad">
          <KnappLenke variant="secondary" icon={ArrowUpRight} href="/portal/meg/bookinger">Se bookingen i PlayerHQ</KnappLenke>
        </div>
      ) : (
        <div className="bk-blokk">
          <span className="kicker">Fortsett i PlayerHQ</span>
          <span className="bk-tekst" style={{ color: "var(--text-body)" }}>
            PlayerHQ er der treningsplanen og øktene dine samles. Opprett konto med e-posten du booket med.
          </span>
          <div><KnappLenke variant="secondary" icon={UserPlus} href="/auth/signup">Opprett konto</KnappLenke></div>
        </div>
      ))}

      <div className="bk-rad"><Link href="/booking" style={{ color: "var(--link)", textDecoration: "underline", minHeight: 44, display: "inline-flex", alignItems: "center" }}>Book en time til</Link></div>
    </BookingRamme>
  );
}
