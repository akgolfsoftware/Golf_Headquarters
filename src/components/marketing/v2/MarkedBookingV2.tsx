"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Booking-inngang (/booking, retning C «Presis»).
   v2-port 16. juli 2026 av (mlegacy)/booking/page.tsx sitt presentasjonslag.
   BEVISST UENDRET: hele steg-flyten (lokasjon → trener → tjeneste via
   ?lokasjon/&trener-query-lenker), filtreringspredikatene, prisformatering
   («Gratis» / «N kr»), all copy og BOOKING_ACTIVE/Acuity-pausen. Prisma-
   henting + lokasjon/coach-avledning skjer i page.tsx (server) og sendes inn
   ferdig serialisert. Steg-stripen speiler Veiviser-visualet fra
   src/components/v2/skjema.tsx (uten Neste/Tilbake-knappene — navigasjonen
   her er lenkedrevet). Chrome: delt MRamme fra ./marked-ramme. */

import Link from "next/link";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, CTAPill, TomTilstand } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, SeksT, Lede, Seksjon, useMobile } from "./marked-ramme";

/* ── Datakontrakter (serialisert i page.tsx) ───────────── */
export type BookingLokasjon = { id: string; navn: string; sted: string };
export type BookingTrener = { id: string; navn: string; tittel: string };
export type BookingTjeneste = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceOre: number;
  durationMin: number;
  coachId: string | null;
  lokasjonId: string;
  abonnement: boolean;
};

export interface MarkedBookingV2Props {
  paused?: boolean;
  acuityUrl?: string;
  lokasjonValg?: BookingLokasjon[];
  trenere?: BookingTrener[];
  tjenester?: BookingTjeneste[];
  valgtLokasjon?: string | null;
  valgtTrener?: string | null;
}

/* Samme prisvisning som originalen (øre → «Gratis» / «N kr»). */
function formaterPris(ore: number): string {
  if (ore === 0) return "Gratis";
  return `${ore / 100} kr`;
}

/* ── Steg-stripe (Veiviser-visual, lenkedrevet flyt) ───── */
function BookingSteg({
  stegNo,
  lokasjon,
  trener,
  mobile,
}: {
  stegNo: 1 | 2 | 3;
  lokasjon: string | null;
  trener: string | null;
  mobile: boolean;
}) {
  const steg = [
    { nr: 1, navn: "Lokasjon", verdi: lokasjon },
    { nr: 2, navn: "Trener", verdi: trener },
    { nr: 3, navn: "Tjeneste", verdi: null as string | null },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, maxWidth: 460 }}>
      {steg.map((s, i) => {
        const done = s.nr < stegNo;
        const on = s.nr === stegNo;
        return (
          <span key={s.nr} style={{ display: "contents" }}>
            {i > 0 && (
              <span
                style={{
                  flex: 1,
                  height: 2,
                  borderRadius: 2,
                  background: done || on ? `color-mix(in srgb, ${T.lime} 45%, transparent)` : T.track,
                  margin: "13px 8px 0",
                }}
              />
            )}
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "none" }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: T.mono,
                  fontSize: 11.5,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  background: done ? T.lime : on ? "transparent" : T.panel2,
                  border: `2px solid ${done || on ? T.lime : T.borderS}`,
                  color: done ? T.onLime : on ? T.lime : T.mut,
                }}
              >
                {done ? <Icon name="check" size={13} /> : s.nr}
              </span>
              <span style={{ fontFamily: T.ui, fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? T.fg : T.mut, whiteSpace: "nowrap" }}>
                {s.navn}
              </span>
              {done && s.verdi && !mobile && (
                <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.fg2, whiteSpace: "nowrap", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.verdi}
                </span>
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* ── Valgkort (lokasjon/trener) ────────────────────────── */
function ValgLenkeKort({
  href,
  icon,
  tittel,
  sub,
  cta,
  stiplet,
}: {
  href: string;
  icon: string;
  tittel: string;
  sub: string;
  cta: string;
  stiplet?: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <Kort hover pad="20px 20px 22px" style={stiplet ? { borderStyle: "dashed" } : undefined}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span
            style={{
              width: 40,
              height: 40,
              flex: "none",
              borderRadius: 12,
              background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={icon} size={18} style={{ color: T.lime }} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.015em", color: T.fg, lineHeight: 1.2 }}>
              {tittel}
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "6px 0 0" }}>{sub}</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.lime }}>
              {cta}
              <Icon name="arrow-right" size={12} />
            </span>
          </div>
        </div>
      </Kort>
    </Link>
  );
}

