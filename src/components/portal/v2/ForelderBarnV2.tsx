"use client";

/**
 * Foreldreportal · Barn — v2 Presis + B-pakke (status først, én vei videre).
 * Trykkbare kort per barn. Kun v2 + T.*. Enklere foreldre-språk.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PyramidArea } from "@/generated/prisma/client";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Pyramide,
  TomTilstand,
  AvatarFoto,
  Icon,
  StatusPill,
  Knapp,
  HjelpTips,
} from "@/components/v2";

/* ── Datakontrakt (1:1 med page.tsx-loaderen) ──────────────────────── */

export type ForelderBarnRad = {
  id: string;
  navn: string;
  avatarUrl: string | null;
  relationship: string;
  hcp: number | null;
  /** Fullførte økter siste 30 dager. */
  okter30d: number;
  /** Pyramide-fordeling (apex→base: TURN øverst, FYS fundament), verdi = antall økter. */
  pyramide: { akse: PyramidArea; value: number }[];
  /** Neste planlagte/aktive økt, eller null. */
  nesteOkt: { scheduledAt: Date; title: string } | null;
  /** Utestående betaling (PENDING/FAILED). */
  utestaaende: { antall: number; ore: number };
};

export type ForelderBarnData = { barn: ForelderBarnRad[] };

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n / 100);
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Nøkkeltall-celle (inline layout-lim, som BarnProgresjonKort.tall) ── */

function Stat({
  ikon,
  label,
  value,
  alert,
}: {
  ikon: string;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      style={{
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: T.rRow,
        padding: "10px 12px",
        minWidth: 0,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: T.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        <Icon name={ikon} size={11} style={{ color: T.mut }} />
        {label}
      </span>
      <span
        style={{
          display: "block",
          marginTop: 6,
          fontFamily: T.mono,
          fontSize: 13.5,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: alert ? T.down : T.fg,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Ett barn-kort ─────────────────────────────────────────────────── */

function BarnKort({
  b,
  mobile,
  onOpen,
}: {
  b: ForelderBarnRad;
  mobile: boolean;
  onOpen: () => void;
}) {
  const fornavn = b.navn.split(" ")[0];
  const etternavn = b.navn.split(" ").slice(1).join(" ");
  const okter = b.okter30d;
  const utest = b.utestaaende;

  return (
    <Kort tint hover pad="0" style={{ overflow: "hidden" }}>
      {/* Hode — trykkbart (åpner barnets profil). Stor mobil-tapflate. */}
      <button
        type="button"
        onClick={onOpen}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: mobile ? "16px 16px" : "18px 20px",
        }}
        aria-label={`Åpne profilen til ${b.navn}`}
      >
        <AvatarFoto src={b.avatarUrl} navn={b.navn} size={52} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            {b.relationship} · HCP{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {b.hcp != null ? b.hcp.toFixed(1) : "—"}
            </span>
          </span>
          <span
            style={{
              display: "block",
              marginTop: 3,
              fontFamily: T.disp,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: T.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span style={{ color: T.lime }}>{fornavn}</span>
            {etternavn ? ` ${etternavn}` : ""}
          </span>
        </span>
        <Icon name="chevron-right" size={18} style={{ color: T.mut, flex: "none" }} />
      </button>

      {/* Treningsfordeling (siste 30 dager) */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: mobile ? "14px 16px" : "14px 20px" }}>
        <Caps size={9} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="layers" size={12} style={{ color: T.mut }} />
          Hva det er trent på · 30 dager
          <HjelpTips k="pyramideAkse" size={11} />
        </Caps>
        <div style={{ marginTop: 12 }}>
          {okter > 0 ? (
            <Pyramide data={b.pyramide} max={Math.max(1, okter)} showValues />
          ) : (
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
              Ingen fullførte økter ennå — trykk for å se profilen.
            </p>
          )}
        </div>
      </div>

      {/* Nøkkeltall — økter · neste · utestående */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          borderTop: `1px solid ${T.border}`,
          padding: mobile ? "14px 16px" : "14px 20px",
        }}
      >
        <Stat ikon="trending-up" label="Økter" value={String(okter)} />
        <Stat
          ikon="calendar"
          label="Neste"
          value={b.nesteOkt ? NB_DATO.format(b.nesteOkt.scheduledAt) : "—"}
        />
        <Stat
          ikon="credit-card"
          label="Utestående"
          value={utest.antall > 0 ? ore(utest.ore) : "0 kr"}
          alert={utest.antall > 0}
        />
      </div>
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBarnV2({ data }: { data: ForelderBarnData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { barn } = data;

  const forste = barn[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>Foreldreportal · Barn</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="barn">
              Mine
            </Tittel>
          </div>
          <span
            style={{
              display: "block",
              marginTop: 8,
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.mut,
            }}
          >
            {barn.length > 0
              ? "Trykk på et kort for å se treningen."
              : "Her dukker barna opp når de er koblet."}
          </span>
        </div>
        {barn.length > 0 && (
          <StatusPill tone="up">
            {barn.length === 1 ? "1 barn" : `${barn.length} barn`}
          </StatusPill>
        )}
      </div>

      {barn.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen barn er koblet ennå"
            sub="Be spilleren sende en invitasjon fra sin profil, eller spør coachen."
          />
        </Kort>
      ) : (
        <>
          {forste && (
            <div>
              <Knapp
                icon="arrow-right"
                full={mobile}
                onClick={() => router.push(`/forelder/barn/${forste.id}`)}
              >
                Åpne {forste.navn.split(" ")[0]}
              </Knapp>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            {barn.map((b) => (
              <BarnKort
                key={b.id}
                b={b}
                mobile={mobile}
                onOpen={() => router.push(`/forelder/barn/${b.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
