"use client";

/**
 * PlayerHQ Runde-detalj — v2 (retning C «Presis»). Rekomponert fra
 * legacy-skjermen (portal/(legacy)/mal/runder/[id]): score-hero, scorekort
 * hull-for-hull (HoleScore er sannheten, Shot-avledet som fallback), SG per
 * kategori og granulære SG-buckets (fra SG slag-for-slag-pakken, 10. juli).
 * Gjenbruker datavis-fasitkomponentene Scorekort + SgKategorier.
 *
 * «?»-regelen: SG total forklares via hjelpetekst-nøkkelen sgTotal, SG per
 * kategori via sgOmrade. Ingen fabrikkerte tall — null vises som «—», og
 * SG vises aldri før slag-kjeden er komplett («vi gjetter aldri»).
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  CTAPill,
  StatusPill,
  MikroMeta,
  TomTilstand,
  KpiFlis,
  Scorekort,
  SgKategorier,
  HjelpTips,
  type ScorekortHull,
  type SgKategori,
} from "@/components/v2";

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

export type RundeDetaljData = {
  id: string;
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
  granulaerSg: GranulaerSgData;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

function tilParTekst(diff: number): string {
  if (diff === 0) return "even par";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

function sgTekst(v: number | null): string {
  if (v == null) return "—";
  return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2).replace(".", ",")}`;
}

const SG_KATEGORI_NAVN: Record<string, string> = {
  OTT: "tee-slagene",
  APP: "innspillene",
  ARG: "nærspillet",
  PUTT: "puttingen",
};

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
                fontFamily: T.mono,
                fontSize: 12,
                fontWeight: 700,
                color: v == null ? T.mut : v >= 0 ? T.up : T.down,
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

  // Største lekkasje blant hovedkategoriene (kun negative — ellers ingen linje).
  const verste = data.sgKategorier
    .filter((k) => k.sg < 0)
    .sort((a, b) => a.sg - b.sg)[0];
  const storsteLekkasje = verste
    ? `${SG_KATEGORI_NAVN[verste.akse] ?? verste.akse} (${sgTekst(verste.sg)})`
    : null;

  const g = data.granulaerSg;
  const harGranulaerData =
    Object.values(g).some((v) => v != null) && data.sgTotal != null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Tilbake */}
      <Link href="/portal/mal/runder" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <MikroMeta icon="arrow-left">Alle runder</MikroMeta>
      </Link>

      {/* Hode */}
      <div>
        <Caps>
          {data.baneNavn} · {data.datoTekst}
        </Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em={`${tilParTekst(diff)}.`}>{data.score}</Tittel>
        </div>
      </div>

      {/* Scorekort — HoleScore-sannhet / Shot-avledet fallback */}
      {harHull ? (
        <>
          <Scorekort
            hull={data.hull}
            sammendrag={{ score: data.score, par: data.par, sg: data.sgTotal }}
            hjelp="sgTotal"
          />
          {data.visKjedeStatus && (
            <Link
              href={`/portal/mal/runder/${data.id}/fullfor`}
              style={{ textDecoration: "none" }}
            >
              <Kort pad="10px 16px">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: T.warn, flexShrink: 0 }} />
                  <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                    SG venter på slag-kjeden: {data.antallKomplette} av {data.antallHullMedScore} hull
                    komplette. <span style={{ color: T.lime, fontWeight: 700 }}>Fullfør kjeden</span> for
                    full Strokes Gained.
                  </p>
                </div>
              </Kort>
            </Link>
          )}
          {data.erEier && (
            <Link
              href={`/portal/mal/runder/${data.id}/slag`}
              style={{ textDecoration: "none", alignSelf: "flex-start" }}
            >
              <MikroMeta icon="pencil">Avansert redigering</MikroMeta>
            </Link>
          )}
        </>
      ) : (
        <>
          {/* Sammendrag uten hulldata */}
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: T.gap }}>
            <KpiFlis label="Score" value={String(data.score)} />
            <KpiFlis label="Til par" value={tilParTekst(diff)} />
            <KpiFlis label="SG total" value={sgTotalTekst} hjelp="sgTotal" />
          </div>
          <Kort>
            <TomTilstand
              icon="flag"
              title="Hull-for-hull mangler"
              sub="Slag er ikke registrert for denne runden ennå."
            />
            {data.erEier && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                <Link href="/portal/runde/logg" style={{ textDecoration: "none" }}>
                  <CTAPill icon="plus">Før slag for slag</CTAPill>
                </Link>
              </div>
            )}
          </Kort>
        </>
      )}

      {/* Strokes Gained — hvor slagene ble tjent og tapt (vi gjetter aldri) */}
      {data.sgTotal == null ? (
        <Kort>
          <TomTilstand
            icon="trending-up"
            title="Ingen Strokes Gained ennå"
            sub="Strokes Gained krever slag-for-slag-kjeden — vi gjetter aldri."
          />
          {data.erEier && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <Link
                href={
                  data.antallHullMedScore > 0
                    ? `/portal/mal/runder/${data.id}/fullfor`
                    : "/portal/runde/logg"
                }
                style={{ textDecoration: "none" }}
              >
                <CTAPill ghost icon={data.antallHullMedScore > 0 ? "check" : "plus"}>
                  {data.antallHullMedScore > 0 ? "Fullfør kjeden" : "Før slag for slag"}
                </CTAPill>
              </Link>
            </div>
          )}
        </Kort>
      ) : (
        <>
          <Kort
            eyebrow={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                Strokes Gained <HjelpTips k="sgOmrade" size={11} />
              </span>
            }
            action={
              data.sgSource === "beregnet" ? (
                <StatusPill tone="up">Beregnet fra slag-kjeden</StatusPill>
              ) : data.sgSource === "manual" ? (
                <StatusPill tone="info">Manuelt ført</StatusPill>
              ) : undefined
            }
          >
            {data.sgKategorier.length > 0 ? (
              <SgKategorier kategorier={data.sgKategorier} />
            ) : (
              <TomTilstand icon="trending-up" title="Ingen kategori-data" sub="—" />
            )}
            {storsteLekkasje && (
              <p
                style={{
                  fontFamily: T.ui,
                  fontSize: 12,
                  color: T.mut,
                  margin: "12px 0 0",
                  paddingTop: 12,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                Største lekkasje:{" "}
                <span style={{ fontWeight: 700, color: T.down }}>{storsteLekkasje}</span>
              </p>
            )}
          </Kort>

          {/* Granulære buckets — kun når kjeden faktisk ga bucket-nivå-data */}
          {harGranulaerData && (
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: T.gap }}>
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
        </>
      )}

      {/* Knapperad */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/portal/analysere" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="trending-up">
            Se SG-trend
          </CTAPill>
        </Link>
        <Link href="/portal/coach/melding" style={{ textDecoration: "none" }}>
          <CTAPill icon="send">Del med coach</CTAPill>
        </Link>
      </div>
    </div>
  );
}
