"use client";

/**
 * AgencyOS Talent-hub — v2 (retning C «Presis»). Rekomponerer den ekte skjermen
 * src/app/admin/talent/page.tsx i v2-idiomet, med IDENTISK funksjon + datakontrakt:
 * talent-oversikt fra TalentTracking (Prisma) med spiller-velger og tre paneler —
 *   1) Skill-radar (5 talent-akser: Fysisk/Teknikk/Taktikk/Mental/Motivasjon),
 *      med stall-snitt som stiplet sammenligningsprofil,
 *   2) Percentil (proxy: valgt spillers snitt-talentscore vs. hele stallen),
 *   3) Talent-akser (barer per akse) + H2H mot stall-snitt.
 *
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — RadarProfil,
 * PercentilBar, FordelingRad, Rad, TallHero, PillVelger m.fl. Ingen ad-hoc UI,
 * ingen rå hex (kun T.*). Akse-fargene hentes fra den kanoniske T.ax-paletten.
 *
 * Ærlige tomrom: percentil krever ≥2 spillere (kan ikke rangere én spiller mot seg
 * selv) → tom-tilstand. Uvurderte akser (null) tegnes som 0 i radaren, men vises
 * «—» i tabellene. WAGR/kategori A–K finnes ikke i TalentTracking → ikke fabrikert.
 * Percentilen er en klarspråks-proxy, aldri en sperre.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  PillVelger,
  TallHero,
  DeltaChip,
  FordelingRad,
  InnsiktChip,
  TomTilstand,
  CTAPill,
  PercentilBar,
  RadarProfil,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra TalentTracking i ruten) ────────────
export interface AdminTalentVerdier {
  fysisk: number | null;
  teknikk: number | null;
  taktikk: number | null;
  mental: number | null;
  motivasjon: number | null;
}
export interface AdminTalentSpiller {
  /** userId — brukes i URL-er (radar/discovery). */
  id: string;
  navn: string;
  hcp: number | null;
  niva: string;
  klubb: string | null;
  region: string | null;
  verdier: AdminTalentVerdier;
}
export interface AdminTalentData {
  spillere: AdminTalentSpiller[];
}

// Talent-aksene (eget konstrukt, IKKE pyramiden). Farger fra kanonisk T.ax-palett
// (fem distinkte kategorifarger) — ingen rå hex. Skala 0–10 i data.
type AkseKey = keyof AdminTalentVerdier;
const AKSER: { key: AkseKey; label: string; kort: string; farge: string }[] = [
  { key: "fysisk", label: "Fysisk", kort: "FYS", farge: T.ax.FYS },
  { key: "teknikk", label: "Teknikk", kort: "TEK", farge: T.ax.TEK },
  { key: "taktikk", label: "Taktikk", kort: "TAK", farge: T.ax.SLAG },
  { key: "mental", label: "Mental", kort: "MEN", farge: T.ax.SPILL },
  { key: "motivasjon", label: "Motivasjon", kort: "MOT", farge: T.ax.TURN },
];

// H2H bruker fire av aksene (som den ekte skjermen), sammenlignet mot stall-snitt.
const H2H_AKSER: AkseKey[] = ["fysisk", "teknikk", "mental", "motivasjon"];

/** Komma-desimal, 1 desimal, «—» for null (aldri rå punktum-float). */
function kd(v: number | null | undefined): string {
  return v == null || Number.isNaN(Number(v)) ? "—" : Number(v).toFixed(1).replace(".", ",");
}

/** Snitt-talentscore for en spiller (null-akser teller som 0 — som den ekte skjermen). */
function snittScore(v: AdminTalentVerdier): number {
  return AKSER.reduce((sum, a) => sum + (v[a.key] ?? 0), 0) / AKSER.length;
}

