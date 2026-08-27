"use client";

/**
 * AgencyOS Hjelp — Train-lock (T13, 27.08.2026).
 *
 * Mønster-port av `AdminHjelpV2` (Paper) — samme statiske innhold
 * (kategorier, populære artikler, kontakt-CTA), samme lokale klientsøk,
 * samme stub-lenker (#anker, ingen reelt mål). Ingen egen fasit tegner
 * denne skjermen — port med tl-kit-primitiver.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps, TlKort, TlRad, TlTittel, TlTomTilstand, TL_PRESS } from "./tl-kit";

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
      <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{tittel}</span>
      <TlCaps size={9}>{meta}</TlCaps>
    </div>
  );
}

function IkonBoks({ icon }: { icon: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: TL.dock,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={icon} size={18} style={{ color: TL.mute }} />
    </span>
  );
}

function KategoriKort({ kategori }: { kategori: HjelpKategori }) {
  return (
    <Link href={`#${kategori.id}`} className={TL_PRESS} style={{ textDecoration: "none" }}>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px", minWidth: 0, display: "flex", flexDirection: "column" }}>
        <IkonBoks icon={kategori.icon} />
        <div style={{ fontSize: 15, fontWeight: 700, color: TL.text, marginTop: 12 }}>{kategori.tittel}</div>
        <div style={{ marginTop: 6 }}>
          <TlCaps size={9}>{`${kategori.antall} artikler`}</TlCaps>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: TL.text }}>
            Åpne
            <Icon name="arrow-right" size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArtikkelRad({ artikkel, last }: { artikkel: HjelpArtikkel; last: boolean }) {
  return (
    <TlRad
      title={artikkel.tittel}
      sub={artikkel.utdrag}
      meta={
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute, whiteSpace: "nowrap" }}>
          {`${artikkel.kategori} · ${artikkel.lesetidMin} min`}
        </span>
      }
      href={`#${artikkel.id}`}
      last={last}
    />
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
    <Link href={href} className={TL_PRESS} style={{ textDecoration: "none" }}>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px", minWidth: 0, display: "flex", flexDirection: "column" }}>
        <IkonBoks icon={icon} />
        <div style={{ fontSize: 15, fontWeight: 700, color: TL.text, marginTop: 12 }}>{tittel}</div>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, color: TL.mute, margin: "6px 0 0" }}>{sub}</p>
        <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: TL.text }}>
          <Icon name={isMail ? "mail" : "arrow-right"} size={13} />
          {cta}
        </div>
      </div>
    </Link>
  );
}

export function AdminHjelpTrainLock() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <TlTittel sub="AgencyOS">Hjelp</TlTittel>
        <p style={{ fontSize: 13, color: TL.mute, marginTop: 8, maxWidth: 480 }}>
          Søk i hjelp-artikler, eller spør direkte. Vi svarer innen 1 time på hverdager.
        </p>
      </div>

      {/* Søkefelt + foreslåtte spørringer */}
      <div style={{ maxWidth: 480, width: "100%", position: "relative" }}>
        <input
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk hjelp-artikler eller skriv et spørsmål…"
          style={{
            width: "100%",
            height: 44,
            padding: "0 40px 0 14px",
            borderRadius: TL.radius.field,
            background: TL.dock,
            boxShadow: `inset 0 0 0 1px ${TL.hair}`,
            color: TL.text,
            fontSize: 14,
            fontFamily: TL.font.sans,
            border: "none",
          }}
        />
        <Icon name="search" size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: TL.mute }} />
      </div>

      {!visResultater && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FORESLATT.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSok(label)}
              className={TL_PRESS}
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: TL.text,
                background: TL.dim,
                border: "none",
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
        <TlKort eyebrow="Søkeresultater" action={<TlCaps size={9}>{`${treff.length} treff`}</TlCaps>} pad="6px 20px 8px">
          {treff.length === 0 ? (
            <TlTomTilstand icon="search" title="Ingen treff" sub={`Ingen treff på «${sok}». Prøv et annet ord eller kontakt support.`} />
          ) : (
            treff.map((a, i) => <ArtikkelRad key={a.id} artikkel={a} last={i === treff.length - 1} />)
          )}
        </TlKort>
      )}

      {/* Kategorier */}
      <section aria-labelledby="kategorier-heading">
        {seksjonHode("Kategorier", `${totalArtikler} artikler totalt`)}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 12 }}>
          {KATEGORIER.map((k) => (
            <KategoriKort key={k.id} kategori={k} />
          ))}
        </div>
      </section>

      {/* Populære artikler */}
      <section aria-labelledby="populaere-heading">
        {seksjonHode("Populære artikler", "Sett 1 247 ganger denne måneden")}
        <TlKort pad="6px 20px 8px">
          {ARTIKLER.map((a, i) => (
            <ArtikkelRad key={a.id} artikkel={a} last={i === ARTIKLER.length - 1} />
          ))}
        </TlKort>
      </section>

      {/* Kontakt-CTA */}
      <section aria-labelledby="kontakt-heading">
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: TL.text }}>Trenger du mer hjelp?</span>
          <div style={{ marginTop: 6 }}>
            <TlCaps size={9}>Vi er her — velg det som passer deg</TlCaps>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 12 }}>
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

      <p style={{ fontSize: 12, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
        Hjelp-innholdet er statisk og vedlikeholdes manuelt — kontakt support dersom en artikkel mangler eller er
        utdatert.
      </p>
    </div>
  );
}
