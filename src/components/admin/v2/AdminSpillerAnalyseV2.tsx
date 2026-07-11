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

import { AnalysereV2, type AnalysereData } from "@/components/portal/v2/AnalysereV2";
import { Caps, Tittel, StatusPill, TilbakeLenke, type StatusTone } from "@/components/v2";

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

export interface AdminSpillerAnalyseV2Props {
  /** Fullt spillernavn (kanon: alltid fullt navn). */
  navn: string;
  /** Spillerens bruker-id — for tilbake-lenke til profilen. */
  spillerId: string;
  data: AnalysereData;
}

export function AdminSpillerAnalyseV2({ navn, spillerId, data }: AdminSpillerAnalyseV2Props) {
  const kat = data.minGolf.kategori;
  const aar = new Date().getFullYear();
  const eyebrow = kat
    ? `Coach-dybde · Kategori ${kat.kategori} · Sesong ${aar}`
    : `Coach-dybde · Sesong ${aar}`;
  const form = sgForm(data);

  return (
    <AnalysereV2
      data={data}
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
              <Caps>{eyebrow}</Caps>
              <div style={{ marginTop: 10 }}>
                <Tittel mobile={mobile} em="analyse">
                  {eieform(navn)}
                </Tittel>
              </div>
            </div>
            {form && <StatusPill tone={form.tone}>{form.l}</StatusPill>}
          </div>
        </div>
      )}
    />
  );
}
