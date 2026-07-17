"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Tjeneste + tidspunktvalg (/booking/[slug],
   retning C «Presis»). v2-port 16. juli 2026 av (mlegacy)/booking/[slug]/
   page.tsx + slot-picker.tsx sitt presentasjonslag. BEVISST UENDRET:
   dag-lenkene (?dato=ISO), slot-lenkene (bekreft?start&coach), slot-gruppering
   per coach, klokkeslett-formatering (nb-NO på klient, som originalens
   slot-picker) og all copy. Slot-henting/coach-filtrering/dagliste bor i
   page.tsx (server) — kun utseendet er nytt. Chrome: delt MRamme. */

import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Kort, Caps, TilbakeLenke, TomTilstand } from "@/components/v2";
import { MRamme, Eyebrow, HeroT, Seksjon, useMobile } from "./marked-ramme";

/* ── Datakontrakter (serialisert i page.tsx) ───────────── */
export type TjenesteInfo = {
  slug: string;
  name: string;
  description: string | null;
  prisTekst: string; // ferdig formatert i page.tsx (Intl nb-NO NOK — samme kilde som før)
  durationMin: number;
};
export type TjenesteDag = {
  iso: string;
  dagsnavn: string;
  datotekst: string;
  valgt: boolean;
};
export type TjenesteSlot = {
  start: string; // ISO
  end: string; // ISO
  coachId: string;
  coachName: string;
};

export interface MarkedBookingTjenesteV2Props {
  tjeneste: TjenesteInfo;
  dager: TjenesteDag[];
  valgtDatoTekst: string;
  slots: TjenesteSlot[];
}

/* ── Slot-velger (tidligere slot-picker.tsx, samme gruppering) ── */
function SlotVelger({ slug, slots, mobile }: { slug: string; slots: TjenesteSlot[]; mobile: boolean }) {
  const grouped = slots.reduce<Record<string, { coachName: string; slots: TjenesteSlot[] }>>((acc, s) => {
    if (!acc[s.coachId]) {
      acc[s.coachId] = { coachName: s.coachName, slots: [] };
    }
    acc[s.coachId].slots.push(s);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 18 }}>
      {Object.entries(grouped).map(([coachId, group]) => (
        <div key={coachId}>
          <Caps size={9} style={{ marginBottom: 10 }}>{group.coachName}</Caps>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: 8 }}>
            {group.slots.map((slot) => {
              const tid = new Date(slot.start).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const params = new URLSearchParams({ start: slot.start, coach: slot.coachId });
              return (
                <Link
                  key={slot.start + slot.coachId}
                  href={`/booking/${slug}/bekreft?${params.toString()}`}
                  className="v2-press v2-focus"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: T.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: T.fg,
                    background: T.panel2,
                    border: `1px solid ${T.borderS}`,
                    borderRadius: 10,
                    padding: "10px 0",
                    textDecoration: "none",
                  }}
                >
                  {tid}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M-BOOKING-TJENESTE (/booking/[slug]) — dag + ledige tider
   ════════════════════════════════════════════════════════ */
export function MarkedBookingTjenesteV2({ tjeneste, dager, valgtDatoTekst, slots }: MarkedBookingTjenesteV2Props) {
  const mobile = useMobile();

  return (
    <MRamme mobile={mobile} aktiv="booking">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 20 : 28 }}>
        <TilbakeLenke href="/booking">Alle tjenester</TilbakeLenke>
        <div style={{ marginTop: 20 }}>
          <Eyebrow>Booking</Eyebrow>
        </div>
        <HeroT mobile={mobile}>{tjeneste.name}</HeroT>
        {tjeneste.description && (
          <p style={{ fontFamily: T.ui, fontSize: 15, color: T.fg2, lineHeight: 1.6, margin: "16px 0 0", maxWidth: 560 }}>
            {tjeneste.description}
          </p>
        )}
        <div style={{ display: "flex", gap: mobile ? 24 : 40, marginTop: 22, flexWrap: "wrap" }}>
          <span>
            <Caps size={9}>Pris</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 5 }}>
              {tjeneste.prisTekst}
            </span>
          </span>
          <span>
            <Caps size={9}>Varighet</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums", display: "block", marginTop: 5 }}>
              {tjeneste.durationMin} min
            </span>
          </span>
        </div>
      </Seksjon>

      {/* Velg dag — horisontal 14-dagers stripe (samme ?dato-lenker som før) */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0, paddingBottom: mobile ? 16 : 20 }}>
        <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>Velg dag</h2>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginTop: 16 }}>
          {dager.map((d) => (
            <Link
              key={d.iso}
              href={`/booking/${tjeneste.slug}?dato=${d.iso}`}
              className="v2-press v2-focus"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                flex: "none",
                minWidth: 72,
                padding: "10px 12px 12px",
                borderRadius: 12,
                background: d.valgt ? T.lime : T.panel2,
                border: `1px solid ${d.valgt ? "transparent" : T.border}`,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: d.valgt ? T.onLime : T.mut,
                }}
              >
                {d.dagsnavn}
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 13.5, fontWeight: 700, color: d.valgt ? T.onLime : T.fg, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {d.datotekst}
              </span>
            </Link>
          ))}
        </div>
      </Seksjon>

      {/* Ledige tider */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
          Ledige tider{" "}
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 400, color: T.mut, letterSpacing: 0 }}>{valgtDatoTekst}</span>
        </h2>
        {slots.length === 0 ? (
          <Kort pad="26px 20px" style={{ marginTop: 18 }}>
            <TomTilstand icon="clock" title="Ingen ledige tider denne dagen" sub="Prøv en annen dag." />
          </Kort>
        ) : (
          <SlotVelger slug={tjeneste.slug} slots={slots} mobile={mobile} />
        )}
      </Seksjon>
    </MRamme>
  );
}
