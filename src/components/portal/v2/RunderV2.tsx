"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Runder — v2 Presis + B-pakke (KPI-status + én primær live-føring).
 * Liste + snitt. Tom = full grønn vei til live-føring. T.* only.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RundeRow, RunderKpis } from "@/lib/portal-runder/runder-list-data";
import { FortsettRundeCta, useHarRundeKladd } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { fmtSg, Caps, Kort, KpiFlis, Knapp, Rad, TomTilstand, Icon, HjelpTips } from "@/components/v2";
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
        background: beste ? TL.ok : TL.dim,
        border: `1px solid ${beste ? TL.ok : TL.hair}`,
        color: beste ? TL.elev : TL.text,
      }}
    >
      <span style={{ fontFamily: TL.font.mono, fontSize: 16, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{score}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 600, marginTop: 2, opacity: 0.72, fontVariantNumeric: "tabular-nums" }}>{tilParTxt(tilPar)}</span>
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function RunderV2({ data }: { data: RunderV2Data }) {
  const router = useRouter();
  const harKladd = useHarRundeKladd();
  const { navn, hcp, rows, kpis } = data;
  const tom = rows.length === 0;

  const aar = new Date().getFullYear();
  const sub = `${navn ? `${navn} · ` : ""}Sesong ${aar}${hcp != null ? ` · HCP ${komma(hcp)}` : ""}`;

  const snittScore = kpis.snittScore != null ? String(Math.round(kpis.snittScore)) : "–";
  const snittSg = kpis.sgTotalSnitt != null ? fmtSg(kpis.sgTotalSnitt) : "–";

  return (
    <div  data-paper-slug="playerhq-runder-liste" data-paper-portal-runder style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}>
      {/* Hode — fasit: h1 «Runder» + mono-sub «navn · Sesong år · HCP» */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Runder</h1>
          <span className="num" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            {sub}
            {hcp != null && <HjelpTips k="hcp" size={11} />}
          </span>
        </div>
        <div className="hidden md:flex" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <FortsettRundeCta variant="pill" />
          <Link href={RUTE_LIVE} style={{ textDecoration: "none" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 16px",
              borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
            }}>Start live-føring</span>
          </Link>
          <Link href={RUTE_SLAG} style={{ textDecoration: "none" }}>
            <Knapp ghost icon="pencil">Før slag for slag</Knapp>
          </Link>
          <Link href={RUTE_NY} style={{ textDecoration: "none" }}>
            <Knapp ghost icon="plus">Hurtig score</Knapp>
          </Link>
        </div>
      </div>

      {/* Fortsett kladd — mobil, kun når kladd faktisk finnes (aldri tomt kort-skall) */}
      {harKladd && (
        <div className="md:hidden">
          <Kort pad="4px 16px">
            <FortsettRundeCta />
          </Kort>
        </div>
      )}

      {/* B: status først (også tom) */}
      <div className="grid grid-cols-3" style={{ gap: 16 }}>
        <KpiFlis label="Snittscore · brutto" value={tom ? "—" : snittScore} hjelp="bruttoScore" />
        <KpiFlis label="Snitt SG" value={tom ? "—" : snittSg} hjelp="sgTotal" />
        <KpiFlis label="Runder" value={tom ? "0" : String(kpis.total)} tint />
      </div>

      {tom ? (
        <Kort>
          <TomTilstand
            icon="flag"
            title="Ingen runder logget ennå"
            sub="Loggfør din første runde — live-føring er raskest."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <Link href={RUTE_LIVE} style={{ textDecoration: "none", display: "block" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
                borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
              }}>Start live-føring
              </span>
            </Link>
            <Link
              href={RUTE_NY}
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                fontFamily: TL.font.sans,
                fontSize: 12,
                fontWeight: 600,
                color: TL.mute,
              }}
            >
              Hurtig score — deretter importer fra UpGame på rundedetalj →
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {/* B: én primær CTA full på mobil; desktop har den i hodet */}
          <div className="flex md:hidden" style={{ flexDirection: "column", gap: 8 }}>
            <Link href={RUTE_LIVE} style={{ textDecoration: "none", display: "block" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
                borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
              }}>Start live-føring
              </span>
            </Link>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href={RUTE_SLAG} style={{ textDecoration: "none" }}>
                <Knapp ghost icon="pencil">Før slag for slag</Knapp>
              </Link>
              <Link href={RUTE_NY} style={{ textDecoration: "none" }}>
                <Knapp ghost icon="plus">Hurtig score</Knapp>
              </Link>
            </div>
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
                    {r.isBest && <Icon name="star" size={12} style={{ color: TL.ok, flex: "none" }} />}
                  </span>
                }
                sub={`${datoTxt(r.playedAt)} · Par ${r.par}`}
                meta={
                  <span
                    style={{
                      fontFamily: TL.font.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: r.sgTotal == null ? TL.mute : r.sgTotal < 0 ? TL.danger : TL.ok,
                      width: 48,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.sgTotal == null ? "–" : fmtSg(r.sgTotal)}
                  </span>
                }
                trailing={<Icon name="chevron-right" size={16} style={{ color: TL.mute, flex: "none" }} />}
                last={i === arr.length - 1}
              />
            ))}
          </Kort>
        </>
      )}
    </div>
  );
}
