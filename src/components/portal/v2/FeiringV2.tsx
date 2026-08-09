"use client";

/**
 * PlayerHQ · Plan-feiring — v2 Presis + B-pakke (status + én primær «ny plan»).
 * Ekte gjennomføring/SG-delta. T.* only.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
  RingMaaler,
  HjelpTips,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export type FeiringV2Data = {
  planNavn: string;
  prosent: number;
  ferdige: number;
  total: number;
  erRekord: boolean;
  /** SG-deltaer (snitt 5 runder før vs. etter planen) — null = ikke beregnet. */
  eff: {
    total: number | null;
    ott: number | null;
    app: number | null;
    arg: number | null;
    putt: number | null;
  } | null;
  personligRekord: number | null;
  antallPlaner: number;
};

function formatDelta(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2).replace(".", ",")}`;
}

function deltaFarge(v: number | null): string {
  if (v === null) return T.mut;
  if (v > 0.05) return T.up;
  if (v < -0.05) return T.down;
  return T.mut;
}

function SgCelle({ label, v }: { label: string; v: number | null }) {
  const farge = deltaFarge(v);
  return (
    <div  data-paper-slug="playerhq-feiring" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: "12px 4px", minWidth: 0 }}>
      <Caps size={8.5}>{label}</Caps>
      {v !== null && (
        <Icon name={v >= 0 ? "trending-up" : "trending-down"} size={13} style={{ color: farge }} />
      )}
      <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: farge }}>
        {formatDelta(v)}
      </span>
    </div>
  );
}

export function FeiringV2({ data }: { data: FeiringV2Data }) {
  const visSammenligning = data.personligRekord !== null && data.eff !== null && data.eff.total !== null;

  return (
    <div data-paper-wave-f="feiring" data-od-id="playerhq-feiring" style={{ maxWidth: 520, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Paper topp — fasit: Plan fullført */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Plan fullført</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>{data.planNavn}</span>
      </div>
      {/* Hero */}
      <Kort tint pad="26px 22px">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <RingMaaler label="Periode" value={data.prosent} min={0} max={100} unit="%" size={124} />
          <Caps color={T.handling}>Periode fullført</Caps>
          <div style={{ fontFamily: T.disp, fontSize: 22, fontWeight: 600, color: T.fg }}>Utrolig gjennomkjøring!</div>
          <p style={{ fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.fg2, maxWidth: 340, margin: 0 }}>
            {data.planNavn} er fullført. {data.ferdige} av {data.total} økter gjennomført.
          </p>
        </div>
      </Kort>

      {/* Personlig rekord */}
      {data.erRekord && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="star" size={18} style={{ color: T.handling, flex: "none" }} />
            <div style={{ minWidth: 0 }}>
              <Caps color={T.handling}>Personlig rekord</Caps>
              <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, marginTop: 3 }}>
                Beste SG-Total-delta hittil — bygg videre på dette.
              </div>
            </div>
          </div>
        </Kort>
      )}

      {/* Planfremgang */}
      <Kort eyebrow="Planfremgang">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, lineHeight: 0.95, fontVariantNumeric: "tabular-nums", color: T.up }}>
            {data.ferdige}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 14, color: T.mut }}>/{data.total} fullført</span>
        </div>
        <div style={{ marginTop: 12, height: 7, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
          <div style={{ width: `${data.prosent}%`, height: "100%", borderRadius: 9999, background: T.handling, /* enTing */ opacity: 0.95 }} />
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 9 }}>
          {data.planNavn} · {data.total} {data.total === 1 ? "uke" : "uker"}
        </div>
      </Kort>

      {/* SG-utvikling */}
      {data.eff ? (
        <Kort
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Strokes Gained — utvikling
              <HjelpTips k="sgOmrade" size={11} />
            </span>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            <SgCelle label="Total" v={data.eff.total} />
            <SgCelle label="OTT" v={data.eff.ott} />
            <SgCelle label="APP" v={data.eff.app} />
            <SgCelle label="ARG" v={data.eff.arg} />
            <SgCelle label="PUTT" v={data.eff.putt} />
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "12px 0 0" }}>
            Snitt SG — 5 runder før vs. etter planen.
          </p>
        </Kort>
      ) : (
        <Kort>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
            Ikke nok runde-data ennå til SG-delta. Spill noen runder — vi regner det automatisk.
          </p>
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/runde/live" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill ghost full icon="flag">
                Start live-føring
              </CTAPill>
            </Link>
          </div>
        </Kort>
      )}

      {/* Mot tidligere planer */}
      {visSammenligning && data.eff && (
        <Kort
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Mot tidligere planer
              <HjelpTips k="sgTotal" size={11} />
            </span>
          }
        >
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <Caps size={9}>Denne planen</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: deltaFarge(data.eff.total), marginTop: 5 }}>
                {formatDelta(data.eff.total)}
              </div>
            </div>
            <div>
              <Caps size={9}>Beste tidligere</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: deltaFarge(data.personligRekord), marginTop: 5 }}>
                {formatDelta(data.personligRekord)}
              </div>
            </div>
            <div>
              <Caps size={9}>Planer totalt</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg, marginTop: 5 }}>
                {data.antallPlaner}
              </div>
            </div>
          </div>
        </Kort>
      )}

      {/* B: én primær + tekst-sekundær */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 24 }}>
        <Link
          href="/portal/planlegge/workbench?zoom=uke"
          data-od-id="feiring-neste"
          className="v2-press v2-focus"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 56, // paper enTing

            width: "100%",
            borderRadius: 12,
            background: T.handling, /* enTing */
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Planlegg neste periode
        </Link>
        <Link
          href="/portal"
          style={{
            textDecoration: "none",
            display: "block",
            textAlign: "center",
            fontFamily: T.ui,
            fontSize: 12,
            fontWeight: 600,
            color: T.mut,
          }}
        >
          Tilbake til hjem →
        </Link>
      </div>
    </div>
  );
}
