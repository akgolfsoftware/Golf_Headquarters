"use client";

/**
 * TrackManSessionDetail — TM-11 «TrackMan-økt-detalj», hovedskjermen for én
 * TrackMan-økt.
 * Fasit: designsystem/train-lock/TM-11 Okt-detalj komplett.dc.html
 * Fasit: designsystem/train-lock/PH-14 TrackMan detalj.dc.html
 * Fasit: designsystem/train-lock/TM-00 Komponenter.dc.html (KPI-stripe:
 * TmKpiStrip — 2×2 på iPhone, 4 i rad fra 768px — og TmFindingList-radformen).
 * «Funn»-lista (Klynge/Spredning/Smash/Face mot path/Mot forrige) følger
 * innholdet i designsystem/train-lock/TM-02 TrackMan økt.dc.html og
 * designsystem/train-lock/TM-08 Okt med hullkart.dc.html — de to fasitene
 * er samme skjerm i to revisjoner (TM-08 er TM-02 ETT steg senere i
 * fasit-nummerrekken, med hullkart lagt til bak spredningen). Vi følger
 * TM-08/TM-07 for selve kartet og begge for «Funn»-listas innhold — IKKE
 * sitert som fullt portet: layoutet her forblir ÉN sentrert kolonne (720px
 * maks) på alle bredder, mens TM-08c (iPad) splitter kart|sidebar og TM-08d
 * (Mac 1440) er et 3-pane skall (rail + økt-liste 280px + kart|funn) — den
 * responsive re-strukturen er IKKE bygget (ville kreve en økt-liste-sidebar,
 * utenfor denne filens ansvar). «Mot forrige» (Funn-listas siste rad) er
 * nærmeste TIDLIGERE økt med samme kølle — ren les-side-aggregering i
 * page.tsx (ingen ny datamodell), sendt hit som ferdig norsk tekst i
 * `forrigeDeltaTekst`.
 * Rekkefølge (låst, HANDOFF §TRACKMAN — rørt IKKE): CaddieLeak
 * → KPI-stripe → DispersionMap (hero) → bøtte-bar → «Funn»-liste → tabell.
 *
 * Server-komponenten (page.tsx) gjør auth + Prisma-henting + regner
 * dispersion-resultatet (computeTrackManDispersionMap) og sender et rent,
 * serialiserbart resultat hit — ingen Prisma/DB-logikk i klient-komponenten.
 */

import { useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { DispersionMap, DispersionBucketBar, type SigmaLevel } from "./DispersionMap";
import { ShotSheet } from "./ShotSheet";
import { holeMapVariantFor } from "./HoleMap";
import type { DispersionMapResult, DispersionMapShot } from "@/lib/trackman/dispersion-map";

function komma(v: number | null, d: number): string {
  if (v == null) return "—";
  return v.toFixed(d).replace(".", ",");
}

function KpiTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 10.5,
          letterSpacing: TL.track.capsSm,
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 22,
          fontWeight: 700,
          color: TL.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {unit ? <span style={{ fontSize: 12, color: TL.mute, marginLeft: 3 }}>{unit}</span> : null}
      </span>
    </div>
  );
}

