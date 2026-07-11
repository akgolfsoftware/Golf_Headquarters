"use client";

/**
 * PlayerHQ Runde-detalj — v2 (retning C «Presis»). Rekomponert fra
 * legacy-skjermen (portal/(legacy)/mal/runder/[id]): score-hero, scorekort
 * hull-for-hull (kun ekte Shot-data — ærlig tomtekst ellers) og SG per
 * kategori. Gjenbruker datavis-fasitkomponentene Scorekort + SgKategorier.
 *
 * «?»-regelen: SG total forklares via hjelpetekst-nøkkelen sgTotal, SG per
 * kategori via sgOmrade. Ingen fabrikkerte tall — null vises som «—».
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
  MikroMeta,
  TomTilstand,
  KpiFlis,
  Scorekort,
  SgKategorier,
  type ScorekortHull,
  type SgKategori,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type RundeDetaljData = {
  id: string;
  baneNavn: string;
  datoTekst: string;
  score: number;
  par: number;
  sgTotal: number | null;
  /** Kun kategorier med beregnet SG (null-verdier er filtrert bort på serveren). */
  sgKategorier: SgKategori[];
  /** Hull-for-hull fra Shot-modellen — tom liste når slag ikke er registrert. */
  hull: ScorekortHull[];
  erEier: boolean;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

function tilParTekst(diff: number): string {
  if (diff === 0) return "even par";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function RundeDetaljV2({ data }: { data: RundeDetaljData }) {
  const diff = data.score - data.par;
  const harHull = data.hull.length > 0;
  const sgTotalTekst =
    data.sgTotal == null
      ? "—"
      : `${data.sgTotal >= 0 ? "+" : "−"}${Math.abs(data.sgTotal).toFixed(1).replace(".", ",")}`;

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

      {/* Scorekort — kun ekte Shot-data */}
      {harHull ? (
        <>
          <Scorekort
            hull={data.hull}
            sammendrag={{ score: data.score, par: data.par, sg: data.sgTotal }}
            hjelp="sgTotal"
          />
          {data.erEier && (
            <Link
              href={`/portal/mal/runder/${data.id}/slag`}
              style={{ textDecoration: "none", alignSelf: "flex-start" }}
            >
              <MikroMeta icon="pencil">Rediger slag</MikroMeta>
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
                <Link href={`/portal/mal/runder/${data.id}/slag`} style={{ textDecoration: "none" }}>
                  <CTAPill icon="plus">Registrer slag-for-slag</CTAPill>
                </Link>
              </div>
            )}
          </Kort>
        </>
      )}

      {/* Strokes Gained per kategori */}
      {data.sgKategorier.length > 0 ? (
        <SgKategorier kategorier={data.sgKategorier} hjelp="sgOmrade" />
      ) : (
        <Kort>
          <TomTilstand
            icon="trending-up"
            title="SG mangler for denne runden"
            sub="Strokes Gained beregnes når runden har nok slagdata."
          />
        </Kort>
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
