"use client";

/**
 * HurtigOpprett — liten hurtigvelger-popup for trykk på en tom luke i
 * kalenderflatene (I1, masterplanens Bølge 1). Samme overlay-mønster som
 * NyOktArk i WorkbenchV2Sheets (fixed overlay, backdrop-klikk lukker,
 * T.*-tokens, aldri rå hex).
 *
 * Steg 5 (2026-07-28): øverst ligger nå et komplett bookingskjema, så en kunde
 * kan legges inn direkte i luka uten å bytte visning. Lenkene under er
 * fortsatt der for de lengre veiene.
 *
 * Tre valg:
 *  - «Ny booking» → /admin/bookinger/ny?start=<dato>T<klokkeslett>
 *    (wizarden leser ?start= og prefyller Dato & tid).
 *  - «Ny økt» → /admin/plan?start=YYYY-MM-DDTHH:mm (prefyller øktplanlegger).
 *  - «Ny hendelse» (I3) → /admin/kalender/hendelse/ny?start=<dato>T<klokkeslett>
 *    — ferie/stengt anlegg/møte som blokkerer booking i tidsrommet.
 */

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { foreslaGridTid, tilStartParam } from "@/lib/calendar/notion-grid";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Knapp } from "./core";
import { Icon } from "./icon";
import { hentBookingValg, bookIKalender, type BookingValg } from "@/app/admin/kalender/booking-actions";
export interface HurtigOpprettProps {
  /** ISO-dato «YYYY-MM-DD» fra luken som ble trykket. */
  dato: string;
  /** «HH:MM» foreslått fra lukens posisjon. */
  klokkeslett: string;
  onLukk: () => void;
}

/**
 * Foreslå klokkeslett for en tom luke: neste 30-min slot etter forrige
 * aktivitet. Klemmes til Notion-grid 04:00–23:00.
 */
export function foreslaTid(sisteStartKl?: string, varighetMin = 60): string {
  return foreslaGridTid(sisteStartKl, varighetMin);
}

