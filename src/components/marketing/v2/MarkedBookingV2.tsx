"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Booking-inngang (/booking, retning C «Presis»).
   Steg 1 er tjeneste-først (ett trykk). Valgfri filter: lokasjon (+ trener i URL).
   Prisformatering («Gratis» / «N kr»), Acuity-pause (kanBrukeInnebygdBooking), Prisma-henting
   i page.tsx. Chrome: MRamme fra ./marked-ramme. */

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
    { nr: 1, ikon: "list", tittel: "Velg økt", beskrivelse: "Flex, Performance, Pro eller gruppe — ett trykk." },
    { nr: 2, ikon: "calendar", tittel: "Velg tid", beskrivelse: "Uke for uke, tid i Europa/Oslo. Tomme dager sier ærlig ifra." },
    { nr: 3, ikon: "credit-card", tittel: "Bekreft og betal", beskrivelse: "Pris og avbestilling synlig før Stripe." },
    { nr: 4, ikon: "badge-check", tittel: "Kvittering", beskrivelse: "Bekreftelse på e-post og i kalenderen." },
  ];
  return (
    <Seksjon mobile={mobile} style={{ borderTop: `1px solid ${T.border}` }}>
      <div style={{ textAlign: "center" }}>
        <Eyebrow>Enkelt og trygt</Eyebrow>
        <SeksT mobile={mobile}>Fire steg</SeksT>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: T.gap, marginTop: 28 }}>
        {steg.map((s) => (
          <Kort key={s.nr} pad="18px 16px 20px">
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={s.ikon} size={18} style={{ color: T.lime }} />
            </span>
            <Caps size={9} style={{ marginTop: 14 }}>{`Steg ${s.nr}`}</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, letterSpacing: "-0.015em", color: T.fg, marginTop: 6 }}>
              {s.tittel}
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{s.beskrivelse}</p>
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
  // trenere beholdes i props for page.tsx / steg 2 (coach+tid) — ikke brukt i steg 1
  tjenester = [],
  valgtLokasjon = null,
  valgtTrener = null,
}: MarkedBookingV2Props) {
  const mobile = useMobile();

  /* Pauset flyt (publikum uten BOOKING_PUBLIC) — ærlig Acuity + samtale. */
  if (paused) {
    return (
      <MRamme mobile={mobile} aktiv="booking" cta={{ label: "Book en samtale", href: "/kontakt" }}>
        <Seksjon mobile={mobile}>
          <div data-paper-marketing-booking style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <Eyebrow>Booking</Eyebrow>
            <HeroT mobile={mobile} em="økt">
              Book en
            </HeroT>
            <Lede style={{ margin: "20px auto 0" }}>
              Velg tid i kalenderen vår, eller book en uforpliktende samtale først. Avbestilling og pris vises før du betaler.
            </Lede>
            <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <a href={acuityUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "inline-block" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 16px",
                  borderRadius: 10, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 13, fontWeight: 600,
                }}>Åpne bookingkalender</span>
              </a>
              <Link href="/kontakt" className="v2-focus" style={{ fontFamily: T.ui, fontSize: 14, fontWeight: 600, color: T.fg2, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                Eller book en samtale først
              </Link>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "16px 0 0", lineHeight: 1.5 }}>
              Du sendes til vår eksterne booking (akgolfgroup.as.me) for tid og betaling. Full HQ-booking med ledighet her på siden er under innfasing.
            </p>
          </div>
        </Seksjon>
        <SlikFungererDet mobile={mobile} />
      </MRamme>
    );
  }

  /* Steg 1 = hva (tjeneste). Valgfri filter: lokasjon + trener i URL. */
  const filtrerte = tjenester.filter((s) => {
    if (valgtLokasjon && s.lokasjonId !== valgtLokasjon) return false;
    if (valgtTrener === "alle") return s.coachId === null;
    if (valgtTrener) return s.coachId === valgtTrener;
    return true;
  });
  const flexTjenester = filtrerte.filter(
    (s) => !s.abonnement && !s.name.toLowerCase().includes("gruppe"),
  );
  const strukturert = filtrerte.filter((s) => s.abonnement);
  const gruppeTjenester = filtrerte.filter(
    (s) => s.name.toLowerCase().includes("gruppe") || s.coachId === null,
  );

  return (
    <MRamme mobile={mobile} aktiv="booking">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 20 : 28 }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
          <Eyebrow>Booking · steg 1 av 4</Eyebrow>
          <HeroT mobile={mobile} em="økt">
            Velg
          </HeroT>
          <Lede style={{ margin: "18px auto 0" }}>
            Ett trykk på tjenesten. Deretter velger du tid. Pris og avbestilling står tydelig før betaling.
          </Lede>
        </div>
      </Seksjon>

      {tjenester.length === 0 ? (
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
      ) : (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <StegHode tittel="Hva vil du booke?" />
          <TjenesteGruppe label="Drop-in · Flex" tjenester={flexTjenester} mobile={mobile} />
          <TjenesteGruppe label="Strukturert" tjenester={strukturert} mobile={mobile} />
          <TjenesteGruppe label="Gruppe" tjenester={gruppeTjenester} mobile={mobile} />
          {lokasjonValg.length > 1 && (
            <div style={{ marginTop: 28 }}>
              <Caps>Filtrer på sted (valgfritt)</Caps>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <Link
                  href="/booking"
                  className="v2-focus v2-press"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 9999,
                    border: `1px solid ${!valgtLokasjon ? "transparent" : T.border}`,
                    background: !valgtLokasjon ? T.lime : T.panel2,
                    color: !valgtLokasjon ? T.onLime : T.fg2,
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    minHeight: 44,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Alle steder
                </Link>
                {lokasjonValg.map((l) => (
                  <Link
                    key={l.id}
                    href={`/booking?lokasjon=${l.id}`}
                    className="v2-focus v2-press"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 9999,
                      border: `1px solid ${valgtLokasjon === l.id ? "transparent" : T.border}`,
                      background: valgtLokasjon === l.id ? T.lime : T.panel2,
                      color: valgtLokasjon === l.id ? T.onLime : T.fg2,
                      fontFamily: T.ui,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      minHeight: 44,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {l.navn}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Seksjon>
      )}

      <SlikFungererDet mobile={mobile} />
    </MRamme>
  );
}
