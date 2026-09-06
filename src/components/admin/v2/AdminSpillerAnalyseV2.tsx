"use client";

/**
 * AgencyOS Spiller-analyse — v2 (retning C «Presis»). Coach-speilet av PlayerHQ
 * «Analysere»: coach ser én spillers SG / Statistikk / Trening / TrackMan /
 * Tester i full coach-dybde. Gjenbruker AnalysereV2's fem-fane-kropp 1:1 (samme
 * datakontrakt, samme loadere) og bytter kun ut hodet til coach-vinkelen —
 * tilbake-lenke til spillerprofilen + spillerens navn som skjermtittel.
 *
 * Bygget utelukkende av v2-komponentbiblioteket (@/components/v2) og den
 * eksisterende AnalysereV2 — ingen ad-hoc UI, ingen rå hex (kun T.*).
 * V2Shell (montert i ruten) eier chrome-en.
 */

import { useState } from "react";
import Link from "next/link";
import { AnalysereV2, type AnalysereData } from "@/components/portal/v2/AnalysereV2";
import { Caps, Kort, Tittel, StatusPill, TilbakeLenke, CTAPill, HjelpTips, type StatusTone } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";
import { MIN_MERKBAR_ENDRING, type SgMotSegSelv } from "@/lib/domain/sg-mot-seg-selv";
import { fmtToPar } from "@/lib/domain/min-kurve";
import type { VekstrateData } from "@/lib/admin/vekstrate-data";
import type { Turneringshistorikk } from "@/lib/domain/turneringshistorikk";

/** Norsk eieform: «Rohjan» → «Rohjans», «Alex» → «Alex'». Holder navnet helt. */
function eieform(navn: string): string {
  return /[sxz]$/i.test(navn.trim()) ? `${navn}'` : `${navn}s`;
}

/** SG-form fra trendkurven (samme dom som spillerens SG-fane) — coach-signal i hodet. */
function sgForm(data: AnalysereData): { l: string; tone: StatusTone } | null {
  const tp = data.minGolf.sgStatus.trendPunkter;
  if (tp.length < 2) return null;
  const d = tp[tp.length - 1].sg - tp[0].sg;
  if (d > 0.05) return { l: "Stigende", tone: "up" };
  if (d < -0.05) return { l: "Synkende", tone: "down" };
  return { l: "Stabil", tone: "info" };
}

/** Fortegnet tall, alltid med fortegn og komma: 0,6 → «+0,6». */
function fmtEndring(v: number): string {
  const s = v.toFixed(2).replace(".", ",");
  return v > 0 ? `+${s}` : s;
}

function fmtNivaa(v: number | null): string {
  return v == null ? "—" : v.toFixed(2).replace(".", ",");
}

/**
 * «Mot seg selv» — coachens hovedspørsmål på én skjerm.
 *
 * Viser endring per SG-område mellom spillerens siste runder og de før dem.
 * Positiv endring er forbedring. Området med størst tilbakegang løftes fram,
 * fordi det er der samtalen bør starte.
 *
 * TruthLayer: hvert område viser hvor mange runder tallet bygger på, og et
 * område uten registrerte verdier viser «—», aldri null. Tomt datagrunnlag
 * gir en setning som sier hva som mangler, ikke en tom boks.
 */
