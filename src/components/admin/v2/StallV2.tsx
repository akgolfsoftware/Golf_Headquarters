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

import Link from "next/link";
import { useEffect, useState } from "react";
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
  BunnArk,
  Icon,
  T,
  type SevKey,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";

/** true på klient etter mount når viewport < 768px (M3-mobilvariant). */
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
  /** Aldri logget inn — bulk-importert plassholderprofil uten aktivitet ennå. */
  venter: boolean;
  /** Abonnements-pakke («Drop-in» uten abonnement) — fra cockpit-lista (B2). */
  pakke: string;
  pakkeAktiv: boolean;
  /** Minst én feilet betaling. */
  skylder: boolean;
}
export interface StallV2Data {
  total: number;
  /** Tilgjengelige gruppe-filtre (kun de med spillere). */
  grupper: string[];
  spillere: StallV2Player[];
}

const STATUS_FILTRE = ["Trenger deg", "I rute"] as const;
const BETALING_FILTRE = ["Abonnent", "Skylder"] as const;

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
            <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>{s.hcp}</span> · {s.gruppe} ·{" "}
            <span style={{ color: s.pakkeAktiv ? T.fg2 : T.mut }}>{s.pakke}</span>
            {s.skylder && <span style={{ color: T.down, fontWeight: 600 }}> · skylder</span>}
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
        <Link href={`/admin/spillere/${s.id}/workbench`} style={{ display: "inline-flex", textDecoration: "none" }}>
          <CTAPill icon="arrow-right">Åpne Workbench</CTAPill>
        </Link>
        <Link href={`/admin/spillere/${s.id}`} style={{ display: "inline-flex", textDecoration: "none" }}>
          <CTAPill ghost>Se profil</CTAPill>
        </Link>
      </div>
    </Kort>
  );
}

export function StallV2({ data }: { data: StallV2Data }) {
  const mobile = useMobile();
  const [grp, setGrp] = useState<string[]>([]);
  const [sta, setSta] = useState<string[]>([]);
  const [bet, setBet] = useState<string[]>([]);
  // Audit-funn 6: når ALLE spillere venter på innlogging må seksjonen starte
  // åpen — ellers er coachens hovedliste en tom, svart kolonne.
  const alleVenter = data.spillere.length > 0 && data.spillere.every((p) => p.venter);
  const [venterApen, setVenterApen] = useState(alleVenter);
  // Standard: velg første AKTIVE profil, ikke en tom «venter»-plassholder.
  const [valgtId, setValgtId] = useState<string | null>(
    data.spillere.find((p) => !p.venter)?.id ?? data.spillere[0]?.id ?? null,
  );
  // Mobil: valgt spiller vises i et BunnArk i stedet for et side-panel.
  const [arkApen, setArkApen] = useState(false);
  const velg = (id: string) => {
    setValgtId(id);
    setArkApen(true);
  };

  const toggle = (arr: string[], set: (v: string[]) => void) => (x: string) =>
    set(arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x));

  const filtered = data.spillere.filter((p) => {
    const gOk = grp.length === 0 || grp.indexOf(p.gruppe) !== -1;
    const sOk = sta.length === 0 || sta.indexOf(p.trenger ? "Trenger deg" : "I rute") !== -1;
    const bOk =
      bet.length === 0 ||
      (bet.indexOf("Abonnent") !== -1 && p.pakkeAktiv) ||
      (bet.indexOf("Skylder") !== -1 && p.skylder);
    return gOk && sOk && bOk;
  });
  // Aktive/komplette profiler først — aldri-aktiverte bulk-import-rader
  // grupperes bak en egen, kollapsbar «Venter på innlogging»-seksjon.
  const aktiveRader = filtered.filter((p) => !p.venter);
  const venterRader = filtered.filter((p) => p.venter);
  const valgt =
    aktiveRader.find((p) => p.id === valgtId) ??
    aktiveRader[0] ??
    filtered.find((p) => p.id === valgtId) ??
    filtered[0] ??
    null;

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
      {filterRad("Betaling", BETALING_FILTRE, bet, toggle(bet, setBet))}
    </div>
  );

  const aktivListe =
    filtered.length === 0 ? (
      <Kort>
        <TomTilstand icon="users" title="Ingen spillere her" sub="Ingen spillere passer filteret akkurat nå." />
      </Kort>
    ) : aktiveRader.length === 0 ? null : (
      <Kort pad="4px 20px">
        {aktiveRader.map((x, i) => (
          <SpillerRadEnkel
            key={x.id}
            s={x}
            valgt={valgt?.id === x.id}
            onClick={() => velg(x.id)}
            last={i === aktiveRader.length - 1}
          />
        ))}
      </Kort>
    );

  const venterSeksjon =
    venterRader.length === 0 ? null : (
      <Kort pad="4px 20px">
        <Rad
          onClick={() => setVenterApen((v) => !v)}
          title={`Venter på innlogging (${venterRader.length})`}
          sub="Bulk-importert, ingen aktivitet ennå"
          trailing={<Icon name={venterApen ? "chevron-up" : "chevron-down"} size={14} style={{ color: T.mut }} />}
          last={!venterApen}
        />
        {venterApen &&
          venterRader.map((x, i) => (
            <SpillerRadEnkel
              key={x.id}
              s={x}
              valgt={valgt?.id === x.id}
              onClick={() => velg(x.id)}
              last={i === venterRader.length - 1}
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
        <Link href="/admin/spillere/ny" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="user-plus">Ny spiller</CTAPill>
        </Link>
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

  if (mobile) {
    // Mobil (M3): kun den søkbare lista i full bredde; valgt spiller åpnes i BunnArk.
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {filtre}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {aktivListe}
          {venterSeksjon}
        </div>
        <BunnArk open={arkApen && !!valgt} onClose={() => setArkApen(false)} tittel={valgt?.navn}>
          {valgt && <SpillerSammendrag s={valgt} />}
        </BunnArk>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {filtre}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {aktivListe}
          {venterSeksjon}
        </div>
        {valgt && <SpillerSammendrag s={valgt} />}
      </div>
    </div>
  );
}