/** Stall-snitt for én akse (kun vurderte verdier > 0, som den ekte skjermen). */
function stallSnitt(spillere: AdminTalentSpiller[], key: AkseKey): number {
  const vals = spillere.map((s) => s.verdier[key] ?? 0).filter((x) => x > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function AdminTalentV2({ data }: { data: AdminTalentData }) {
  const { spillere } = data;
  const [valgtId, setValgtId] = useState<string | null>(spillere[0]?.id ?? null);

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Talent</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="coach.">Talent</Tittel>
        </div>
      </div>
      <Link href="/admin/talent/discovery" style={{ textDecoration: "none" }} className="hidden md:inline-flex">
        <CTAPill ghost icon="search">Discovery</CTAPill>
      </Link>
    </div>
  );

  if (spillere.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere i talent-programmet ennå"
            sub="Bruk Discovery for å legge til spillere i sporet."
          />
          <div style={{ marginTop: 14 }}>
            <Link href="/admin/talent/discovery" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">Åpne Discovery</CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  const valgt = spillere.find((s) => s.id === valgtId) ?? spillere[0];
  const fornavn = valgt.navn.split(" ")[0];

  // Radar: valgt spiller + stall-snitt som stiplet peer-profil (0–10).
  const radarAkser = AKSER.map((a) => ({ label: a.label, verdi: valgt.verdier[a.key] }));
  const radarSnitt = AKSER.map((a) => stallSnitt(spillere, a.key));

  // Percentil (proxy): andel spillere med lavere snitt-talentscore enn valgt.
  const kanRangere = spillere.length >= 2;
  const egenSnitt = snittScore(valgt.verdier);
  const under = spillere.filter((s) => s.id !== valgt.id && snittScore(s.verdier) < egenSnitt).length;
  const pctPlassering = kanRangere ? Math.round((under / (spillere.length - 1)) * 100) : 0;
  const toppPct = 100 - pctPlassering;

  // H2H: valgt spiller vs. stall-snitt per akse.
  const h2h = H2H_AKSER.map((key) => {
    const meta = AKSER.find((a) => a.key === key)!;
    const egen = valgt.verdier[key];
    const snitt = stallSnitt(spillere, key);
    const diff = egen != null ? egen - snitt : null;
    const visDiff = diff != null && Math.abs(diff) >= 0.05;
    return {
      key,
      kort: meta.kort,
      label: meta.label,
      egen: kd(egen),
      snitt: kd(snitt),
      diff: visDiff ? (diff! > 0 ? "+" : "−") + Math.abs(diff!).toFixed(1).replace(".", ",") : null,
      positiv: (egen ?? 0) >= snitt,
    };
  });

  // Datadrevet innsikt: svakeste vurderte akse (klarspråk, aldri sperre).
  const vurderte = AKSER.filter((a) => valgt.verdier[a.key] != null);
  const svakest = vurderte.length
    ? vurderte.reduce((a, b) => ((valgt.verdier[b.key] ?? 0) < (valgt.verdier[a.key] ?? 0) ? b : a))
    : null;

  // ── Panel 1: Skill-radar ────────────────────────────────────────
  const radarKort = (
    <Kort eyebrow={`Skill-radar · ${fornavn}`} action={<Caps size={9}>0–10</Caps>}>
      <RadarProfil akser={radarAkser} sammenlign={radarSnitt} max={10} size={260} />
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 4 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 2, background: T.lime, borderRadius: 2 }} />
          <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>{fornavn}</span>
        </span>
        {spillere.length >= 2 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 2, background: T.fg2, borderRadius: 2 }} />
            <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>Stall-snitt</span>
          </span>
        )}
      </div>
    </Kort>
  );

  // ── Panel 2: Percentil ──────────────────────────────────────────
  const percentilKort = (
    <Kort tint eyebrow="Percentil" action={<Caps size={9}>vs stall</Caps>}>
      {kanRangere ? (
        <>
          <TallHero
            label="Talent-score · plassering"
            value={`Topp ${toppPct} %`}
            sub="Snitt av talent-akser vs. hele stallen"
            size={38}
            accent
          />
          <div style={{ marginTop: 18 }}>
            <PercentilBar
              percentile={pctPlassering}
              benchmark={50}
              label="Plassering i stall"
              valueLabel={`${pctPlassering}.`}
            />
          </div>
        </>
      ) : (
        <TomTilstand
          icon="users"
          title="Trenger flere spillere"
          sub="Percentil krever minst to spillere å rangere mot."
        />
      )}
    </Kort>
  );

  // ── Panel 3: Talent-akser + H2H ─────────────────────────────────
  const akserKort = (
    <Kort eyebrow="Talent-akser" action={<Caps size={9}>0–10</Caps>}>
      <div>
        {AKSER.map((a, i) => {
          const v = valgt.verdier[a.key];
          return (
            <FordelingRad
              key={a.key}
              label={a.label}
              pct={(v ?? 0) * 10}
              value={kd(v)}
              last={i === AKSER.length - 1}
            />
          );
        })}
      </div>

      <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
        <Caps size={9}>H2H · vs stall-snitt</Caps>
        <div style={{ marginTop: 4 }}>
          {h2h.map((h, i) => (
            <Rad
              key={h.key}
              leading={
                <span style={{ width: 38, flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: T.fg2 }}>
                  {h.kort}
                </span>
              }
              title={h.label}
              sub={`Stall-snitt ${h.snitt}`}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: h.positiv ? T.up : T.down, fontVariantNumeric: "tabular-nums" }}>
                    {h.egen}
                  </span>
                  {h.diff && <DeltaChip v={h.diff} dir={h.positiv ? "up" : "down"} />}
                </span>
              }
              trailing={null}
              last={i === h2h.length - 1}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
        <Link href="/admin/talent/radar" style={{ textDecoration: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.lime }}>
          Åpne full radar →
        </Link>
      </div>
    </Kort>
  );

  // ── Spiller-info-rad ────────────────────────────────────────────
  const meta = [valgt.niva, valgt.hcp != null ? `HCP ${kd(valgt.hcp)}` : null, valgt.klubb, valgt.region]
    .filter(Boolean)
    .join(" · ");
  const infoRad = (
    <Kort pad="14px 18px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <AvatarInit navn={valgt.navn} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{valgt.navn}</div>
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>{meta}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/talent/discovery" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="search">Discovery</CTAPill>
          </Link>
          <Link href="/admin/talent/radar" style={{ textDecoration: "none" }}>
            <CTAPill icon="arrow-right">Alle radar</CTAPill>
          </Link>
        </div>
      </div>
    </Kort>
  );

  const innsikt = svakest ? (
    <InnsiktChip>
      {svakest.label} er svakeste vurderte akse nå ({kd(valgt.verdier[svakest.key])}/10) — legg vekt der i utviklingsplanen.
    </InnsiktChip>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Spiller-velger — vannrett scrollbar på mobil ved mange spillere. */}
      <div style={{ overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
        <PillVelger
          options={spillere.map((s) => ({ v: s.id, l: s.navn.split(" ")[0] }))}
          value={valgt.id}
          onChange={setValgtId}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
        {radarKort}
        {percentilKort}
        {akserKort}
      </div>

      {infoRad}
      {innsikt}
    </div>
  );
}
