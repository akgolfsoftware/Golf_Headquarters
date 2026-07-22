"use client";

/**
 * AgencyOS Talent-radar — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Pentagon-radar over talenter i programmet. T.* only.
 */

import { useState } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  DeltaChip,
  InnsiktChip,
  TomTilstand,
  StatusPill,
  CTAPill,
  AvatarInit,
  StatStrip,
  RadarProfil,
} from "@/components/v2";

// ── Datakontrakt (mappes fra de ekte loaderne i ruten) ─────────
export interface TalentRadarAkse {
  /** Feltnøkkel i TalentTracking (fysisk/teknikk/…). */
  key: string;
  /** Norsk aksenavn (Fysisk/Teknikk/Taktikk/Mental/Motivasjon). */
  label: string;
}
export interface TalentRadarSpiller {
  userId: string;
  navn: string;
  niva: string;
  region: string | null;
  klubb: string | null;
  hcp: number | null;
  /** Spillerens verdier justert 1:1 mot `akser` (null = uvurdert). */
  verdier: (number | null)[];
  /** Sum av vurderte akser. */
  sum: number;
  antallVurdert: number;
  snitt: number | null;
  /** Nivåsnitt per akse (peers på samme nivå), justert mot `akser`. */
  peerSnitt: (number | null)[];
  peerAntall: number;
  peerTotalSnitt: number | null;
}
export interface TalentRadarData {
  /** Innlogget coach/admin (shell-tittel). */
  coachNavn: string;
  /** De fem faste aksene (norsk). */
  akser: TalentRadarAkse[];
  /** Alle talenter i programmet, sortert (sum desc, uvurderte sist). */
  spillere: TalentRadarSpiller[];
}

/** Komma-desimal, «—» for manglende. */
function kd(v: number | null | undefined, d = 1): string {
  return v == null || Number.isNaN(Number(v)) ? "—" : Number(v).toFixed(d).replace(".", ",");
}

/** Navn → kursiv lime-aksent på etternavn (v2-tittelidiom). */
function delNavn(navn: string): { fornavn: string; em?: string } {
  const deler = navn.trim().split(/\s+/);
  if (deler.length <= 1) return { fornavn: navn };
  const em = deler.pop();
  return { fornavn: deler.join(" ") + " ", em };
}

