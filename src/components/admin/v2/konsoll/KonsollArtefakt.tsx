"use client";

/**
 * Konsollens artefaktinnhold — høyre kolonne (PP-2.1).
 *
 * Fasit: `<aside class="artifact">` i agencyos-konsoll-desktop.html. Fasitens
 * artefakt er en ukeplan under arbeid: metadata-piller → dagkort → regel-
 * sjekk → sløyfen → bunnhandlinger.
 *
 * Her er artefaktet coachens DAG: de samme radene, men fylt med det vi
 * faktisk har i CockpitData. Fasitens «regel-sjekk» er byttet med
 * stall-nøkkeltall — appen har ingen planregler å sjekke mot, og å vise
 * hakemerker for regler vi ikke regner ut ville vært fabrikkering.
 *
 * Panel-rammen (topplinje, scroll, mobil-bunnark) leveres av ArtefaktPanel —
 * denne filen er kun innholdet.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { type AkseKey } from "@/lib/v2/format";
import { AKSE_NAVN } from "@/components/v2";
import type { CockpitData } from "@/components/admin/cockpit/agency-cockpit";
import { Merkelapp } from "./KonsollDeler";

function Seksjon({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontFamily: TL.font.mono,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {tittel}
      </div>
      {children}
    </div>
  );
}

/** Fasitens .dcard — én rad per økt, med akse-kode i mono. */
function DagKort({
  tid,
  tittel,
  meta,
  kode,
  href,
  naa,
}: {
  tid: string;
  tittel: string;
  meta: string;
  kode: string;
  href?: string | null;
  naa: boolean;
}) {
  const innhold = (
    <div
      style={{
        border: `1px solid ${naa ? `color-mix(in srgb, ${TL.fill} 30%, ${TL.hair})` : TL.hair}`,
        borderRadius: TL.radius.row,
        background: naa ? TL.dim : TL.dock,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.text, flex: "none" }}>{tid}</span>
        <span
          style={{
            fontFamily: TL.font.sans,
            fontSize: 13,
            fontWeight: 600,
            color: TL.text,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tittel}
        </span>
      </div>
      <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, minWidth: 0 }}>{meta}</div>
      <div
        style={{
          fontFamily: TL.font.mono,
          fontSize: 10,
          letterSpacing: "0.03em",
          color: TL.mute,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {kode}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: "none", minWidth: 0 }}>
      {innhold}
    </Link>
  ) : (
    innhold
  );
}

const lenkeStil: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 40,
  padding: "0 12px",
  borderRadius: TL.radius.row,
  border: `1px solid ${TL.hair}`,
  background: TL.elev,
  color: TL.text,
  fontFamily: TL.font.sans,
  fontSize: 12.5,
  fontWeight: 500,
  textDecoration: "none",
};

export function KonsollArtefakt({ data }: { data: CockpitData }) {
  const okter = data.timeline;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
      {/* metarow — fasitens piller øverst i panelet */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Merkelapp>{data.dayLabel}</Merkelapp>
        <Merkelapp>
          {okter.length} {okter.length === 1 ? "økt" : "økter"}
        </Merkelapp>
        <Merkelapp>{data.activePlayersCount} aktive</Merkelapp>
        {data.dagensVerdiKr != null && <Merkelapp>{data.dagensVerdiKr.toLocaleString("nb-NO")} kr</Merkelapp>}
      </div>

      <Seksjon tittel="dagens økter">
        {okter.length === 0 ? (
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
            Ingen økter i dag. Dagen er åpen — bruk den til å planlegge uka.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            {okter.map((s) => {
              const naa = data.now >= s.startMin && data.now < s.startMin + s.durMin;
              const sted = s.meta.find((m) => m.icon === "map-pin")?.text;
              const akse = AKSE_NAVN[s.axisLabel as AkseKey] || s.axisLabel;
              return (
                <DagKort
                  key={s.id}
                  tid={s.time}
                  tittel={s.playerName}
                  meta={[`${s.durMin} min`, akse, sted].filter(Boolean).join(" · ")}
                  kode={s.title}
                  href={s.href}
                  naa={naa}
                />
              );
            })}
          </div>
        )}
      </Seksjon>

      <Seksjon tittel="stallen siste 30 dager">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <NokkelRad label="Strokes Gained · snitt" verdi={data.stallSgKpi} />
          <NokkelRad label="Plan-etterlevelse" verdi={data.planAdherenceKpi} />
          <NokkelRad label="Trenger deg nå" verdi={String(data.focusCount ?? data.focus.length)} />
        </div>
      </Seksjon>

      <Seksjon tittel="sløyfen">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Link href="/admin/recording" style={lenkeStil} data-od-id="link-fangst">
            FØR · fangst
          </Link>
          <Link href="/admin/kalender" style={lenkeStil} data-od-id="link-kalender">
            UNDER · kalender
          </Link>
          <Link href="/admin/spillere" style={lenkeStil} data-od-id="link-spillere">
            ETTER · spillere
          </Link>
        </div>
      </Seksjon>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
        <Link
          href="/admin/planlegge"
          className="v2-press v2-focus"
          data-od-id="artifact-workbench"
          style={{ ...lenkeStil, flex: 1, justifyContent: "center", background: TL.fill, color: TL.onFill, border: "none", fontWeight: 600 }}
        >
          Planlegg i Workbench
        </Link>
        <Link href="/admin/analyse" className="v2-press v2-focus" style={lenkeStil} data-od-id="artifact-innsikt">
          Innsikt
        </Link>
      </div>
    </div>
  );
}

function NokkelRad({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, minWidth: 0 }}>
      <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, minWidth: 0 }}>{label}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, color: TL.text, flex: "none" }}>{verdi}</span>
    </div>
  );
}
