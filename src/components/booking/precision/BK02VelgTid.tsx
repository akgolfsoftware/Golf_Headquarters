"use client";

/**
 * BK-02 Velg tid — offentlig booking i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/booking/screens/BK.jsx, steg «Tid»). Rute: /booking/[slug].
 *
 * Bevisste avvik fra tegningen:
 *   - Tjenesten er valgt før denne siden (den ligger i adressen), så steg 1 er ferdig.
 *   - Bare dagsvisning. Tegningen har også ukevisning; appen henter ledige tider for én
 *     dag om gangen (?dato=), og en uke ville kreve syv oppslag per sidevisning.
 *   - Dagene er de neste 14 (tegningen har uke 40), lenker som bruker ?dato=.
 *   - Raden viser coachens navn, ikke «Studio 1»: stedet lagres ikke på ledige tider.
 *   - «Fortsett» er en lenke til /bekreft når en tid er valgt, som før.
 */
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarX } from "lucide-react";
import { Knapp, KnappLenke, Meta, TomTilstand } from "@/components/precision/pa";
import { Nokkelverdi, Kort } from "@/components/precision/pa-a4";
import { Varsel } from "@/components/precision/pa-planhub";
import { BookingSkall, BookingSteg } from "./BookingSkall";
import { klokkeslett, tidTekst } from "./format";

export type BK02Tjeneste = { slug: string; name: string; description: string | null; prisTekst: string; durationMin: number };
export type BK02Dag = { iso: string; dagsnavn: string; datotekst: string; valgt: boolean };
export type BK02Slot = { start: string; end: string; coachId: string; coachName: string };
export type BK02Props = {
  tjeneste: BK02Tjeneste;
  dager: BK02Dag[];
  valgtDatoTekst: string;
  slots: BK02Slot[];
};

export function BK02VelgTid({ tjeneste, dager, valgtDatoTekst, slots }: BK02Props) {
  const [valgt, setValgt] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const slot = slots.find((s) => s.start + s.coachId === valgt) ?? null;
  const href = slot ? `/booking/${tjeneste.slug}/bekreft?${new URLSearchParams({ start: slot.start, coach: slot.coachId }).toString()}` : null;

  return (
    <BookingSkall>
      <BookingSteg na={1} />
      <h1 style={{ margin: 0, font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.2 var(--font-sans)" }}>Velg tid</h1>
      <div className="bk-kols">
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div className="bk-dager" role="group" aria-label="Velg dag">
            {dager.map((d) => (
              <Link key={d.iso} href={`/booking/${tjeneste.slug}?dato=${d.iso}`} className="pa-choice" aria-current={d.valgt ? "date" : undefined}>
                {d.dagsnavn} {d.datotekst}
              </Link>
            ))}
          </div>
          <Meta>{valgtDatoTekst.toUpperCase()}</Meta>
          {slots.length === 0 ? (
            <TomTilstand icon={CalendarX} title="Ingen ledige tider denne dagen" text="Prøv en annen dag." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {slots.map((s) => {
                const id = s.start + s.coachId;
                return (
                  <button key={id} type="button" className="bk-slot" aria-pressed={valgt === id} onClick={() => { setValgt(id); setFeil(null); }}>
                    <span className="bk-slot__tid">{klokkeslett(s.start)}</span>
                    <span className="bk-slot__coach">{s.coachName}</span>
                  </button>
                );
              })}
            </div>
          )}
          {feil && <Varsel tone="warn">{feil}</Varsel>}
        </div>
        <div className="bk-oppsummering">
          <Kort pad={16} gap={10}>
            <span className="kicker">Din booking</span>
            <Nokkelverdi
              items={[
                ["Tjeneste", `${tjeneste.name} ${tjeneste.durationMin} min`],
                ["Tid", slot ? tidTekst(slot.start) : null, { mono: true }],
                ["Pris", tjeneste.prisTekst, { mono: true, hint: "FAST PRIS · SERVICETYPE" }],
              ]}
            />
          </Kort>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke variant="ghost" href="/booking">Tilbake</KnappLenke>
        {href ? (
          <KnappLenke icon={ArrowRight} href={href}>Fortsett</KnappLenke>
        ) : (
          <Knapp icon={ArrowRight} onClick={() => setFeil("Velg et ledig tidspunkt.")}>Fortsett</Knapp>
        )}
      </div>
    </BookingSkall>
  );
}
