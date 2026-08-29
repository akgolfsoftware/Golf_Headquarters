"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Runde-detalj.
 * Fasit: designsystem/train-lock/PH-12 Analyse én runde.dc.html
 * H1 bane 34/700 + mute sub «dato · hull · score (+par)», SG-tall, scorekort.
 */

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { UpGameImportModal } from "@/app/portal/mal/runder/[id]/upgame-import-modal";
import { Kort, Rad, StatusPill, MikroMeta, TomTilstand, KpiFlis, SgKategorier, HjelpTips, type ScorekortHull, type SgKategori } from "@/components/v2";
/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type GranulaerSgData = {
  tee: number | null;
  app200: number | null;
  app150: number | null;
  app100: number | null;
  app50: number | null;
  chip: number | null;
  pitch: number | null;
  bunker: number | null;
  putt0_3: number | null;
  putt3_5: number | null;
  putt5_10: number | null;
  putt10_15: number | null;
  putt15_25: number | null;
  putt25_40: number | null;
  putt40plus: number | null;
};

/** Aggregert scorekort-statistikk (D6a) — kun fra ekte HoleScore-rader. */
export type HullStat = {
  ut: { score: number; par: number; antall: number };
  inn: { score: number; par: number; antall: number };
  /** null når ingen hull har putter logget. */
  putter: { totalt: number; hull: number } | null;
  /** null når fairway ikke er logget på noe hull (par 3 teller aldri). */
  fairway: { treff: number; av: number } | null;
  /** null når GIR ikke er logget på noe hull. */
  gir: { treff: number; av: number } | null;
};

