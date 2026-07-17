"use client";

/**
 * AgencyOS Hjelp — v2 (retning C «Presis»). Rekomponerer
 * /admin/(legacy)/hjelp (search-driven help-center) i v2-språket.
 *
 * Statisk innhold — ingen Prisma-spørringer, samme fasit-tekst som legacy
 * (kategorier, populære artikler, kontakt-CTA). Søket er lokalt
 * klient-filter, ingen server-roundtrip (samme mønster som legacy sin
 * HjelpSearch). Kategoriene og artikkel-radene er «#anker»-lenker uten reelt
 * mål — samme stub-oppførsel som legacy (siden er markert som statisk
 * placeholder-innhold nederst).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  CTAPill,
  Inndata,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";

interface HjelpKategori {
  id: string;
  tittel: string;
  antall: number;
  icon: string;
}

interface HjelpArtikkel {
  id: string;
  tittel: string;
  kategori: string;
  lesetidMin: number;
  utdrag: string;
}

const KATEGORIER: ReadonlyArray<HjelpKategori> = [
  { id: "komme-i-gang", tittel: "Komme i gang", antall: 8, icon: "sparkles" },
  { id: "trening", tittel: "Trening", antall: 14, icon: "target" },
  { id: "coaching", tittel: "Coaching", antall: 12, icon: "book-open" },
  { id: "booking-betaling", tittel: "Booking + betaling", antall: 9, icon: "credit-card" },
  { id: "kontoinnstillinger", tittel: "Kontoinnstillinger", antall: 6, icon: "settings" },
];

const ARTIKLER: ReadonlyArray<HjelpArtikkel> = [
  {
    id: "logg-runde-golfbox",
    tittel: "Hvordan logger jeg en runde fra GolfBox?",
    kategori: "Trening",
    lesetidMin: 3,
    utdrag:
      "Eksporter scorekort som CSV fra GolfBox, last opp i PlayerHQ og runden registreres automatisk på spilleren.",
  },
  {
    id: "pyramide-fokus",
    tittel: "Hva er pyramide-fokus?",
    kategori: "Trening",
    lesetidMin: 5,
    utdrag:
      "Pyramide-fokus er AK Golf sin treningsmodell — bredt fundament av basistreninger, smalere topp med konkurransesimulering.",
  },
  {
    id: "bytt-coach",
    tittel: "Slik bytter du coach",
    kategori: "Coaching",
    lesetidMin: 2,
    utdrag:
      "Be om bytte fra profilsiden. Nåværende coach får varsel, ny coach matcher etter tilgjengelighet og sertifisering.",
  },
  {
    id: "live-session",
    tittel: "Slik bruker du Live Session",
    kategori: "Coaching",
    lesetidMin: 6,
    utdrag:
      "Live Session lar coach og spiller dele Trackman-data i sanntid. Krever Pro-abonnement og oppdatert mobilapp.",
  },
];

const FORESLATT = ["Logg runde", "Pyramide", "Oppgrader til Pro", "Bytt coach"];

function seksjonHode(tittel: string, meta: string) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
      <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, fontStyle: "italic", color: T.fg }}>{tittel}</span>
      <Caps size={9}>{meta}</Caps>
    </div>
  );
}

function KategoriKort({ kategori }: { kategori: HjelpKategori }) {
  return (
    <Link href={`#${kategori.id}`} style={{ textDecoration: "none" }}>
      <Kort hover>
        <span
          aria-hidden="true"
          style={{ width: 40, height: 40, borderRadius: 10, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon name={kategori.icon} size={18} style={{ color: T.lime }} />
        </span>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, marginTop: 12 }}>
          {kategori.tittel}
        </div>
        <div style={{ marginTop: 6 }}>
          <Caps size={9}>{`${kategori.antall} artikler`}</Caps>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.lime }}>
            Åpne
            <Icon name="arrow-right" size={12} />
          </span>
        </div>
      </Kort>
    </Link>
  );
}

function ArtikkelRad({ artikkel, last }: { artikkel: HjelpArtikkel; last: boolean }) {
  return (
    <Link href={`#${artikkel.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <Rad
        title={artikkel.tittel}
        sub={artikkel.utdrag}
        meta={
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, whiteSpace: "nowrap" }}>
            {`${artikkel.kategori} · ${artikkel.lesetidMin} min`}
          </span>
        }
        last={last}
      />
    </Link>
  );
}

function KontaktKort({
  icon,
  tittel,
  sub,
  cta,
  href,
}: {
  icon: string;
  tittel: string;
  sub: string;
  cta: string;
  href: string;
}) {
  const isMail = href.startsWith("mailto:");
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Kort tint>
        <span
          aria-hidden="true"
          style={{ width: 40, height: 40, borderRadius: 10, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <Icon name={icon} size={18} style={{ color: T.lime }} />
        </span>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, marginTop: 12 }}>{tittel}</div>
        <p style={{ fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.5, color: T.mut, margin: "6px 0 0" }}>{sub}</p>
        <div style={{ marginTop: 14 }}>
          <CTAPill ghost icon={isMail ? "mail" : "arrow-right"}>{cta}</CTAPill>
        </div>
      </Kort>
    </Link>
  );
}

export function AdminHjelpV2() {
  const [sok, setSok] = useState("");
  const term = sok.trim().toLowerCase();
  const visResultater = term.length >= 2;

  const treff = useMemo<ReadonlyArray<HjelpArtikkel>>(() => {
    if (term.length < 2) return [];
    return ARTIKLER.filter(
      (a) =>
        a.tittel.toLowerCase().includes(term) ||
        a.utdrag.toLowerCase().includes(term) ||
        a.kategori.toLowerCase().includes(term),
    );
  }, [term]);

  const totalArtikler = KATEGORIER.reduce((sum, k) => sum + k.antall, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · /admin/hjelp</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="lurer du på?">Hva</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, marginTop: 8, maxWidth: 480 }}>
          Søk i hjelp-artikler, eller spør direkte. Vi svarer innen 1 time på hverdager.
        </p>
      </div>

      {/* Søkefelt + foreslåtte spørringer */}
      <div style={{ maxWidth: 480, width: "100%" }}>
        <Inndata
          label={null}
          value={sok}
          onChange={setSok}
          placeholder="Søk hjelp-artikler eller skriv et spørsmål…"
          suffix={<Icon name="search" size={13} style={{ color: T.mut }} />}
        />
      </div>

      {!visResultater && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FORESLATT.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSok(label)}
              className="v2-press v2-focus"
              style={{
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 500,
                color: T.fg2,
                background: T.panel2,
                border: `1px solid ${T.border}`,
                borderRadius: 9999,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {visResultater && (
        <Kort eyebrow="Søkeresultater" action={<Caps size={9}>{`${treff.length} treff`}</Caps>} pad="6px 20px 8px">
          {treff.length === 0 ? (
            <TomTilstand icon="search" title="Ingen treff" sub={`Ingen treff på «${sok}». Prøv et annet ord eller kontakt support.`} />
          ) : (
            treff.map((a, i) => <ArtikkelRad key={a.id} artikkel={a} last={i === treff.length - 1} />)
          )}
        </Kort>
      )}

      {/* Kategorier */}
      <section aria-labelledby="kategorier-heading">
        {seksjonHode("Kategorier", `${totalArtikler} artikler totalt`)}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
          {KATEGORIER.map((k) => (
            <KategoriKort key={k.id} kategori={k} />
          ))}
        </div>
      </section>

      {/* Populære artikler */}
      <section aria-labelledby="populaere-heading">
        {seksjonHode("Populære artikler", "Sett 1 247 ganger denne måneden")}
        <Kort pad="6px 20px 8px">
          {ARTIKLER.map((a, i) => (
            <ArtikkelRad key={a.id} artikkel={a} last={i === ARTIKLER.length - 1} />
          ))}
        </Kort>
      </section>

      {/* Kontakt-CTA */}
      <section aria-labelledby="kontakt-heading">
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>
            Trenger du <em style={{ fontStyle: "italic", color: T.lime }}>mer hjelp?</em>
          </span>
          <div style={{ marginTop: 6 }}>
            <Caps size={9}>Vi er her — velg det som passer deg</Caps>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
          <KontaktKort
            icon="message-circle"
            tittel="Chat med oss"
            sub="Svar innen 1 time på hverdager. Aktiv nå."
            cta="Start chat"
            href="/admin/innboks"
          />
          <KontaktKort
            icon="mail"
            tittel="Send e-post"
            sub="support@akgolf.no · svar innen 24t"
            cta="Skriv e-post"
            href="mailto:support@akgolf.no"
          />
          <KontaktKort
            icon="users"
            tittel="Be coachen din"
            sub="Send en melding direkte i innboksen"
            cta="Åpne meldinger"
            href="/admin/innboks"
          />
        </div>
      </section>

      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0 }}>
        Hjelp-innholdet er statisk og vedlikeholdes manuelt — kontakt support dersom en artikkel mangler eller er
        utdatert.
      </p>
    </div>
  );
}