function MotSegSelv({ d }: { d: SgMotSegSelv }) {
  if (!d.harSvar) {
    return (
      <Kort eyebrow="Mot seg selv">
        <p style={{ margin: 0, color: TL.mute, fontSize: 14, lineHeight: 1.55 }}>{d.grunnlag}</p>
      </Kort>
    );
  }

  const verst = d.storsteTilbakegang;

  return (
    <Kort
      eyebrow="Mot seg selv"
      action={
        verst ? (
          <StatusPill tone="down">{`${verst.navn} ${fmtEndring(verst.endring!)}`}</StatusPill>
        ) : (
          // Ikke tone «up»: den er grønn, og grønt er reservert for Godta og
          // PUBLISERT (invariant 2). Nøytral er dessuten riktigere her —
          // fravær av tilbakegang er ikke en godkjenning.
          <StatusPill tone="lime">Ingen tilbakegang</StatusPill>
        )
      }
    >
      {verst && (
        <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.5, color: TL.text }}>
          Størst tilbakegang er <strong>{verst.navn.toLowerCase()}</strong>, som har falt{" "}
          {Math.abs(verst.endring!).toFixed(2).replace(".", ",")} slag mot spillerens egne
          tidligere runder.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: TL.hair }}>
        {d.akser.map((a) => {
          // Kun tilbakegang får farge. Forbedring står nøytralt: grønt er
          // reservert for Godta/PUBLISERT (invariant 2), og skjermens jobb er
          // å peke på det som har falt — ikke å dele ut ros.
          //
          // Samme støygrense som domenet bruker, ellers ville en endring kunne
          // stå rødt i tabellen uten å nevnes i overskriften, eller omvendt.
          const farge =
            a.endring == null
              ? TL.mute
              : a.endring <= -MIN_MERKBAR_ENDRING
                ? TL.danger
                : TL.text;
          return (
            <div
              key={a.akse}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 12,
                alignItems: "baseline",
                background: TL.elev,
                padding: "10px 0",
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 14, color: TL.text, minWidth: 0 }}>
                {a.navn}
                {a.endring != null && (
                  <span style={{ fontSize: 11, color: TL.mute, marginLeft: 8, fontFamily: TL.font.mono }}>
                    {a.nyligAntall} mot {a.tidligereAntall} runder
                  </span>
                )}
              </span>
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 13,
                  color: TL.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
                title="Snitt i det eldre vinduet"
              >
                {fmtNivaa(a.tidligere)}
              </span>
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 13,
                  color: TL.text,
                  fontVariantNumeric: "tabular-nums",
                }}
                title="Snitt i de siste rundene"
              >
                {fmtNivaa(a.nylig)}
              </span>
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  color: farge,
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 52,
                  textAlign: "right",
                }}
              >
                {a.endring == null ? "—" : fmtEndring(a.endring)}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ margin: "12px 0 0", fontSize: 12, color: TL.mute, fontFamily: TL.font.mono }}>
        {d.grunnlag} Målt mot spilleren selv, ikke mot tour eller årskull.
      </p>
    </Kort>
  );
}

/* ── Innsikt — de fire spørsmålene (Anders 2026-08-30) ───────────────────── */

type InnsiktFaneId = "vekstrate" | "tak" | "konkurranse" | "program";

const INNSIKT_FANER: { id: InnsiktFaneId; navn: string; nr: number; sporsmal: string }[] = [
  { id: "vekstrate", navn: "Vekstrate", nr: 1, sporsmal: "Utvikler hen seg raskt nok?" },
  { id: "tak", navn: "Tak", nr: 2, sporsmal: "Hvor kan hen nå?" },
  { id: "konkurranse", navn: "Konkurranse", nr: 3, sporsmal: "Tåler hen konkurranse?" },
  { id: "program", navn: "Program", nr: 4, sporsmal: "Riktig turneringsprogram?" },
];

/** Fasitens tekst for de tre fanene som ennå ikke har datamodell (A-19b/c/d). */
const INNSIKT_KOMMER: Record<Exclude<InnsiktFaneId, "vekstrate">, string> = {
  tak: "Kommer når aldersbaner (historiske løp for navngitte spillere, MASTERPLAN STEG 16.11) er bygget.",
  konkurranse: "Kommer når SG-stigen (MASTERPLAN STEG 16.10) er bygget.",
  program: "Ikke bygget ennå.",
};

const VEKSTRATE_GEO = { w: 900, h: 220, venstre: 40, hoyre: 860, topp: 20, bunn: 190 };

/** Bygg en path-streng som brytes der serien har hull (`null`), aldri en rett strek over dem. */
function seriePath(verdier: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  const biter: string[] = [];
  let forrige = false;
  verdier.forEach((v, i) => {
    if (v == null) {
      forrige = false;
      return;
    }
    biter.push(`${forrige ? "L" : "M"}${x(i)} ${y(v)}`);
    forrige = true;
  });
  return biter.join(" ");
}

