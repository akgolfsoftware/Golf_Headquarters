"use client";

/**
 * PlayerHQ · Del runde (/portal/statistikk/runder/[runId]/del) — v2.
 * v2-port 17. juli 2026 (Team D3): erstatter del-runde-client (hybrid, 3 rå hex).
 * Samme funksjon: format-velger (Story/Post/PDF/Lenke), synlighet, kopier
 * delbar lenke (/r/[id]) og nedlastings-knapp. Delekortet er en merkevare-
 * grafikk — bruker T.wrapped-gradientene (faste merkefarger uansett tema),
 * aldri rå hex i skjermfila.
 */

import Link from "next/link";
import { useState } from "react";
import {
  Kort,
  Caps,
  Tittel,
  Knapp,
  PillVelger,
  Icon,
  T,
  fmtSg,
} from "@/components/v2";

type Format = "story" | "post" | "pdf" | "link";
type Synlighet = "privat" | "coach" | "offentlig";

export interface DelRundeV2Runde {
  id: string;
  score: number;
  relativ: number;
  kursNavn: string;
  playedAt: string;
  sgPutt: number | null;
  sgOtt: number | null;
  sgArg: number | null;
  sgApp: number | null;
}

export interface DelRundeV2Spiller {
  navn: string;
  initial: string;
  hcp: number | null;
  homeClub: string | null;
}

export interface DelRundeV2Props {
  runde: DelRundeV2Runde;
  spiller: DelRundeV2Spiller;
}

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativStr(r: number): string {
  if (r === 0) return "E";
  return r > 0 ? `+${r}` : `${r}`;
}

const FORMATER: { id: Format; ikon: string; nm: string; dim: string }[] = [
  { id: "story", ikon: "image", nm: "Story", dim: "1080×1920" },
  { id: "post", ikon: "layout-dashboard", nm: "Post", dim: "1080×1080" },
  { id: "pdf", ikon: "file-text", nm: "PDF", dim: "Full SG-data" },
  { id: "link", ikon: "external-link", nm: "Lenke", dim: "Delbar URL" },
];

const ASPEKT: Record<Format, string> = {
  story: "9 / 16",
  post: "1 / 1",
  link: "4 / 3",
  pdf: "8.5 / 11",
};

