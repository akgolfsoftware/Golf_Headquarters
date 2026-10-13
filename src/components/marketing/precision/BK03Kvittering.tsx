"use client";

/**
 * BK-03 Kvittering (/booking/kvittering/[bookingId]) — Precision Athletics.
 * Tegning: Claude Design 7d7c2994, ui_kits/booking/screens/BK.jsx (etag 1790470769859133,
 * skjerm BK-03 = Flow start=4). Stripe success_url lander her.
 *
 * Bevisste avvik fra tegningen:
 *   - Referansen er «#» + siste åtte tegn av booking-id (ekte verdi). Tegningens
 *     «BK-2026-0917» finnes ikke i basen.
 *   - Raden «Spiller» vises ikke: bookingen lagrer ikke hvem timen gjelder, bare hvem som bestilte.
 *   - Raden «Sted» er lagt til (ekte felt) og «Betalt» viser bare «VIA STRIPE», ikke betalingsmåte og dato.
 *   - Tegningens «Vis som» (Gjest/Innlogget) er en demokontroll og bygges ikke.
 *   - PENDING (Stripe-webhooken er ikke ferdig) finnes ikke i tegningen. Beholdt fra dagens side:
 *     siden spør på nytt hvert 3. sekund i opptil 30 sekunder.
 *   - Kalenderfila bruker flytende tid (uten TZID) og escaper tekst etter RFC 5545.
 *   - Kontolenken til gjest bærer fortsatt e-posten i adressen (forslag til løsning uten står i PR-en).
 */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, ArrowUpRight, Receipt, RotateCw, UserPlus } from "lucide-react";
import { FeilTilstand, Knapp, KnappLenke, LasterTilstand, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { BK03Ramme } from "./BK03Ramme";

export type BK03Detaljer = {
  ref: string;
  tjeneste: string;
  tid: string;
  sted: string;
  coach: string | null;
  betalt: string;
  betaling?: string;
  betaltVedStripe: boolean;
  epost: string | null;
  fristTekst: string | null;
  ics: { start: string; slutt: string; tittel: string; sted: string; fil: string };
};

export type BK03Props = {
  tilstand: "data" | "pending" | "tom" | "feil" | "laster" | "denied" | "cancelled" | "completed";
  innlogget: boolean;
  signupHref: string;
  detaljer: BK03Detaljer | null;
  bookingerHref?: string;
};

const h1 = { margin: 0, font: "600 26px/1.2 var(--font-sans)", letterSpacing: "var(--tracking-display)", color: "var(--text-primary)" } as const;

function Rad({ k, v, mono, hint }: { k: string; v: string | null; mono?: boolean; hint?: string }) {
  return (
    <div className="pa-kv__row">
      <dt className="pa-kv__k">{k}</dt>
      <dd className={mono ? "pa-kv__v is-mono" : "pa-kv__v"}>{v ?? "—"}{hint && <span className="pa-kv__hint">{hint}</span>}</dd>
    </div>
  );
}

/** Stripe-webhooken tar typisk 2–10 sekunder. Spør på nytt hvert 3. sekund, maks 10 ganger. */
function SpoerPaaNytt() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n++;
      router.refresh();
      if (n >= 10) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}

