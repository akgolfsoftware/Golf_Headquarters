"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Bekreft bestilling (/booking/[slug]/bekreft,
   retning C «Presis»). v2-port 16. juli 2026 av (mlegacy)/booking/[slug]/
   bekreft/page.tsx + bekreft-form.tsx sitt presentasjonslag. BEVISST UENDRET:
   samme server-action (createBookingCheckout, flyttet 1:1 til den nye ruten),
   samme klientvalidering (navn/e-post/telefon-meldingene), samme
   Stripe-redirect (window.location.href) og samme prisformatering (Intl
   nb-NO NOK). Kun visuelt rekomponert med v2-primitiver (Kort, Inndata,
   TekstOmraade, Knapp). Chrome: delt MRamme. */

import { useState, useTransition, type ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps, Knapp, TilbakeLenke } from "@/components/v2";
import { Inndata, TekstOmraade } from "@/components/v2/skjema";
import { createBookingCheckout } from "@/app/(marketing)/booking/[slug]/bekreft/actions";
import { MRamme, Eyebrow, HeroT, Lede, Seksjon, useMobile } from "./marked-ramme";

/* ── Datakontrakt (serialisert i page.tsx) ─────────────── */
export interface MarkedBookingBekreftV2Props {
  slug: string;
  start: string; // ISO — sendes uendret til server-action
  coachId: string;
  tjenesteNavn: string;
  datoTekst: string;
  klokkeslettTekst: string;
  durationMin: number;
  coachNavn: string | null;
  prisTekst: string;
  priceOre: number;
  innloggetEpost: string | null;
  innloggetNavn: string | null;
}

function DetaljRad({ label, value, bold, last }: { label: string; value: ReactNode; bold?: boolean; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 14,
        padding: "11px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
      }}
    >
      <Caps size={9} style={{ flex: "none" }}>{label}</Caps>
      <span
        style={
          bold
            ? { fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", textAlign: "right" }
            : { fontFamily: T.ui, fontSize: 13.5, fontWeight: 500, color: T.fg, textAlign: "right" }
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ── Skjema — samme felter, validering og action-kall som bekreft-form ── */
function BekreftSkjema({
  slug,
  start,
  coachId,
  innloggetEpost,
  innloggetNavn,
  priceOre,
}: {
  slug: string;
  start: string;
  coachId: string;
  innloggetEpost: string | null;
  innloggetNavn: string | null;
  priceOre: number;
}) {
  const [name, setName] = useState(innloggetNavn ?? "");
  const [email, setEmail] = useState(innloggetEpost ?? "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Navn er påkrevd.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Gyldig e-post er påkrevd.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 5) {
      setError("Telefonnummer er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createBookingCheckout({
        slug,
        start,
        coachId,
        name,
        email,
        phone,
        notes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Naviger til Stripe Checkout
      window.location.href = result.url;
    });
  }

  const prisTekst = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceOre / 100);

  return (
    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Inndata label="Navn" value={name} onChange={setName} placeholder="Ditt navn" />
      <Inndata label="E-post" type="email" value={email} onChange={setEmail} placeholder="din@epost.no" />
      <Inndata label="Telefon" type="tel" value={phone} onChange={setPhone} placeholder="+47 …" />
      <TekstOmraade
        label="Notater til coach (valgfri)"
        value={notes}
        onChange={setNotes}
        rows={3}
        placeholder="Hva vil du jobbe med?"
        defaultValue=""
      />

      {error && (
        <div
          role="alert"
          style={{
            borderRadius: 12,
            border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`,
            background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
            padding: "12px 15px",
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        >
          {error}
        </div>
      )}

      <Knapp type="submit" full disabled={pending} style={{ minHeight: 48, fontSize: 14 }}>
        {pending ? (
          "Sender til betaling…"
        ) : (
          <>
            Betal {prisTekst}
            <Icon name="arrow-right" size={14} />
          </>
        )}
      </Knapp>
    </form>
  );
}

/* ════════════════════════════════════════════════════════
   M-BOOKING-BEKREFT (/booking/[slug]/bekreft)
   ════════════════════════════════════════════════════════ */
export function MarkedBookingBekreftV2({
  slug,
  start,
  coachId,
  tjenesteNavn,
  datoTekst,
  klokkeslettTekst,
  durationMin,
  coachNavn,
  prisTekst,
  priceOre,
  innloggetEpost,
  innloggetNavn,
}: MarkedBookingBekreftV2Props) {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="booking">
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 20 : 28 }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <TilbakeLenke href={`/booking/${slug}`}>Velg annen tid</TilbakeLenke>
          <div style={{ marginTop: 20 }}>
            <Eyebrow>Bekreft</Eyebrow>
          </div>
          <HeroT mobile={mobile} em="bestilling">
            Bekreft
          </HeroT>
          <Lede style={{ marginTop: 16 }}>Sjekk detaljene under og fullfør betaling via Stripe.</Lede>
        </div>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
          {/* Oppsummering */}
          <Kort pad="8px 22px">
            <DetaljRad label="Tjeneste" value={tjenesteNavn} />
            <DetaljRad label="Dato" value={datoTekst} />
            <DetaljRad label="Klokkeslett" value={`${klokkeslettTekst} (${durationMin} min)`} />
            {coachNavn !== null && <DetaljRad label="Coach" value={coachNavn || "—"} />}
            <DetaljRad label="Pris" value={prisTekst} bold last />
          </Kort>

          {/* Skjema */}
          <Kort pad="22px 22px 24px">
            <BekreftSkjema
              slug={slug}
              start={start}
              coachId={coachId}
              innloggetEpost={innloggetEpost}
              innloggetNavn={innloggetNavn}
              priceOre={priceOre}
            />
          </Kort>

          <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0 }}>
            Tiden er holdt for deg i 15 minutter. Du betaler trygt via Stripe. Avbestilling senest 24 timer før gir full refusjon.
          </p>
        </div>
      </Seksjon>
    </MRamme>
  );
}