function VekstrateGraf({ punkter }: { punkter: VekstrateData["punkter"] }) {
  const n = punkter.length;
  const verdier = punkter.flatMap((p) => [p.spiller, p.kohort]).filter((v): v is number => v != null);
  const min = Math.floor(Math.min(...verdier)) - 1;
  const maks = Math.ceil(Math.max(...verdier)) + 1;
  const spenn = Math.max(1, maks - min);
  const g = VEKSTRATE_GEO;
  const x = (i: number) => (n <= 1 ? (g.venstre + g.hoyre) / 2 : g.venstre + (i * (g.hoyre - g.venstre)) / (n - 1));
  const y = (v: number) => g.topp + ((maks - v) / spenn) * (g.bunn - g.topp);

  const spillerPath = seriePath(
    punkter.map((p) => p.spiller),
    x,
    y,
  );
  const kohortPath = seriePath(
    punkter.map((p) => p.kohort),
    x,
    y,
  );

  return (
    <svg width="100%" height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} preserveAspectRatio="none" style={{ display: "block", color: TL.text }} aria-hidden="true">
      <path d={`M${g.venstre} ${g.topp} H${g.hoyre}`} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
      <path d={`M${g.venstre} ${g.bunn} H${g.hoyre}`} stroke="currentColor" strokeOpacity={0.14} strokeWidth={1.5} />
      {kohortPath && <path d={kohortPath} stroke={TL.mute} strokeWidth={2.2} strokeDasharray="6 6" fill="none" strokeLinecap="round" />}
      {punkter.map(
        (p, i) => p.kohort != null && <circle key={`k${p.aar}`} cx={x(i)} cy={y(p.kohort)} r={5} fill={TL.mute} />,
      )}
      {spillerPath && <path d={spillerPath} stroke={TL.viz.dot} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {punkter.map(
        (p, i) =>
          p.spiller != null && (
            <circle key={`s${p.aar}`} cx={x(i)} cy={y(p.spiller)} r={i === n - 1 ? 8 : 6} fill={TL.viz.dot} />
          ),
      )}
    </svg>
  );
}

/**
 * «Utvikler hen seg raskt nok» — Innsikt spørsmål 1 av 4 (A-19a/d).
 *
 * Kullets vekstrate (grå, stiplet) er coachens egen referanse — PRODUKTRETNING
 * pkt. 3 sier den vises ALDRI på spillerflaten. Denne komponenten står kun i
 * AgencyOS. Fane 2–4 mangler datamodell ennå (STEG 16.10/16.11 for tak og
 * konkurranse) og viser en klarspråk «kommer»-tekst i stedet for tomme tall —
 * en fane uten innhold er verre enn ingen fane.
 */
