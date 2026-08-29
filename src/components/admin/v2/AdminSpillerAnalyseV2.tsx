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

import Link from "next/link";
import { AnalysereV2, type AnalysereData } from "@/components/portal/v2/AnalysereV2";
import { Caps, Kort, Tittel, StatusPill, TilbakeLenke, CTAPill, HjelpTips, type StatusTone } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";
import { MIN_MERKBAR_ENDRING, type SgMotSegSelv } from "@/lib/domain/sg-mot-seg-selv";

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

export interface AdminSpillerAnalyseV2Props {
  /** Fullt spillernavn (kanon: alltid fullt navn). */
  navn: string;
  /** Spillerens bruker-id — for tilbake-lenke til profilen. */
  spillerId: string;
  data: AnalysereData;
  /** «Hvor taper hen slag, mot seg selv» — beslutning 2026-08-30. */
  motSegSelv: SgMotSegSelv;
}

export function AdminSpillerAnalyseV2({ navn, spillerId, data, motSegSelv }: AdminSpillerAnalyseV2Props) {
  const kat = data.minGolf.kategori;
  const aar = new Date().getFullYear();
  const eyebrow = kat
    ? `Coach-dybde · Kategori ${kat.kategori} · Sesong ${aar}`
    : `Coach-dybde · Sesong ${aar}`;
  const form = sgForm(data);

  return (
    <AnalysereV2
      data={data}
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