export function DelRundeV2({ runde, spiller }: DelRundeV2Props) {
  const [format, setFormat] = useState<Format>("story");
  const [synlighet, setSynlighet] = useState<Synlighet>("coach");
  const [kopiert, setKopiert] = useState(false);
  const [lasterNed, setLasterNed] = useState(false);

  // SG per kategori (slag mot referanse) — ordbok-navn, aldri fagkoder alene.
  const sgPills: { label: string; v: number | null }[] = [
    { label: "Tee-slag", v: runde.sgOtt },
    { label: "Innspill", v: runde.sgApp },
    { label: "Nærspill", v: runde.sgArg },
    { label: "Putting", v: runde.sgPutt },
  ];
  const harSgData = sgPills.some((p) => p.v !== null);

  function kopierLenke() {
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://akgolf.no"}/r/${runde.id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2400);
    });
  }

  function lastNed() {
    setLasterNed(true);
    setTimeout(() => setLasterNed(false), 1600);
  }

  // Kortets flate per format: story/post = forest-gradient (mørk merkegrafikk),
  // link = offwhite merkegrafikk, pdf = nøytral dokumentflate (panel).
  const morkKort = format === "story" || format === "post";
  const kortBg = morkKort
    ? T.wrapped.bgForest
    : format === "link"
      ? T.wrapped.bgOffwhite
      : T.panel;
  const kortFg = morkKort ? T.wrapped.textOnDark : format === "link" ? T.wrapped.textOnLight : T.fg;
  const kortMut = morkKort
    ? `color-mix(in srgb, ${T.wrapped.textOnDark} 65%, transparent)`
    : format === "link"
      ? `color-mix(in srgb, ${T.wrapped.textOnLight} 60%, transparent)`
      : T.mut;
  const scoreFarge = morkKort ? T.lime : format === "link" ? T.forest : T.fg;
  const scoreSize = format === "story" ? 84 : format === "post" ? 72 : 56;

  return (
    <>
      {/* Topptekst */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps>PlayerHQ · Statistikk · Del runde</Caps>
          <div style={{ marginTop: 6 }}>
            <Tittel mobile em="runde">Del</Tittel>
          </div>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, margin: "8px 0 0" }}>
            <span style={{ color: T.fg, fontWeight: 700 }}>{runde.kursNavn}</span>
            {" · "}
            {formatDato(runde.playedAt)}
            {" · "}
            <span style={{ color: T.fg, fontWeight: 700 }}>
              {runde.score} slag ({relativStr(runde.relativ)})
            </span>
          </p>
        </div>
        <Link
          href="/portal/statistikk"
          aria-label="Lukk"
          className="v2-press v2-focus"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, color: T.fg2, textDecoration: "none", flex: "none" }}
        >
          <Icon name="x" size={15} />
        </Link>
      </div>

      {/* Forhåndsvisning av delekortet */}
      <Kort pad="16px" style={{ alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 320,
            aspectRatio: ASPEKT[format],
            overflow: "hidden",
            borderRadius: 16,
            background: kortBg,
            border: format === "pdf" ? `1px solid ${T.border}` : "none",
            color: kortFg,
            display: "flex",
            flexDirection: "column",
            padding: 22,
            boxShadow: "0 18px 44px rgba(0,0,0,0.4)",
          }}
        >
          {/* Bakgrunnsdekor (kun story/post) */}
          {morkKort && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `radial-gradient(ellipse 80% 50% at 90% 10%, color-mix(in srgb, ${T.lime} 20%, transparent), transparent 60%)`,
              }}
            />
          )}

          {/* Spillerhode */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                background: morkKort ? T.lime : T.forest,
                color: morkKort ? T.wrapped.textOnLight : T.wrapped.textOnDark,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: T.disp,
                fontSize: 14,
                fontWeight: 700,
                flex: "none",
              }}
            >
              {spiller.initial}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>{spiller.navn}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: kortMut }}>
                {spiller.hcp !== null ? `HCP ${String(spiller.hcp).replace(".", ",")}` : ""}
                {spiller.homeClub ? `${spiller.hcp !== null ? " · " : ""}${spiller.homeClub}` : ""}
              </div>
            </div>
          </div>

          {/* Score-blokk */}
          <div style={{ position: "relative", zIndex: 1, marginTop: "auto" }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: kortMut }}>
              Runde · 18 hull
            </div>
            <div style={{ fontFamily: T.mono, fontSize: scoreSize, fontWeight: 700, lineHeight: 0.95, color: scoreFarge, fontVariantNumeric: "tabular-nums" }}>
              {runde.score}
            </div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: kortMut }}>
              <span
                style={{
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontWeight: 700,
                  color: scoreFarge,
                  background: `color-mix(in srgb, ${scoreFarge} 14%, transparent)`,
                }}
              >
                {relativStr(runde.relativ)}
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {runde.kursNavn} · {formatDato(runde.playedAt)}
              </span>
            </div>

            {/* SG per kategori */}
            {harSgData && (
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {sgPills
                  .filter((p) => p.v !== null)
                  .map((p) => (
                    <span
                      key={p.label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        borderRadius: 9999,
                        border: `1px solid color-mix(in srgb, ${kortFg} 16%, transparent)`,
                        background: `color-mix(in srgb, ${kortFg} 8%, transparent)`,
                        padding: "3px 9px",
                        fontFamily: T.mono,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: kortFg,
                      }}
                    >
                      {p.label}
                      <span style={{ color: (p.v ?? 0) >= 0 ? (morkKort ? T.lime : T.up) : T.down }}>
                        {fmtSg(p.v ?? 0)}
                      </span>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Merke */}
          <span
            style={{
              position: "absolute",
              bottom: 14,
              right: 16,
              zIndex: 1,
              fontFamily: T.disp,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: morkKort ? T.lime : T.forest,
            }}
          >
            AK Golf
          </span>
        </div>
      </Kort>

      {/* Format-velger */}
      <Kort eyebrow="Format">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
          {FORMATER.map((f) => {
            const on = format === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                aria-pressed={on}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 13,
                  border: `1px solid ${on ? T.lime : T.border}`,
                  background: on ? `color-mix(in srgb, ${T.lime} 9%, transparent)` : T.panel2,
                  padding: "12px 8px",
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: on ? T.lime : T.panel3,
                    color: on ? T.onLime : T.fg2,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={f.ikon} size={14} />
                </span>
                <span style={{ fontFamily: T.disp, fontSize: 12, fontWeight: 700, color: T.fg }}>{f.nm}</span>
                <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, letterSpacing: "0.04em", textTransform: "uppercase" }}>{f.dim}</span>
              </button>
            );
          })}
        </div>
      </Kort>

      {/* Synlighet */}
      <Kort eyebrow="Synlighet">
        <PillVelger
          options={[
            { v: "privat", l: "Privat" },
            { v: "coach", l: "Coach kan se" },
            { v: "offentlig", l: "Offentlig" },
          ]}
          value={synlighet}
          onChange={(v) => setSynlighet(v as Synlighet)}
        />
      </Kort>

      {/* Handlinger */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <Knapp ghost icon={kopiert ? "check" : "copy"} onClick={kopierLenke}>
          {kopiert ? "Kopiert" : "Kopier lenke"}
        </Knapp>
        <Knapp icon="download" disabled={lasterNed} onClick={lastNed}>
          {lasterNed ? "Laster ned…" : "Last ned"}
        </Knapp>
      </div>

      {/* Toast */}
      {kopiert && (
        <div
          className="v2-fade-in"
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            background: T.panel,
            border: `1px solid ${T.borderS}`,
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            padding: "10px 20px",
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 500,
            color: T.fg,
          }}
        >
          <Icon name="check" size={14} style={{ color: T.lime }} />
          Lenke kopiert
        </div>
      )}
    </>
  );
}