export type RundeDetaljData = {
  id: string;
  /** True rett etter lagring fra live/etterpå-føring (?lagret=1). */
  nettoppLagret?: boolean;
  baneNavn: string;
  datoTekst: string;
  score: number;
  /** Sum av par for spilte hull (delvis runde) — ikke alltid banens fulle par. */
  par: number;
  antallSpilteHull: number;
  sgTotal: number | null;
  /** Kun kategorier med beregnet SG (null-verdier er filtrert bort på serveren). */
  sgKategorier: SgKategori[];
  /** "beregnet" = fra komplett slag-kjede, "manual" = håndtastet, null = ingen SG. */
  sgSource: "beregnet" | "manual" | null;
  /** Hull-for-hull — HoleScore-sannhet eller Shot-avledet fallback. */
  hull: ScorekortHull[];
  erEier: boolean;
  /** Vis «fullfør kjeden»-banner (eier, har scorekort, SG ikke ferdig beregnet/manuell). */
  visKjedeStatus: boolean;
  antallKomplette: number;
  antallHullMedScore: number;
  /** UT/INN + putter/FW/GIR fra scorekortet — null når hulldata mangler. */
  hullStat: HullStat | null;
  granulaerSg: GranulaerSgData;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** Kort par-differanse med retning: «+2», «−1», «E». */
function tilKortParTekst(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

function sgTekst(v: number | null): string {
  if (v == null) return "—";
  return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2).replace(".", ",")}`;
}

/** Buckets med minst én ekte verdi (aldri en rad der alt er «— ingen slag» pga tomt datasett). */
function BucketKort({
  tittel,
  rader,
}: {
  tittel: string;
  rader: Array<[string, number | null]>;
}) {
  return (
    <Kort eyebrow={tittel} pad="12px 18px">
      {rader.map(([navn, v], i) => (
        <Rad
          key={navn}
          last={i === rader.length - 1}
          title={navn}
          trailing={
            <span
              style={{
                fontFamily: TL.font.mono,
                fontSize: 12,
                fontWeight: 700,
                color: v == null ? TL.mute : v >= 0 ? TL.ok : TL.danger,
              }}
            >
              {v == null ? "— ingen slag" : sgTekst(v)}
            </span>
          }
        />
      ))}
    </Kort>
  );
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function RundeDetaljV2({ data }: { data: RundeDetaljData }) {
  const diff = data.score - data.par;
  const harHull = data.hull.length > 0;
  const sgTotalTekst = sgTekst(data.sgTotal);

  const g = data.granulaerSg;
  const harGranulaerData =
    Object.values(g).some((v) => v != null) && data.sgTotal != null;

  return (
    <div data-paper-portal-runde-detalj data-paper-slug="playerhq-runde-detalj" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Tilbake */}
      <Link href="/portal/mal/runder" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <MikroMeta icon="arrow-left">Runder</MikroMeta>
      </Link>

      {/* PH-12-hode: bane 34/700 + mute sub «dato · hull · score slag (+par)» */}
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: TL.font.sans,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: TL.text,
          }}
        >
          {data.baneNavn}
        </h1>
        <div
          style={{
            marginTop: 4,
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 400,
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {data.datoTekst}
          {data.antallSpilteHull > 0 ? ` · ${data.antallSpilteHull} hull` : ""} · {data.score} slag ({tilKortParTekst(diff)})
        </div>
      </div>
      <div className="grid grid-cols-3" style={{ gap: 8 }}>
        <KpiFlis label="Score (brutto)" value={String(data.score)} instant />
        <KpiFlis label="Mot par" value={tilKortParTekst(diff)} instant />
        <KpiFlis label="SG totalt" value={sgTotalTekst} hjelp="sgTotal" instant />
      </div>

      {/* GO V2: rett etter lagring er dette en KVITTERING, ikke en handlings-meny.
          Kortet bekrefter og peker videre — den ene neste handlingen er CTA-pilla
          under. Import/detalj-redigering ligger fortsatt i den stille sekundær-
          raden lenger nede (ingen funksjon fjernet, bare avlastet hierarki). */}
      {data.nettoppLagret && data.erEier && (
        <Kort>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text, margin: 0 }}>
              Runden er lagret
            </p>
            {data.sgTotal != null && <StatusPill tone="up">SG klar</StatusPill>}
          </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "6px 0 0" }}>
            {data.sgTotal != null
              ? "Strokes Gained er klar — se tallene under."
              : "Mangler hull-score for full Strokes Gained. Neste steg står rett under."}
          </p>
        </Kort>
      )}

      {/* B: én primær CTA tidlig */}
      {data.erEier && data.visKjedeStatus ? (
        <Link href={`/portal/mal/runder/${data.id}/fullfor`} style={{ textDecoration: "none", display: "block" }}>
<span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Fullfør slag-kjeden</span>
        </Link>
      ) : data.erEier && !harHull ? (
        <Link href={`/portal/mal/runder/${data.id}/hull`} style={{ textDecoration: "none", display: "block" }}>
<span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Legg til hull-for-hull</span>
        </Link>
      ) : (
        <Link href="/portal/coach/melding" style={{ textDecoration: "none", display: "block" }}>
<span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Del med coach</span>
        </Link>
      )}

      {/* SG per kategori — fasit: første kort, før scorekortet */}
      {data.sgTotal == null ? (
        <Kort eyebrow="SG per kategori">
          <TomTilstand
            icon="trending-up"
            title="Ingen SG beregnet for denne runden"
            sub="Runden er registrert med hurtig score. Før hull for hull med slag for å få SG og scorekort."
          />
        </Kort>
      ) : data.sgKategorier.length > 0 ? (
        <SgKategorier kategorier={data.sgKategorier} hjelp="sgOmrade" desimaler={2} />
      ) : (
        <Kort eyebrow="SG per kategori">
          <TomTilstand icon="trending-up" title="Ingen kategori-data" sub="—" />
        </Kort>
      )}

      {/* Granulære buckets — kun når kjeden faktisk ga bucket-nivå-data */}
      {harGranulaerData && (
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          <BucketKort
            tittel="Tee og innspill — per avstand"
            rader={[
              ["Tee-slag", g.tee],
              ["200 m+", g.app200],
              ["150–200 m", g.app150],
              ["100–150 m", g.app100],
              ["50–100 m", g.app50],
            ]}
          />
          <BucketKort
            tittel="Nærspill"
            rader={[
              ["Chip (≤12 m)", g.chip],
              ["Pitch", g.pitch],
              ["Bunker", g.bunker],
            ]}
          />
          <BucketKort
            tittel="Putting — per lengde (ft)"
            rader={[
              ["0–3 ft", g.putt0_3],
              ["3–5 ft", g.putt3_5],
              ["5–10 ft", g.putt5_10],
              ["10–15 ft", g.putt10_15],
              ["15–25 ft", g.putt15_25],
              ["25–40 ft", g.putt25_40],
              ["40 ft+", g.putt40plus],
            ]}
          />
        </div>
      )}

      {/* Scorekort — fasit: tabell Hull/Par/Score/Mot par + Sum, klebrig hode */}
      {harHull ? (
        <>
          <Kort eyebrow={`Scorekort · ${data.hull.length} hull`}>
            <div style={{ maxHeight: 280, overflow: "auto", borderTop: `1px solid ${TL.hair}`, marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Hull", "Par", "Score", "Mot par"].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          position: "sticky",
                          top: 0,
                          background: TL.elev,
                          textAlign: i === 0 ? "left" : "right",
                          fontFamily: TL.font.mono,
                          fontSize: 9.5,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: TL.mute,
                          fontWeight: 500,
                          padding: "8px 4px",
                          borderBottom: `1px solid ${TL.hair}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.hull.map((h, i) => {
                    const d = h.score - h.par;
                    const td = (hoyre: boolean, farge?: string): CSSProperties => ({
                      padding: "8px 4px",
                      borderBottom: i === data.hull.length - 1 ? "none" : `1px solid ${TL.hair}`,
                      fontSize: 12.5,
                      ...(hoyre ? { textAlign: "right" as const, fontFamily: TL.font.mono, fontVariantNumeric: "tabular-nums" as const } : {}),
                      ...(farge ? { color: farge } : {}),
                    });
                    return (
                      <tr key={h.nr}>
                        <td style={td(false)}>{h.nr}</td>
                        <td style={td(true)}>{h.par}</td>
                        <td style={td(true)}>{h.score}</td>
                        <td style={td(true, d > 0 ? TL.danger : d < 0 ? TL.ok : undefined)}>{tilKortParTekst(d)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: "8px 4px 0", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>Sum</td>
                    <td style={{ padding: "8px 4px 0", textAlign: "right", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{data.par}</td>
                    <td style={{ padding: "8px 4px 0", textAlign: "right", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{data.score}</td>
                    <td
                      style={{
                        padding: "8px 4px 0",
                        textAlign: "right",
                        fontFamily: TL.font.mono,
                        fontSize: 11,
                        color: diff > 0 ? TL.danger : diff < 0 ? TL.ok : TL.mute,
                      }}
                    >
                      {tilKortParTekst(diff)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Kort>
          {/* Putt · fairway · gir — fasit-rader, kun tall som faktisk er logget */}
          {data.hullStat && (data.hullStat.putter || data.hullStat.fairway || data.hullStat.gir) && (
            <Kort eyebrow="Putt · fairway · gir" pad="12px 18px">
              {(() => {
                const s = data.hullStat;
                const rader: Array<{ key: string; navn: ReactNode; innhold: ReactNode }> = [];
                if (s.putter) {
                  rader.push({
                    key: "putter",
                    navn: <>Putter totalt <HjelpTips k="putter" size={11} /></>,
                    innhold: (
                      <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 600, color: TL.text }}>
                        {s.putter.totalt} putt · {s.putter.hull} hull
                      </span>
                    ),
                  });
                }
                if (s.fairway) {
                  rader.push({
                    key: "fairway",
                    navn: <>Fairway truffet <HjelpTips k="fairwayTreff" size={11} /></>,
                    innhold: (
                      <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 600, color: TL.text }}>
                        {s.fairway.treff} av {s.fairway.av}
                      </span>
                    ),
                  });
                }
                if (s.gir) {
                  rader.push({
                    key: "gir",
                    navn: <>Green in regulation <HjelpTips k="gir" size={11} /></>,
                    innhold: (
                      <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 600, color: TL.text }}>
                        {s.gir.treff} av {s.gir.av}
                      </span>
                    ),
                  });
                }
                return rader.map((r, i) => (
                  <Rad key={r.key} last={i === rader.length - 1} title={r.navn} trailing={r.innhold} />
                ));
              })()}
            </Kort>
          )}
          {data.visKjedeStatus && (
            <Link
              href={`/portal/mal/runder/${data.id}/fullfor`}
              style={{ textDecoration: "none" }}
            >
              <Kort pad="10px 16px">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: TL.warn, flexShrink: 0 }} />
                  <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: 0, lineHeight: 1.5 }}>
                    SG venter på slag-kjeden: {data.antallKomplette} av {data.antallHullMedScore} hull
                    komplette. <span style={{ color: TL.fill, fontWeight: 700 }}>Fullfør kjeden</span> for
                    full Strokes Gained.
                  </p>
                </div>
              </Kort>
            </Link>
          )}
          {data.erEier && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <UpGameImportModal roundId={data.id} />
              <Link
                href={`/portal/mal/runder/${data.id}/hull`}
                style={{ textDecoration: "none" }}
              >
                <MikroMeta icon="pencil">Rediger hull-for-hull</MikroMeta>
              </Link>
              <Link
                href={`/portal/mal/runder/${data.id}/slag`}
                style={{ textDecoration: "none" }}
              >
                <MikroMeta icon="list">Avansert redigering (slag for slag)</MikroMeta>
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          <Kort eyebrow="Scorekort">
            <TomTilstand
              icon="flag"
              title="Ingen hull-for-hull ennå"
              sub="Kun totalscore er registrert for denne runden."
            />
            {data.erEier && (
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Link
                  href="/portal/runde/logg"
                  style={{
                    textDecoration: "none",
                    fontFamily: TL.font.sans,
                    fontSize: 12,
                    fontWeight: 600,
                    color: TL.mute,
                  }}
                >
                  Eller før slag for slag →
                </Link>
              </div>
            )}
          </Kort>
        </>
      )}

      {/* Sekundær vei — primær CTA er øverst */}
      <Link
        href="/portal/analysere"
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
        Se SG-trend i Analyse →
      </Link>
    </div>
  );
}