function Innsikt({ navn, v }: { navn: string; v: VekstrateData }) {
  const [fane, setFane] = useState<InnsiktFaneId>("vekstrate");
  const aktiv = INNSIKT_FANER.find((f) => f.id === fane)!;

  return (
    <Kort
      eyebrow={`Innsikt · Spørsmål ${aktiv.nr} av 4`}
      action={
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {INNSIKT_FANER.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFane(f.id)}
              className="v2-press v2-focus"
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: TL.radius.pill,
                background: f.id === fane ? TL.dock : "transparent",
                color: f.id === fane ? TL.text : TL.mute,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f.navn}
            </button>
          ))}
        </div>
      }
    >
      <p style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{aktiv.sporsmal}</p>

      {fane !== "vekstrate" ? (
        <p style={{ margin: 0, color: TL.mute, fontSize: 14, lineHeight: 1.55 }}>{INNSIKT_KOMMER[fane]}</p>
      ) : !v.harSvar ? (
        <p style={{ margin: 0, color: TL.mute, fontSize: 14, lineHeight: 1.55 }}>{v.grunnlag}</p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
                Egen vekstrate
              </span>
              <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                  {fmtToPar(v.egenRate!)}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: TL.mute }}>slag per sesong</span>
              </div>
            </div>
            {v.harKohort && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
                  Kullets vekstrate
                </span>
                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {fmtToPar(v.kohortRate!)} slag per sesong
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <VekstrateGraf punkter={v.punkter} />
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
              {v.punkter.map((p) => (
                <span
                  key={p.aar}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: p.aar === v.tilAar ? TL.text : TL.mute,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {p.aar}
                  {p.spiller != null ? ` · ${fmtToPar(p.spiller)}` : ""}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TL.hair}`, display: "flex", flexWrap: "wrap", gap: 18 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TL.mute }}>
              <span style={{ width: 16, height: 3, borderRadius: 2, background: TL.viz.dot, flexShrink: 0 }} />
              {navn}
            </span>
            {v.harKohort && (
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TL.mute }}>
                <span style={{ width: 16, height: 3, borderRadius: 2, background: TL.mute, flexShrink: 0 }} />
                Kullets snitt
              </span>
            )}
          </div>

          <p style={{ margin: "12px 0 0", fontSize: 12, color: TL.mute, fontFamily: TL.font.mono }}>
            {v.grunnlag} Kilde: Norsk turneringsdata.
          </p>
        </>
      )}
    </Kort>
  );
}

export interface AdminSpillerAnalyseV2Props {
  /** Fullt spillernavn (kanon: alltid fullt navn). */
  navn: string;
  /** Spillerens bruker-id — for tilbake-lenke til profilen. */
  spillerId: string;
  data: AnalysereData;
  /** «Hvor taper hen slag, mot seg selv» — beslutning 2026-08-30. */
  motSegSelv: SgMotSegSelv;
  /** «Utvikler hen seg raskt nok» — Innsikt spørsmål 1 av 4 (A-19a). */
  vekstrate: VekstrateData;
  /** Spillerens egne turneringsresultater — samme visning som spilleren ser. */
  turneringer?: Turneringshistorikk;
}

export function AdminSpillerAnalyseV2({ navn, spillerId, data, motSegSelv, vekstrate, turneringer }: AdminSpillerAnalyseV2Props) {
  const kat = data.minGolf.kategori;
  const aar = new Date().getFullYear();
  const eyebrow = kat
    ? `Coach-dybde · Kategori ${kat.kategori} · Sesong ${aar}`
    : `Coach-dybde · Sesong ${aar}`;
  const form = sgForm(data);

  return (
    <AnalysereV2
      data={data}
      turneringer={turneringer}
      /* Spillerens historikk, ikke coachens — tilgangen håndheves server-side
         av assertCanViewPlayerData i hentTreningsHistorikkFiltrert. */
      userId={spillerId}
      header={(mobile) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TilbakeLenke href={`/admin/spillere/${spillerId}`}>Tilbake til {navn}</TilbakeLenke>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Caps>{eyebrow}</Caps>
                {kat && <HjelpTips k="spillerKategori" size={11} />}
              </span>
              <div style={{ marginTop: 10 }}>
                <Tittel mobile={mobile} em="analyse">
                  {eieform(navn)}
                </Tittel>
              </div>
            </div>
            {/* B: status — form eller «ingen trend» */}
            <StatusPill tone={form?.tone ?? "info"}>{form?.l ?? "Ingen trend ennå"}</StatusPill>
          </div>
          {/* Coachens hovedspørsmål, over fanene: hvor taper hen slag. */}
          <MotSegSelv d={motSegSelv} />
          {/* Innsikt — de fire spørsmålene, fane 1 (Vekstrate) med ekte data. */}
          <Innsikt navn={navn} v={vekstrate} />
          {/* B: én primær CTA — Workbench / plan */}
          <Link href={`/admin/spillere/${spillerId}/plan`} style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="layout-dashboard" full={mobile}>
              Åpne plan / Workbench
            </CTAPill>
          </Link>
        </div>
      )}
    />
  );
}
