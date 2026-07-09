"use client";

/**
 * AgencyOS Stall — v2 (retning C «Presis»). 1:1 med mockup-fasit
 * ui_kits/v2/agencyos.jsx → Stall({mobile}) (+ SpillerRadEnkel,
 * SpillerSammendrag), men drevet av EKTE data fra loadStallen (Prisma).
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) —
 * ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Desktop: hode → filtre → grid 3fr/2fr (spillerliste | spillersammendrag).
 * Mobil: hode → filtre → liste → valgt spillers sammendrag.
 *
 * Ærlige tomrom: felter uten kilde (spiller-kategori A–K) er utelatt, ikke
 * fabrikert. SG-form/-trend, plan-etterlevelse per akse, gruppe, hcp og
 * tilstand er alle utledet fra ekte Prisma-data i loaderen.
 */

import { useState } from "react";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  SevChip,
  DeltaChip,
  TallHero,
  Trend,
  AkseBar,
  FilterChips,
  CTAPill,
  TomTilstand,
  T,
  type SevKey,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra StallenData i ruten) ───────────────
export interface StallV2Adherence {
  akse: AkseKey;
  pct: number;
}
export interface StallV2Player {
  id: string;
  navn: string;
  hcp: string;
  gruppe: string;
  sg: string;
  delta: string | null;
  dir: "up" | "down";
  sev: SevKey;
  statusLabel: string;
  /** status !== ok — for «Trenger deg»-filteret. */
  trenger: boolean;
  /** SG-serie eldst → nyest (ekte målepunkter). */
  sgTrend: number[];
  /** Plan-etterlevelse per akse denne uka (% av planlagte minutter). */
  adherence: StallV2Adherence[];
  /** Aggregert etterlevelse denne uka. null = ingen planlagte økter. */
  adhPct: number | null;
}
export interface StallV2Data {
  total: number;
  /** Tilgjengelige gruppe-filtre (kun de med spillere). */
  grupper: string[];
  spillere: StallV2Player[];
}

const STATUS_FILTRE = ["Trenger deg", "I rute"] as const;

function SpillerRadEnkel({
  s,
  onClick,
  valgt,
  last,
}: {
  s: StallV2Player;
  onClick: () => void;
  valgt: boolean;
  last: boolean;
}) {
  return (
    <Rad
      onClick={onClick}
      leading={<AvatarInit navn={s.navn} size={34} />}
      title={s.navn}
      sub={`Hcp ${s.hcp} · ${s.gruppe} · ${s.statusLabel}`}
      meta={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 15,
              fontWeight: 700,
              color: T.fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {s.sg}
          </span>
          {s.delta && <DeltaChip v={s.delta} dir={s.dir} />}
          <SevChip s={s.sev} />
        </span>
      }
      trailing={valgt ? <span style={{ width: 2, height: 20, borderRadius: 2, background: T.lime, flex: "none" }} /> : undefined}
      last={last}
    />
  );
}

function SpillerSammendrag({ s }: { s: StallV2Player }) {
  const harTrend = s.sgTrend.length >= 2;
  const lo = harTrend ? Math.min(...s.sgTrend) : 0;
  const hi = harTrend ? Math.max(...s.sgTrend) : 0;
  const pad = Math.max(0.5, (hi - lo) * 0.15);

  return (
    <Kort tint eyebrow="Spillersammendrag" action={<SevChip s={s.sev} />}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={s.navn} size={44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>{s.navn}</div>
          <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
            Hcp{" "}
            <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{s.hcp}</span> · {s.gruppe}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <TallHero
          label="Strokes Gained · form"
          value={s.sg}
          delta={s.delta ?? undefined}
          dir={s.dir}
          sub={s.statusLabel}
          size={44}
          accent={s.sg.startsWith("+")}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        {harTrend ? (
          <Trend series={s.sgTrend} yMin={lo - pad} yMax={hi + pad} height={64} />
        ) : (
          <TomTilstand icon="activity" title="For få målepunkter" sub="Trenger minst to SG-registreringer for en trendkurve." />
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <Caps size={9}>Uka · plan-etterlevelse per akse</Caps>
        <div style={{ marginTop: 4 }}>
          {s.adhPct != null ? (
            s.adherence.map((x, i) => (
              <AkseBar
                key={x.akse}
                a={x.akse}
                v={x.pct}
                m={100}
                max={100}
                enhet="%"
                last={i === s.adherence.length - 1}
              />
            ))
          ) : (
            <TomTilstand icon="calendar" title="Ingen planlagte økter" sub="Ingen plan-økter denne uka å måle etterlevelse mot." />
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <CTAPill icon="arrow-right">Åpne Workbench</CTAPill>
        <CTAPill ghost>Se profil</CTAPill>
      </div>
    </Kort>
  );
}

export function StallV2({ data }: { data: StallV2Data }) {
  const [grp, setGrp] = useState<string[]>([]);
  const [sta, setSta] = useState<string[]>([]);
  const [valgtId, setValgtId] = useState<string | null>(data.spillere[0]?.id ?? null);

  const toggle = (arr: string[], set: (v: string[]) => void) => (x: string) =>
    set(arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x));

  const filtered = data.spillere.filter((p) => {
    const gOk = grp.length === 0 || grp.indexOf(p.gruppe) !== -1;
    const sOk = sta.length === 0 || sta.indexOf(p.trenger ? "Trenger deg" : "I rute") !== -1;
    return gOk && sOk;
  });
  const valgt = filtered.find((p) => p.id === valgtId) ?? filtered[0] ?? null;

  const filterRad = (
    label: string,
    items: readonly string[],
    active: string[],
    onToggle: (x: string) => void,
  ) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Caps size={9} style={{ width: 64, flex: "none" }}>{label}</Caps>
      <FilterChips items={[...items]} active={active} onToggle={onToggle} />
    </div>
  );

  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.grupper.length > 0 && filterRad("Gruppe", data.grupper, grp, toggle(grp, setGrp))}
      {filterRad("Status", STATUS_FILTRE, sta, toggle(sta, setSta))}
    </div>
  );

  const liste =
    filtered.length === 0 ? (
      <Kort>
        <TomTilstand icon="users" title="Ingen spillere her" sub="Ingen spillere passer filteret akkurat nå." />
      </Kort>
    ) : (
      <Kort pad="4px 20px">
        {filtered.map((x, i) => (
          <SpillerRadEnkel
            key={x.id}
            s={x}
            valgt={valgt?.id === x.id}
            onClick={() => setValgtId(x.id)}
            last={i === filtered.length - 1}
          />
        ))}
      </Kort>
    );

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{data.total === 1 ? "1 spiller · AgencyOS" : `${data.total} spillere · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="stall.">Din</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex">
        <CTAPill ghost icon="user-plus">Ny spiller</CTAPill>
      </div>
    </div>
  );

  if (data.spillere.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand icon="users" title="Ingen spillere i stallen" sub="Ingen aktive spillere er koblet til deg ennå." />
        </Kort>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {filtre}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {liste}
        {valgt && <SpillerSammendrag s={valgt} />}
      </div>
    </div>
  );
}