function Valg({ href, icon, tittel, sub }: { href: string; icon: string; tittel: string; sub: string }) {
  return (
    <Link
      href={href}
      className="v2-press v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 13px",
        borderRadius: TL.radius.row,
        background: TL.dock,
        border: `1px solid ${TL.hair}`,
        textDecoration: "none",
        minHeight: 44,
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          flex: "none",
          borderRadius: 9999,
          background: TL.dim,
          border: `1px solid ${TL.hair}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: TL.fill,
        }}
      >
        <Icon name={icon} size={15} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 700, color: TL.text }}>{tittel}</span>
        <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>{sub}</span>
      </span>
      <Icon name="chevron-right" size={14} style={{ color: TL.mute, marginLeft: "auto", flex: "none" }} />
    </Link>
  );
}


/* ── HurtigBooking (steg 5) — book en kunde rett i luka. Kollisjonsvernet
   ligger i server-actionen, så 2-til-1-økter slipper gjennom mens ekte
   dobbeltbooking avvises med klarspråk. ── */
function HurtigBooking({
  dato,
  klokkeslett,
  onFerdig,
}: {
  dato: string;
  klokkeslett: string;
  onFerdig: () => void;
}) {
  const [valg, setValg] = useState<BookingValg | null>(null);
  const [spillerId, setSpillerId] = useState("");
  const [tjenesteId, setTjenesteId] = useState("");
  const [stedId, setStedId] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [lagrer, startLagre] = useTransition();

  useEffect(() => {
    let avbrutt = false;
    hentBookingValg()
      .then((v) => {
        if (avbrutt) return;
        setValg(v);
        // Forhåndsvelg når det bare finnes ett fornuftig alternativ.
        if (v.tjenester.length > 0) setTjenesteId(v.tjenester[0].id);
        if (v.steder.length === 1) setStedId(v.steder[0].id);
      })
      .catch(() => {
        if (!avbrutt) setFeil("Kunne ikke hente tjenester og spillere");
      });
    return () => {
      avbrutt = true;
    };
  }, []);

  const valgtTjeneste = valg?.tjenester.find((t) => t.id === tjenesteId);
  const klar = Boolean(spillerId && tjenesteId && stedId) && !lagrer;

  function book() {
    setFeil(null);
    startLagre(async () => {
      const res = await bookIKalender({
        spillerId,
        serviceTypeId: tjenesteId,
        locationId: stedId,
        start: `${dato}T${klokkeslett}`,
      });
      if (res.ok) {
        setOk(true);
        onFerdig();
      } else {
        setFeil(res.feil);
      }
    });
  }

  const feltStil: React.CSSProperties = {
    width: "100%",
    background: TL.dock,
    border: `1px solid ${TL.hair}`,
    borderRadius: 8,
    padding: "7px 9px",
    fontFamily: TL.font.sans,
    fontSize: 12.5,
    color: TL.text,
    marginTop: 3,
    boxSizing: "border-box",
  };
  const merke: React.CSSProperties = {
    fontFamily: TL.font.mono,
    fontSize: 9,
    fontWeight: 700,
    color: TL.mute,
  };

  if (!valg) {
    return (
      <div style={{ marginTop: 14, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
        {feil ?? "Henter tjenester …"}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
      <Caps size={8.5}>Book kunde her</Caps>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <label style={merke}>
          Spiller
          <select style={feltStil} value={spillerId} onChange={(e) => setSpillerId(e.target.value)}>
            <option value="">Velg spiller …</option>
            {valg.spillere.map((s) => (
              <option key={s.id} value={s.id}>{s.navn}</option>
            ))}
          </select>
        </label>
        <label style={merke}>
          Tjeneste
          <select style={feltStil} value={tjenesteId} onChange={(e) => setTjenesteId(e.target.value)}>
            {valg.tjenester.map((t) => (
              <option key={t.id} value={t.id}>
                {t.navn} · {t.varighetMin} min
                {t.maxDeltakere > 1 ? ` · ${t.maxDeltakere} plasser` : ""}
              </option>
            ))}
          </select>
        </label>
        <label style={merke}>
          Sted
          <select style={feltStil} value={stedId} onChange={(e) => setStedId(e.target.value)}>
            <option value="">Velg sted …</option>
            {valg.steder.map((s) => (
              <option key={s.id} value={s.id}>{s.navn}</option>
            ))}
          </select>
        </label>

        {valgtTjeneste && valgtTjeneste.maxDeltakere > 1 && (
          <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>
            Delt økt — inntil {valgtTjeneste.maxDeltakere} spillere i samme luke.
          </div>
        )}
        {feil && (
          <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.text }}>{feil}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Knapp icon="check" disabled={!klar} onClick={book}>
            {lagrer ? "Booker …" : ok ? "Booket" : "Book"}
          </Knapp>
        </div>
      </div>
    </div>
  );
}

export function HurtigOpprett({ dato, klokkeslett, onLukk }: HurtigOpprettProps) {
  // Menneskelig dato-etikett («mandag 13. juli») fra ISO-datoen — kun visning.
  const d = new Date(`${dato}T00:00`);
  const datoLabel = Number.isNaN(d.getTime())
    ? dato
    : new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long" }).format(d);
  const startParam = tilStartParam(dato, klokkeslett);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opprett i tom luke"
      style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={onLukk}
        style={{ position: "absolute", inset: 0, background: `color-mix(in srgb, ${TL.scene} 62%, transparent)`, backdropFilter: "none" }}
      />
      <div
        style={{
          position: "relative",
          width: "min(360px, 100%)",
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.card,
          padding: "18px 20px 20px",
          boxShadow: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps size={8.5}>Tom luke</Caps>
            <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: TL.text, marginTop: 5 }}>
              {datoLabel}
            </div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: TL.mute, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
              kl. {klokkeslett}
            </div>
          </div>
          <button
            type="button"
            onClick={onLukk}
            aria-label="Lukk"
            className="v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: TL.dock,
              border: `1px solid ${TL.hair}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="x" size={14} style={{ color: TL.mute }} />
          </button>
        </div>

        <HurtigBooking dato={dato} klokkeslett={klokkeslett} onFerdig={onLukk} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <Valg
            href={`/admin/bookinger/ny?start=${dato}T${klokkeslett}`}
            icon="calendar-check"
            tittel="Ny booking"
            sub="Veiviser med dato og tid ferdig utfylt"
          />
          <Valg
            href={`/admin/plan?start=${encodeURIComponent(startParam)}`}
            icon="plus"
            tittel="Ny økt"
            sub={`${datoLabel} · ${klokkeslett} — åpner planlegger med tid ferdig`}
          />
          <Valg
            href={`/admin/kalender/hendelse/ny?start=${dato}T${klokkeslett}`}
            icon="x-circle"
            tittel="Ny hendelse"
            sub="Ferie, stengt anlegg, møte — blokkerer booking"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <Knapp ghost onClick={onLukk}>Avbryt</Knapp>
        </div>
      </div>
    </div>
  );
}