/** RFC 5545 §3.3.11: escape \\, ; , og linjeskift i tekstverdier. Tidene er flytende (uten TZID): Oslo-veggklokke, riktig for norske brukere. */
const icsTekst = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function lastNedIcs(i: BK03Detaljer["ics"]) {
  const tekst = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AK Golf//Booking//NO", "BEGIN:VEVENT",
    `UID:${i.fil}@akgolf`, `SUMMARY:${icsTekst(i.tittel)}`, `DTSTART:${i.start}`, `DTEND:${i.slutt}`, `LOCATION:${icsTekst(i.sted)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([tekst], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = i.fil + ".ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function BK03Kvittering({ tilstand, innlogget, signupHref, detaljer, bookingerHref = "/portal/meg/bookinger" }: BK03Props) {
  const router = useRouter();
  if (tilstand === "denied") return <BK03Ramme><TomTilstand icon={Receipt} title="Kvitteringen krever tilgang" text="Logg inn som bestiller eller foresatt, eller bruk den fullstendige lenken fra betalingssteget."
    actions={<KnappLenke href="/auth/login">Logg inn</KnappLenke>} /></BK03Ramme>;
  if (tilstand === "laster") return <BK03Ramme><LasterTilstand text="Henter kvitteringen …" /></BK03Ramme>;
  if (tilstand === "feil" || (!detaljer && tilstand !== "tom")) {
    return (
      <BK03Ramme>
        <FeilTilstand icon={RotateCw} title="Kvitteringen kunne ikke hentes" text="Vi fikk ikke bekreftet bookingstatusen. Prøv igjen for å hente den registrerte statusen."
          code="FEIL 502 · KVITTERING" retry={<Knapp variant="secondary" icon={RotateCw} onClick={() => router.refresh()}>Prøv igjen</Knapp>} />
      </BK03Ramme>
    );
  }
  if (tilstand === "tom" || !detaljer) {
    return (
      <BK03Ramme>
        <TomTilstand icon={Receipt} title="Fant ingen booking" text="Lenken peker ikke til en booking. Sjekk e-posten fra oss, eller book på nytt."
          actions={<KnappLenke icon={CalendarPlus} href="/booking">Book time</KnappLenke>} />
      </BK03Ramme>
    );
  }
  const d = detaljer;
  const bekreftet = tilstand === "data";
  const ventende = tilstand === "pending";
  const avbestilt = tilstand === "cancelled";
  return (
    <BK03Ramme>
      {ventende && <SpoerPaaNytt />}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {bekreftet ? <StatusPille tone="ok">Bekreftet</StatusPille> : <StatusPille>{avbestilt ? "Avbestilt" : tilstand === "completed" ? "Gjennomført" : "Venter"}</StatusPille>}
      </div>
      <h1 style={h1}>{bekreftet ? "Timen er bekreftet" : avbestilt ? "Timen er avbestilt" : tilstand === "completed" ? "Timen er gjennomført" : "Venter på bekreftelse"}</h1>
      {ventende && <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty" }} role="status">Bookingstatusen er ikke bekreftet ennå. Siden henter statusen på nytt.</p>}
      <div style={{ padding: 16, borderRadius: 8, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4 }}>
        <Meta>REFERANSE</Meta>
        <span style={{ font: "600 22px/1.2 var(--font-mono)", letterSpacing: ".04em", overflowWrap: "anywhere" }}>{d.ref}</span>
      </div>
      <dl className="pa-kv" style={{ margin: 0 }}>
        <Rad k="Tjeneste" v={d.tjeneste} />
        <Rad k="Tid" v={d.tid} />
        <Rad k="Sted" v={d.sted} />
        <Rad k="Coach" v={d.coach} />
        <Rad k="Pris" v={d.betalt} mono hint={d.betaltVedStripe ? "Betalingsleverandør: Stripe" : undefined} />
        {d.betaling && <Rad k="Betaling" v={d.betaling} />}
        <Rad k="Registrert e-post" v={d.epost} />
      </dl>
      {bekreftet && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Knapp icon={CalendarPlus} onClick={() => lastNedIcs(d.ics)}>Legg i kalender</Knapp>
          </div>
          {d.fristTekst && <Meta>{d.fristTekst}</Meta>}
          {innlogget ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <KnappLenke variant="secondary" icon={ArrowUpRight} href={bookingerHref}>Se bookingen</KnappLenke>
            </div>
          ) : (
            <div className="pa-card" style={{ padding: 16, gap: 10, background: "var(--surface-flat)", boxShadow: "none" }}>
              <span className="kicker">Fortsett i PlayerHQ</span>
              <span style={{ font: "var(--type-body)", textWrap: "pretty" }}>
                Plan fra coachen, økter, tester og analyse av rundene dine. FULL koster 299 kr per måned eller 2 690 kr per år.
              </span>
              <div><KnappLenke variant="secondary" icon={UserPlus} href={signupHref}>Opprett konto</KnappLenke></div>
            </div>
          )}
        </>
      )}
    </BK03Ramme>
  );
}
