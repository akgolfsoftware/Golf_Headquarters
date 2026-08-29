"use client";

/**
 * PlayerHQ Runder — Train-lock-porten.
 * Fasit: designsystem/train-lock/PH-11 Analyse runder.dc.html
 * H1 «Runder» 34/700 + mute sub «N runder i måned · snitt X», liste-rader
 * (bane / dato · hull — score + til par / SG — chevron). Live-føring består
 * som skjermens ene hvite CTA under listen.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import type { RundeRow, RunderKpis } from "@/lib/portal-runder/runder-list-data";
import { FortsettRundeCta, useHarRundeKladd } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { fmtSg } from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type RunderV2Data = {
  navn: string;
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

const MND_LANG = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const UKEDAG = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

/** PH-11-sub på rad: «Søndag 17.08 · 18 hull». */
function radSub(d: Date, hull?: number | null): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${UKEDAG[d.getDay()]} ${dd}.${mm}${hull ? ` · ${hull} hull` : ""}`;
}

function komma(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}

/** Score til par: 0 → «E», ellers signert (+3 / −2 med U+2212). */
function tilParTxt(v: number): string {
  if (v === 0) return "E";
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function RunderV2({ data }: { data: RunderV2Data }) {
  const router = useRouter();
  const harKladd = useHarRundeKladd();
  const { rows, kpis } = data;
  const tom = rows.length === 0;

  const naa = new Date();
  const iMnd = rows.filter(
    (r) => r.playedAt.getMonth() === naa.getMonth() && r.playedAt.getFullYear() === naa.getFullYear(),
  ).length;
  const sub = tom
    ? null
    : [
        iMnd > 0 ? `${iMnd} runde${iMnd === 1 ? "" : "r"} i ${MND_LANG[naa.getMonth()]}` : `${kpis.total} runder`,
        kpis.snittScore != null ? `snitt ${komma(kpis.snittScore)}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <div
      data-od-id="runder-root"
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 720,
        margin: "0 auto",
        width: "100%",
        minWidth: 0,
        fontFamily: TL.font.sans,
        color: TL.text,
      }}
    >
      <h1 style={{ margin: "2px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        Runder
      </h1>
      {sub && (
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 400, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {sub}
        </div>
      )}

      {harKladd && (
        <div style={{ marginTop: 12 }}>
          <FortsettRundeCta />
        </div>
      )}

      {tom ? (
        <div style={{ marginTop: 16, background: TL.elev, borderRadius: TL.radius.card, padding: "24px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 400, color: TL.mute, lineHeight: 1.5 }}>
            Ingen runder logget ennå. Loggfør din første runde — live-føring er raskest.
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16, background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
          {rows.map((r, i, arr) => (
            <button
              key={r.id}
              type="button"
              onClick={() => router.push(ruteDetalj(r.id))}
              className="v2-press v2-focus"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "15px 0",
                border: "none",
                borderBottom: i < arr.length - 1 ? `1px solid ${TL.hair}` : "none",
                background: "transparent",
                color: "inherit",
                fontFamily: TL.font.sans,
                textAlign: "left",
                cursor: "pointer",
                minWidth: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{r.courseName}</div>
                <div style={{ marginTop: 2, fontSize: 13, fontWeight: 400, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {radSub(r.playedAt)}
                </div>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>
                  {r.score} <span style={{ color: TL.mute }}>{tilParTxt(r.vsPar)}</span>
                </div>
                <div style={{ marginTop: 2, fontSize: 13, fontWeight: 400, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  SG {r.sgTotal == null ? "–" : fmtSg(r.sgTotal)}
                </div>
              </div>
              <ChevronRight size={16} strokeWidth={2} style={{ color: TL.mute, flex: "none" }} />
            </button>
          ))}
        </div>
      )}

      {/* Skjermens ene hvite CTA — live-føring. Sekundærveiene er tekstlenker. */}
      <Link
        href={RUTE_LIVE}
        className="v2-press v2-focus"
        style={{
          marginTop: 16,
          height: 48,
          borderRadius: 999,
          background: TL.fill,
          color: TL.onFill,
          fontSize: 16,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
        }}
      >
        Start live-føring
      </Link>
      <div style={{ marginTop: 4, display: "flex", justifyContent: "center", gap: 24 }}>
        <Link
          href={RUTE_SLAG}
          className="v2-press"
          style={{ height: 44, display: "flex", alignItems: "center", fontSize: 15, fontWeight: 600, color: TL.mute, textDecoration: "none" }}
        >
          Før slag for slag
        </Link>
        <Link
          href={RUTE_NY}
          className="v2-press"
          style={{ height: 44, display: "flex", alignItems: "center", fontSize: 15, fontWeight: 600, color: TL.mute, textDecoration: "none" }}
        >
          Hurtig score
        </Link>
      </div>
    </div>
  );
}