export function AdminTalentRadarV2({ data }: { data: TalentRadarData }) {
  const { akser } = data;
  const [valgtId, setValgtId] = useState<string>(data.spillere[0]?.userId ?? "");
  const valgt = data.spillere.find((s) => s.userId === valgtId) ?? data.spillere[0];

  // ── Tom plattform: ingen talenter i programmet ─────────────────
  if (!valgt) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <Caps>AgencyOS · Talent-radar</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="programmet.">Ingen emner i </Tittel>
            </div>
          </div>
          <StatusPill tone="warn">Ingen talenter</StatusPill>
        </div>
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen talenter i programmet ennå"
            sub="Legg til spillere via Discovery for å vurdere dem på de fem aksene."
          />
        </Kort>
        <Link href="/admin/talent/discovery" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="user-plus" full>
            Finn talenter
          </CTAPill>
        </Link>
      </div>
    );
  }

  const { fornavn, em } = delNavn(valgt.navn);

  // Radar-akser for valgt spiller (RadarProfil-format).
  const radarAkser = akser.map((a, i) => ({ label: a.label, verdi: valgt.verdier[i] }));
  const harPeer = valgt.peerSnitt.some((v) => v != null);

  // Datadrevet innsikt: største negative gap mot nivåsnittet (klarspråk).
  const gaps: { label: string; egen: number; peer: number; gap: number }[] = [];
  for (let i = 0; i < akser.length; i++) {
    const egen = valgt.verdier[i];
    const peer = valgt.peerSnitt[i];
    if (egen == null || peer == null) continue;
    gaps.push({ label: akser[i].label, egen, peer, gap: egen - peer });
  }
  const svakest = gaps.length ? gaps.reduce((a, b) => (b.gap < a.gap ? b : a)) : null;

  // KPI-remse (samme fire som detaljskjermen).
  const kpiItems = [
    { l: "Sum radar", v: valgt.sum > 0 ? `${valgt.sum}/50` : null },
    { l: "Snitt spiller", v: valgt.snitt != null ? kd(valgt.snitt) : null },
    { l: `Snitt ${valgt.niva}`, v: valgt.peerTotalSnitt != null ? kd(valgt.peerTotalSnitt) : null },
    { l: "HCP", v: valgt.hcp != null ? kd(valgt.hcp) : null },
  ];

  // ── Hode — B: status ───────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Talent-radar</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em={em}>{em ? fornavn : valgt.navn}</Tittel>
        </div>
        <div className="hidden md:block" style={{ marginTop: 6 }}>
          <Caps size={9}>{valgt.niva}{valgt.region ? ` · ${valgt.region}` : ""}</Caps>
          {valgt.klubb && (
            <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 3 }}>{valgt.klubb}</div>
          )}
        </div>
      </div>
      <StatusPill tone={valgt.antallVurdert > 0 ? "lime" : "warn"}>
        {valgt.antallVurdert > 0 ? `${valgt.antallVurdert}/5 vurdert` : "Uvurdert"}
      </StatusPill>
    </div>
  );

  const primaerCta = (
    <Link href="/admin/talent/discovery" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="user-plus" full>
        Finn flere talenter
      </CTAPill>
    </Link>
  );

  // ── Spiller-velger (horisontal scroll — mobil + desktop) ────────
  const velger = (
    <Kort eyebrow={`Velg spiller · ${data.spillere.length} i programmet`}>
      <div
        style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, margin: "0 -4px", scrollbarWidth: "thin" }}
      >
        {data.spillere.map((s) => {
          const on = s.userId === valgt.userId;
          return (
            <button
              key={s.userId}
              type="button"
              onClick={() => setValgtId(s.userId)}
              aria-pressed={on}
              className="v2-press v2-focus"
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 12px 8px 8px",
                borderRadius: T.rRow,
                border: `1px solid ${on ? T.lime : T.border}`,
                background: on ? "color-mix(in srgb, var(--v2-lime) 8%, transparent)" : T.panel2,
                cursor: "pointer",
                textAlign: "left",
                minWidth: 0,
              }}
            >
              <AvatarInit navn={s.navn} size={30} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: on ? T.fg : T.fg2, whiteSpace: "nowrap" }}>
                  {s.navn}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, whiteSpace: "nowrap" }}>
                  {s.sum > 0 ? `${s.sum}/50` : "Uvurdert"} · {s.niva}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Kort>
  );

  // ── Radar-kort ──────────────────────────────────────────────────
  const radarKort = (
    <Kort eyebrow="Pentagonal radar" action={<Caps size={9}>5 akser · 1–10</Caps>}>
      {valgt.antallVurdert === 0 ? (
        <TomTilstand
          icon="target"
          title="Ingen vurdering registrert"
          sub="Sett verdier på de fem aksene via Talent-modulen for å tegne profilen."
        />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
            <RadarProfil akser={radarAkser} sammenlign={harPeer ? valgt.peerSnitt : null} max={10} size={300} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: `color-mix(in srgb, ${T.lime} 40%, transparent)`, border: `1px solid ${T.lime}` }} />
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>{valgt.navn}</span>
            </span>
            {harPeer && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 12, height: 0, borderTop: `1.5px dashed ${T.fg2}` }} />
                <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>{valgt.niva}-snitt ({valgt.peerAntall})</span>
              </span>
            )}
          </div>
        </>
      )}
    </Kort>
  );

  // ── Akse-for-akse-sammenligning ─────────────────────────────────
  const akseKort = (
    <Kort eyebrow="Akse for akse" action={<Caps size={9}>Spiller · Nivåsnitt</Caps>}>
      {akser.map((a, i) => {
        const egen = valgt.verdier[i];
        const peer = valgt.peerSnitt[i];
        const gap = egen != null && peer != null ? egen - peer : null;
        const visDelta = gap != null && Math.abs(gap) >= 0.05;
        return (
          <Rad
            key={a.key}
            title={a.label}
            sub={`Nivåsnitt ${kd(peer)}`}
            meta={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: egen != null ? T.fg : T.mut, fontVariantNumeric: "tabular-nums" }}>
                  {egen != null ? egen : "—"}
                </span>
                {visDelta && (
                  <DeltaChip v={kd(Math.abs(gap as number))} dir={(gap as number) < 0 ? "down" : "up"} />
                )}
              </span>
            }
            trailing={null}
            last={i === akser.length - 1}
          />
        );
      })}
    </Kort>
  );

  const innsikt =
    svakest != null ? (
      svakest.gap < 0 ? (
        <InnsiktChip>
          {svakest.label} ligger under nivåsnittet ({svakest.egen} mot {kd(svakest.peer)}) — prioriter i utviklingsplanen.
        </InnsiktChip>
      ) : (
        <InnsiktChip>
          {valgt.navn} ligger på eller over nivåsnittet på alle vurderte akser — hold trykket oppe.
        </InnsiktChip>
      )
    ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}
      {velger}
      <StatStrip items={kpiItems} />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {radarKort}
        {akseKort}
      </div>
      {innsikt}
    </div>
  );
}
