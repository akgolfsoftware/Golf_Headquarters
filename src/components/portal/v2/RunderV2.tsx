"use client";

/**
 * PlayerHQ Runder (PH-07) — liste over de 50 siste rundene.
 *
 * Sannhetsregler, se `lib/portal-runder/runde-omfang.ts`:
 *   - Mot par vises bare når runden har scorekort. Ellers «—».
 *   - Brutto er summen av spilte hull. Ni hull måles mot par 36, ikke 72.
 *   - Bruttosnittet i undertittelen gjelder 18-hullsrunder alene.
 *   - SG vises bare med kjent metode, og estimat merkes som estimat.
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

/** Sub på rad: «Søndag 17.08 · 18 hull», eller «· hull ikke ført» når scorekortet mangler. */
function radSub(d: Date, hull: number | null): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hullTekst = hull == null ? "hull ikke ført" : `${hull} hull`;
  return `${UKEDAG[d.getDay()]} ${dd}.${mm} · ${hullTekst}`;
}

function komma(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}

/** Score til par: ukjent → «—», 0 → «E», ellers signert (+3 / −2 med U+2212). */
function tilParTxt(v: number | null): string {
  if (v == null) return "—";
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
        kpis.snitt18 != null ? `snitt ${komma(kpis.snitt18.snitt)} over 18 hull` : null,
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
                  {radSub(r.playedAt, r.antallSpilteHull)}
                </div>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>
                  {r.score} <span style={{ color: TL.mute }}>{tilParTxt(r.vsPar)}</span>
                </div>
                <div style={{ marginTop: 2, fontSize: 13, fontWeight: 400, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {r.sg.vis ? (
                    <>
                      SG {fmtSg(r.sg.verdi)}
                      {r.sg.erEstimat && (
                        <span style={{ marginLeft: 4, fontVariantNumeric: "normal" }} title={r.sg.forklaring}>
                          (estimat)
                        </span>
                      )}
                    </>
                  ) : (
                    "SG —"
                  )}
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
      <div style={{ marginTop: 4, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
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
          Score og manuell SG
        </Link>
      </div>
    </div>
  );
}