/* ── Tjenestekort ──────────────────────────────────────── */
function TjenesteKort({ s }: { s: BookingTjeneste }) {
  return (
    <Link href={`/booking/${s.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Kort hover pad="20px 20px 22px" style={{ height: "100%" }}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, lineHeight: 1.2 }}>
          {s.name}
        </div>
        {s.description && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{s.description}</p>
        )}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingTop: 22 }}>
          <span>
            <Caps size={9}>Pris</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 5 }}>
              {formaterPris(s.priceOre)}
            </span>
          </span>
          <span style={{ textAlign: "right" }}>
            <Caps size={9}>Varighet</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 5 }}>
              {s.durationMin} min
            </span>
          </span>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.lime }}>
          Velg tid
          <Icon name="arrow-right" size={12} />
        </span>
      </Kort>
    </Link>
  );
}

/* ── Seksjonshode med Endre-lenke ──────────────────────── */
function StegHode({ tittel, endreHref, endreTekst }: { tittel: string; endreHref?: string; endreTekst?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>{tittel}</h2>
      {endreHref && endreTekst && (
        <Link href={endreHref} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="arrow-left">{endreTekst}</CTAPill>
        </Link>
      )}
    </div>
  );
}

/* ── «Slik fungerer det» ───────────────────────────────── */
function SlikFungererDet({ mobile }: { mobile: boolean }) {
  const steg = [
    {
      nr: 1,
      ikon: "calendar",
      tittel: "Velg tid",
      beskrivelse: "Finn ledig tid hos din coach. Se tilgjengelighet i sanntid, ingen venteliste.",
    },
    {
      nr: 2,
      ikon: "credit-card",
      tittel: "Betal trygt",
      beskrivelse: "Betal via Stripe med kort. For Academy-kunder trekkes én coaching-credit automatisk.",
    },
    {
      nr: 3,
      ikon: "badge-check",
      tittel: "Møt din coach",
      beskrivelse: "Få en bekreftelse på e-post med alle detaljer. Avbestilling gratis frem til 24 timer før.",
    },
  ];
  return (
    <Seksjon mobile={mobile} style={{ borderTop: `1px solid ${T.border}` }}>
      <div style={{ textAlign: "center" }}>
        <Eyebrow>Enkelt og trygt</Eyebrow>
        <SeksT mobile={mobile}>Slik fungerer det</SeksT>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 32 }}>
        {steg.map((s) => (
          <Kort key={s.nr} pad="22px 22px 24px">
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={s.ikon} size={20} style={{ color: T.lime }} />
            </span>
            <Caps size={9} style={{ marginTop: 16 }}>{`Steg ${s.nr}`}</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.015em", color: T.fg, marginTop: 6 }}>
              {s.tittel}
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>{s.beskrivelse}</p>
          </Kort>
        ))}
      </div>
    </Seksjon>
  );
}

/* ── Gruppert tjenesteliste (Flex / Abonnement) ────────── */
function TjenesteGruppe({ label, tjenester, mobile }: { label: string; tjenester: BookingTjeneste[]; mobile: boolean }) {
  if (tjenester.length === 0) return null;
  return (
    <div style={{ marginTop: 26 }}>
      <Caps>{label}</Caps>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 14 }}>
        {tjenester.map((s) => (
          <TjenesteKort key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M-BOOKING (/booking) — inngang + steg 1–3
   ════════════════════════════════════════════════════════ */
export function MarkedBookingV2({
  paused,
  acuityUrl,
  lokasjonValg = [],
  trenere = [],
  tjenester = [],
  valgtLokasjon = null,
  valgtTrener = null,
}: MarkedBookingV2Props) {
  const mobile = useMobile();

  /* Pauset flyt (BOOKING_ACTIVE=false) — Acuity-lenken tar over. */
  if (paused) {
    return (
      <MRamme mobile={mobile} aktiv="booking">
        <Seksjon mobile={mobile}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <Eyebrow>Booking</Eyebrow>
            <HeroT mobile={mobile} em="en økt">
              Book
            </HeroT>
            <Lede style={{ margin: "20px auto 0" }}>
              Book Pro-time, TrackMan-analyse eller gruppe-økt direkte i bookingkalenderen vår. Velg ledig tid og bekreft på sekunder.
            </Lede>
            <div style={{ marginTop: 26 }}>
              <a href={acuityUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "inline-block" }}>
                <CTAPill icon="arrow-right">Book time nå</CTAPill>
              </a>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: "14px 0 0" }}>
              Du sendes til bookingsiden vår (akgolfgroup.as.me).
            </p>
          </div>
        </Seksjon>
        <SlikFungererDet mobile={mobile} />
      </MRamme>
    );
  }

  /* Samme steg-avledning som originalen. */
  const stegNo: 1 | 2 | 3 = valgtLokasjon ? (valgtTrener ? 3 : 2) : 1;
  const lokasjonNavn = valgtLokasjon ? (lokasjonValg.find((l) => l.id === valgtLokasjon)?.navn ?? null) : null;
  const trenerNavn =
    valgtTrener === "alle" ? "Gruppe" : valgtTrener ? (trenere.find((t) => t.id === valgtTrener)?.navn ?? null) : null;

  /* Steg 3: samme filtrering + gruppering som originalen. */
  const filtrerte = tjenester.filter((s) => {
    if (s.lokasjonId !== valgtLokasjon) return false;
    if (valgtTrener === "alle") return s.coachId === null;
    return s.coachId === valgtTrener;
  });
  const flexTjenester = filtrerte.filter((s) => !s.abonnement);
  const abonnementTjenester = filtrerte.filter((s) => s.abonnement);

  /* Steg 2: felles-/gruppetilbud på valgt lokasjon? */
  const harGruppe = tjenester.some((s) => s.coachId === null && s.lokasjonId === valgtLokasjon);

  return (
    <MRamme mobile={mobile} aktiv="booking">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 24 : 36 }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
          <Eyebrow>Booking</Eyebrow>
          <HeroT mobile={mobile} em="en økt">
            Book
          </HeroT>
          <Lede style={{ margin: "20px auto 0" }}>
            Velg lokasjon, trener og tjeneste, finn ledig tid og betal trygt via Stripe. Avbestilling senest 24 timer før gir full refusjon.
          </Lede>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: mobile ? 30 : 40 }}>
          <BookingSteg stegNo={stegNo} lokasjon={lokasjonNavn} trener={trenerNavn} mobile={mobile} />
        </div>
      </Seksjon>

      {/* Steg 1: Velg lokasjon */}
      {!valgtLokasjon && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <StegHode tittel="1. Velg lokasjon" />
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 20 }}>
            {lokasjonValg.map((l) => (
              <ValgLenkeKort
                key={l.id}
                href={`/booking?lokasjon=${l.id}`}
                icon="map-pin"
                tittel={l.navn}
                sub={l.sted}
                cta="Velg"
              />
            ))}
          </div>
        </Seksjon>
      )}

      {/* Steg 2: Velg trener */}
      {valgtLokasjon && !valgtTrener && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <StegHode tittel="2. Velg trener" endreHref="/booking" endreTekst="Endre lokasjon" />
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap, marginTop: 20 }}>
            {trenere.map((c) => {
              const harTjenester = tjenester.some((s) => s.coachId === c.id && s.lokasjonId === valgtLokasjon);
              if (!harTjenester) return null;
              return (
                <ValgLenkeKort
                  key={c.id}
                  href={`/booking?lokasjon=${valgtLokasjon}&trener=${c.id}`}
                  icon="user"
                  tittel={c.navn}
                  sub={c.tittel}
                  cta="Se tjenester"
                />
              );
            })}
          </div>
          {harGruppe && (
            <div style={{ marginTop: T.gap }}>
              <ValgLenkeKort
                href={`/booking?lokasjon=${valgtLokasjon}&trener=alle`}
                icon="users"
                tittel="Gruppe-økt"
                sub="Felles økter med flere spillere, uten valg av spesifikk trener."
                cta="Se gruppe-tilbud"
                stiplet
              />
            </div>
          )}
        </Seksjon>
      )}

      {/* Steg 3: Velg tjeneste */}
      {valgtLokasjon && valgtTrener && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <StegHode tittel="3. Velg tjeneste" endreHref={`/booking?lokasjon=${valgtLokasjon}`} endreTekst="Endre trener" />
          <TjenesteGruppe label="Flex" tjenester={flexTjenester} mobile={mobile} />
          <TjenesteGruppe label="Abonnement" tjenester={abonnementTjenester} mobile={mobile} />
        </Seksjon>
      )}

      {/* Ærlig tomtilstand — ingen aktive tjenester i det hele tatt */}
      {tjenester.length === 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Kort pad="26px 20px">
            <TomTilstand
              icon="calendar"
              title="Ingen tjenester er tilgjengelig akkurat nå"
              sub={
                (
                  <>
                    <a href="mailto:post@akgolf.no" style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}>
                      Ta kontakt
                    </a>{" "}
                    så hjelper vi deg.
                  </>
                ) as ReactNode
              }
            />
          </Kort>
        </Seksjon>
      )}

      <SlikFungererDet mobile={mobile} />
    </MRamme>
  );
}