/** TM-00 TmFindingList-radformen: tittel + caps-holder venstre, verdi høyre, delelinje mellom rader. */
function FunnRad({
  tittel,
  holder,
  verdi,
  mutedVerdi,
  siste,
}: {
  tittel: string;
  holder: string;
  verdi: string;
  mutedVerdi?: boolean;
  siste?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: siste ? "none" : `1px solid ${TL.hair}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>{tittel}</div>
        <div style={{ marginTop: 2, fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
          {holder}
        </div>
      </div>
      <span style={{ fontFamily: TL.font.mono, fontSize: 14.5, fontWeight: 600, color: mutedVerdi ? TL.mute : TL.text, fontVariantNumeric: "tabular-nums" }}>
        {verdi}
      </span>
    </div>
  );
}

/**
 * «Funn»-lista — TM-00 komponent 4 / TM-02 «Funn»: lekkasjen står først,
 * ALDRI rød. Rekkefølge låst (HANDOFF §TRACKMAN): Klynge → Spredning →
 * Smash → Face mot path → Mot forrige.
 */
function FunnListe({ result, forrigeDeltaTekst }: { result: DispersionMapResult; forrigeDeltaTekst: string | null }) {
  const klyngeVerdi =
    result.offlineBias == null
      ? "—"
      : Math.abs(result.offlineBias) < 1
        ? "midt på linja"
        : `${komma(Math.abs(result.offlineBias), 1)} m ${result.offlineBias > 0 ? "høyre" : "venstre"}`;
  return (
    <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "0 16px" }}>
      <FunnRad tittel="Klynge" holder="Lekkasje" verdi={klyngeVerdi} />
      <FunnRad tittel="Spredning" holder="Holder" verdi={result.carrySpreadP90P10 != null ? `${komma(result.carrySpreadP90P10, 0)} m P90−P10` : "—"} />
      <FunnRad tittel="Smash" holder="Holder" verdi={komma(result.meanSmash, 2)} />
      <FunnRad
        tittel="Face mot path"
        holder="Tall"
        verdi={result.meanFaceToPath != null ? `${result.meanFaceToPath > 0 ? "+" : ""}${komma(result.meanFaceToPath, 1)}°` : "—"}
      />
      <FunnRad tittel="Mot forrige" holder="Tall" verdi={forrigeDeltaTekst ?? "Ingen tidligere økt"} mutedVerdi siste />
    </div>
  );
}

export interface TrackManSessionDetailProps {
  club: string;
  dateText: string;
  sourceLabel: string;
  result: DispersionMapResult;
  allShotsHref: string;
  /** TM-02/TM-08 «Funn»-listas siste rad — ferdig norsk tekst, eller null uten tidligere økt med samme kølle. */
  forrigeDeltaTekst?: string | null;
}

export function TrackManSessionDetail({ club, dateText, sourceLabel, result, allShotsHref, forrigeDeltaTekst = null }: TrackManSessionDetailProps) {
  const [sigma, setSigma] = useState<SigmaLevel>(1);
  const [showBias, setShowBias] = useState(false);
  const [selectedShot, setSelectedShot] = useState<DispersionMapShot | null>(null);
  const variant = holeMapVariantFor(club);

  const selectedIndex = selectedShot ? result.shots.findIndex((s) => s.id === selectedShot.id) : -1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}>
      <style>{`@media (min-width: 768px) { .tm-kpistripe { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
      <div>
        <span
          style={{
            fontFamily: TL.font.mono,
            fontSize: 11,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {sourceLabel}
        </span>
        <h1 style={{ margin: "2px 0 0", fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, color: TL.text }}>
          {club} · {dateText}
        </h1>
      </div>

      {/* CaddieLeak — én setning, aldri essay. Ingen setning under MIN_SHOTS_FOR_ELLIPSE. */}
      {result.caddieSentence && (
        <div
          style={{
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: "12px 14px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <Icon name="target" size={16} style={{ color: TL.mute, marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text, lineHeight: 1.45 }}>
            {result.caddieSentence}
          </p>
        </div>
      )}

      {/* KPI-stripe: Carry / Offline / 1σ / Smash — TM-00 TmKpiStrip: 2×2 på iPhone, 4 i rad fra iPad/desktop. */}
      <div
        className="tm-kpistripe"
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}
      >
        <KpiTile label="Carry" value={komma(result.medianCarry, 0)} unit="m" />
        <KpiTile
          label="Offline"
          value={result.offlineBias == null ? "—" : `${result.offlineBias > 0 ? "+" : ""}${komma(result.offlineBias, 1)}`}
          unit="m"
        />
        <KpiTile label="1σ" value={result.hasEllipse ? komma(result.oneSigmaRadius, 1) : "—"} unit={result.hasEllipse ? "m" : undefined} />
        <KpiTile label="Smash" value={komma(result.meanSmash, 2)} />
      </div>
      {!result.hasEllipse && (
        <span
          style={{
            fontFamily: TL.font.mono,
            fontSize: 10,
            letterSpacing: TL.track.capsSm,
            textTransform: "uppercase",
            color: TL.mute,
            marginTop: -10,
          }}
        >
          Fra 8 slag
        </span>
      )}

      {/* DispersionMap — HERO */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "inline-flex", background: TL.dim, borderRadius: TL.radius.pill, padding: 2 }}>
            {([1, 2] as SigmaLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                disabled={!result.hasEllipse}
                onClick={() => setSigma(lvl)}
                style={{
                  border: "none",
                  cursor: result.hasEllipse ? "pointer" : "default",
                  background: sigma === lvl ? TL.fill : "transparent",
                  color: sigma === lvl ? TL.onFill : TL.mute,
                  borderRadius: TL.radius.pill,
                  padding: "4px 12px",
                  fontFamily: TL.font.mono,
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: result.hasEllipse ? 1 : 0.5,
                }}
              >
                {lvl}σ
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowBias((v) => !v)}
            style={{
              border: `1px solid ${TL.hair}`,
              background: showBias ? TL.dim : "transparent",
              color: TL.mute,
              borderRadius: TL.radius.pill,
              padding: "4px 10px",
              fontFamily: TL.font.mono,
              fontSize: 10.5,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Icon name="arrow-up-right" size={12} />
            Bias-pil
          </button>
        </div>

        <DispersionMap
          shots={result.shots}
          oneSigmaEllipse={result.oneSigmaEllipse}
          twoSigmaEllipse={result.twoSigmaEllipse}
          hasEllipse={result.hasEllipse}
          sigma={sigma}
          selectedShotId={selectedShot?.id ?? null}
          onSelectShot={setSelectedShot}
          showBiasArrow={showBias}
          variant={variant}
        />

        {!result.hasEllipse && (
          <p style={{ margin: "8px 2px 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
            For få slag til ellipse. Median står når n ≥ 5.
          </p>
        )}
      </div>

      {/* Findings — tre bøtter */}
      {result.hasEllipse && (
        <DispersionBucketBar good={result.bucketShare.good} acceptable={result.bucketShare.acceptable} disaster={result.bucketShare.disaster} />
      )}

      {/* «Funn» — TM-00 TmFindingList / TM-02 «Funn»-lista: lekkasjen står først. */}
      <FunnListe result={result} forrigeDeltaTekst={forrigeDeltaTekst} />

      {/* Primær CTA */}
      <Link
        href={allShotsHref}
        style={{
          alignSelf: "flex-start",
          background: TL.fill,
          color: TL.onFill,
          borderRadius: TL.radius.pill,
          padding: "10px 18px",
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Se alle slag
      </Link>

      {/* Tabell — # · Carry · Side · Smash · Launch */}
      <div id="alle-slag" style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: TL.font.mono, fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${TL.hair}` }}>
              {["#", "Carry", "Side", "Smash", "Launch"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: h === "#" ? "left" : "right",
                    padding: "8px 12px",
                    color: TL.mute,
                    fontWeight: 400,
                    fontSize: 10.5,
                    letterSpacing: TL.track.capsSm,
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.shots.map((s, i) => (
              <tr
                key={s.id}
                onClick={() => setSelectedShot(s)}
                style={{
                  borderBottom: i === result.shots.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  cursor: "pointer",
                  background: selectedShot?.id === s.id ? TL.dim : "transparent",
                }}
              >
                <td style={{ padding: "8px 12px", color: TL.text, textAlign: "left" }}>{s.shotNumber}</td>
                <td style={{ padding: "8px 12px", color: TL.text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {komma(s.carryDistance, 1)}
                </td>
                <td style={{ padding: "8px 12px", color: TL.mute, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {s.side == null ? "—" : `${s.side > 0 ? "+" : ""}${komma(s.side, 1)}`}
                </td>
                <td style={{ padding: "8px 12px", color: TL.mute, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {komma(s.smashFactor, 2)}
                </td>
                <td style={{ padding: "8px 12px", color: TL.mute, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {s.launchAngle == null ? "—" : `${komma(s.launchAngle, 1)}°`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ShotSheet
        shot={selectedShot}
        shotIndex={Math.max(selectedIndex, 0)}
        totalShots={result.shots.length}
        allShots={result.shots}
        variant={variant}
        onClose={() => setSelectedShot(null)}
        onPrev={() => selectedIndex > 0 && setSelectedShot(result.shots[selectedIndex - 1])}
        onNext={() => selectedIndex >= 0 && selectedIndex < result.shots.length - 1 && setSelectedShot(result.shots[selectedIndex + 1])}
      />
    </div>
  );
}
