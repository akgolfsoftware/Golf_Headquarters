"use client";

/**
 * HurtigOpprett — liten hurtigvelger-popup for trykk på en tom luke i
 * kalenderflatene (I1, masterplanens Bølge 1). Samme overlay-mønster som
 * NyOktArk i WorkbenchV2Sheets (fixed overlay, backdrop-klikk lukker,
 * T.*-tokens, aldri rå hex).
 *
 * To valg:
 *  - «Ny booking» → /admin/bookinger/ny?start=<dato>T<klokkeslett>
 *    (wizarden leser ?start= og prefyller Dato & tid).
 *  - «Ny økt» → /admin/planlegge (låst beslutning: Planlegge er ETT
 *    trykkpunkt inn i Workbench). Planlegge/Workbench har ingen
 *    ?start=-støtte ennå — lenken bærer derfor ingen param (kjent gap).
 */

import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Caps, Knapp } from "./core";
import { Icon } from "./icon";

export interface HurtigOpprettProps {
  /** ISO-dato «YYYY-MM-DD» fra luken som ble trykket. */
  dato: string;
  /** «HH:MM» foreslått fra lukens posisjon. */
  klokkeslett: string;
  onLukk: () => void;
}

/**
 * Foreslå klokkeslett for en tom luke: neste hele/halve slot etter forrige
 * aktivitet (start «HH:MM» + varighet), ellers 09:00. Klemmes til 06:00–21:00.
 */
export function foreslaTid(sisteStartKl?: string, varighetMin = 60): string {
  if (!sisteStartKl) return "09:00";
  const [h, m] = sisteStartKl.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "09:00";
  const min = Math.max(6 * 60, Math.min(21 * 60, h * 60 + m + varighetMin));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
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
        borderRadius: T.rRow,
        background: T.panel2,
        border: `1px solid ${T.border}`,
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
          background: T.tint,
          border: `1px solid ${T.borderS}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.lime,
        }}
      >
        <Icon name={icon} size={15} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{tittel}</span>
        <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>{sub}</span>
      </span>
      <Icon name="chevron-right" size={14} style={{ color: T.mut, marginLeft: "auto", flex: "none" }} />
    </Link>
  );
}

export function HurtigOpprett({ dato, klokkeslett, onLukk }: HurtigOpprettProps) {
  // Menneskelig dato-etikett («mandag 13. juli») fra ISO-datoen — kun visning.
  const d = new Date(`${dato}T00:00`);
  const datoLabel = Number.isNaN(d.getTime())
    ? dato
    : new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long" }).format(d);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opprett i tom luke"
      style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={onLukk}
        style={{ position: "absolute", inset: 0, background: `color-mix(in srgb, ${T.bg} 62%, transparent)`, backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "relative",
          width: "min(360px, 100%)",
          background: T.panel,
          border: `1px solid ${T.borderS}`,
          borderRadius: T.rCard,
          padding: "18px 20px 20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps size={8.5}>Tom luke</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, marginTop: 5 }}>
              {datoLabel}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
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
              background: T.panel2,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="x" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <Valg
            href={`/admin/bookinger/ny?start=${dato}T${klokkeslett}`}
            icon="calendar-check"
            tittel="Ny booking"
            sub="Veiviser med dato og tid ferdig utfylt"
          />
          <Valg
            href="/admin/planlegge"
            icon="plus"
            tittel="Ny økt"
            sub="Planlegg i Workbench — velg spiller først"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <Knapp ghost onClick={onLukk}>Avbryt</Knapp>
        </div>
      </div>
    </div>
  );
}
