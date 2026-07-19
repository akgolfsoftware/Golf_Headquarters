"use client";

/**
 * PlayerHQ Runder — v2 (retning C «Presis»). Rekomponert fra den ekte skjermen
 * (src/app/portal/mal/runder/page.tsx → RundeListeSide, v13) med SAMME funksjon
 * og datakontrakt: runde-liste + KPI-strip, brutto score alltid, ★beste-markør,
 * rad → detalj/scorekort (/portal/mal/runder/[id]). Kun v2-komponenter fra
 * "@/components/v2"; ingen ad-hoc UI, ingen rå hex (kun T.*-tokens).
 *
 * Datakontrakten er getRunderListModel (rows + kpis) + fornavn/hcp. Tom-tilstand
 * (0 runder) er ærlig — aldri fabrikkerte tall. hrefs bygges av de kanoniske
 * rutene i klient (funksjoner kan ikke krysse server→klient-grensen).
 *
 * V2Shell (montert i (v2preview)/v2-runder/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RundeRow, RunderKpis } from "@/lib/portal-runder/runder-list-data";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  CTAPill,
  Knapp,
  Rad,
  TomTilstand,
  Icon,
  HjelpTips,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type RunderV2Data = {
  fornavn: string;
  hcp: number | null;
  rows: RundeRow[];
  kpis: RunderKpis;
};

/** Kanoniske ruter (funksjons-hrefs kan ikke sendes server→klient). */
const RUTE_NY = "/portal/mal/runder/ny";
const RUTE_LIVE = "/portal/runde/live";
const RUTE_SLAG = "/portal/runde/logg";
const ruteDetalj = (id: string) => `/portal/mal/runder/${id}`;

/* ── Rene hjelpere (norsk bokmål, brutto score) ────────────────────── */

const MND = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];

/** «18. mai 2026». */
function datoTxt(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]} ${d.getFullYear()}`;
}
/** Tall → norsk komma-desimal. */
function komma(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}
/** Score til par: 0 → «E», ellers signert (+3 / −2 med U+2212). */
function tilParTxt(v: number): string {
  if (v === 0) return "E";
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
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

/* ── Score-boks (rad-leading) ──────────────────────────────────────── */

function ScoreBoks({ score, tilPar, beste }: { score: number; tilPar: number; beste?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 46,
        height: 46,
        flex: "none",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: beste ? T.lime : T.panel3,
        border: `1px solid ${beste ? "transparent" : T.border}`,
        color: beste ? T.onLime : T.fg,
      }}
    >
      <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{score}</span>
      <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, marginTop: 2, opacity: 0.72, fontVariantNumeric: "tabular-nums" }}>{tilParTxt(tilPar)}</span>
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function RunderV2({ data }: { data: RunderV2Data }) {
  const mobile = useMobile();
  const router = useRouter();
  const { fornavn, hcp, rows, kpis } = data;
  const tom = rows.length === 0;

  const aar = new Date().getFullYear();
  const eyebrow = `Sesong ${aar}${hcp != null ? ` · HCP ${komma(hcp)}` : ""}`;

  const snittScore = kpis.snittScore != null ? String(Math.round(kpis.snittScore)) : "–";
  const snittSg = kpis.sgTotalSnitt != null ? fmtSg(kpis.sgTotalSnitt) : "–";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Caps>{eyebrow}</Caps>
            {hcp != null && <HjelpTips k="hcp" size={11} />}
          </span>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="runder">{fornavn ? `${fornavn}s` : "Dine"}</Tittel>
          </div>
        </div>
        <div className="hidden md:flex" style={{ gap: 8 }}>
          <Link href={RUTE_LIVE} style={{ textDecoration: "none" }}>
            <CTAPill icon="flag">Start live-føring</CTAPill>
          </Link>
          <Link href={RUTE_SLAG} style={{ textDecoration: "none" }}>
            <Knapp ghost icon="pencil">Før slag for slag</Knapp>
          </Link>
          <Link href={RUTE_NY} style={{ textDecoration: "none" }}>
            <Knapp ghost icon="plus">Hurtig score</Knapp>
          </Link>
        </div>
      </div>

      {tom ? (
        <Kort>
          <TomTilstand
            icon="flag"
            title="Ingen runder logget ennå"
            sub="Loggfør din første 18-hulls runde, eller importer historikken fra GolfBox."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginTop: 4 }}>
            <Link href={RUTE_LIVE} style={{ textDecoration: "none" }}>
              <CTAPill icon="flag">Start live-føring</CTAPill>
            </Link>
            <Link href={RUTE_NY} style={{ textDecoration: "none" }}>
              <Knapp ghost icon="plus">Loggfør runde</Knapp>
            </Link>
            <Link href={RUTE_NY} style={{ textDecoration: "none" }}>
              <Knapp ghost icon="download">Importer fra GolfBox</Knapp>
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {/* Mobil-CTA (desktop har knappene i hodet) */}
          <div className="flex md:hidden" style={{ gap: 8, flexWrap: "wrap" }}>
            <Link href={RUTE_LIVE} style={{ textDecoration: "none", flex: "1 1 100%", display: "flex" }}>
              <CTAPill icon="flag">Start live-føring</CTAPill>
            </Link>
            <Link href={RUTE_SLAG} style={{ textDecoration: "none" }}>
              <Knapp ghost icon="pencil">Slag for slag</Knapp>
            </Link>
            <Link href={RUTE_NY} style={{ textDecoration: "none" }}>
              <Knapp ghost icon="plus">Hurtig score</Knapp>
            </Link>
          </div>

          {/* KPI-strip */}
          <div className="grid grid-cols-3" style={{ gap: T.gap }}>
            <KpiFlis label="Snittscore · brutto" value={snittScore} hjelp="bruttoScore" />
            <KpiFlis label="Snitt SG" value={snittSg} hjelp="sgTotal" />
            <KpiFlis label="Runder" value={String(kpis.total)} tint />
          </div>

          {/* Runde-historikk */}
          <Kort eyebrow="Runde-historikk" action={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Caps size={9}>{rows.length} runder</Caps><HjelpTips k="tilPar" size={11} /></span>}>
            {rows.map((r, i, arr) => (
              <Rad
                key={r.id}
                onClick={() => router.push(ruteDetalj(r.id))}
                leading={<ScoreBoks score={r.score} tilPar={r.vsPar} beste={r.isBest} />}
                title={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {r.courseName}
                    {r.isBest && <Icon name="star" size={12} style={{ color: T.lime, flex: "none" }} />}
                  </span>
                }
                sub={`${datoTxt(r.playedAt)} · Par ${r.par}`}
                meta={
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: r.sgTotal == null ? T.mut : r.sgTotal < 0 ? T.down : T.up,
                      width: 48,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.sgTotal == null ? "–" : fmtSg(r.sgTotal)}
                  </span>
                }
                trailing={<Icon name="chevron-right" size={16} style={{ color: T.mut, flex: "none" }} />}
                last={i === arr.length - 1}
              />
            ))}
          </Kort>
        </>
      )}
    </div>
  );
}
