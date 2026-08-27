"use client";

/**
 * AgencyOS TrackMan — Train-lock (T9, 27.08.2026).
 *
 * Fasit: `TM-06 Agency TrackMan.dc.html` (liste/stall på tvers av spillere).
 * Tokens: KUN TL (src/lib/v2/train-lock.ts) — CLAUDE.md invariant 2.
 * Erstatter `AdminTrackmanV2` (Paper T.*) på denne ruten. Datakontrakten
 * (KPI-er, rader, søk/miljø-filter) er UENDRET — kun visningslaget er byttet.
 *
 * Avvik fra fasiten (dokumentert i docs/natt/T9-DONE.md):
 * - `InnsiktHubNav` (Paper T.*-subnav delt med Runder/Tester/Compliance) er
 *   fjernet fra denne siden — kan ikke sameksistere med TL.* på samme skjerm
 *   (invariant 2). Gjeninnføres TL-native når AG-07 Innsikt-huben bygges.
 * - Fasitens N-per-rad mini-spredningskart (72px, TM-10d–f) er IKKE bygget —
 *   ville krevd én ekstra slag-spørring per rad (opptil 50). I stedet vises
 *   ÉTT hero-DispersionMap-kort for siste økt med gyldig side+carry-data,
 *   samme mønster som TM-06 sin iPhone-visning (ett plot-kort + liste).
 * - Kilde-tag viser ekte `source`-verdi fra Prisma (`csv-import`/`api`) —
 *   IKKE fasitens csv|pdf|foto|testdata, som ikke finnes i datamodellen.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { DispersionMap } from "@/components/trackman/DispersionMap";
import type { DispersionMapResult } from "@/lib/trackman/dispersion-map";

function CapsLabel({ children, size = 11 }: { children: React.ReactNode; size?: number }) {
  return (
    <span
      style={{
        fontFamily: TL.font.mono,
        fontSize: size,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Avatar({ navn, size = 34 }: { navn: string; size?: number }) {
  const initialer = navn
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: TL.avatar,
        color: TL.onAvatar,
        fontSize: size >= 44 ? 15 : 12,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: TL.font.sans,
      }}
    >
      {initialer || "?"}
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
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
      <CapsLabel size={10.5}>{label}</CapsLabel>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 20,
          fontWeight: 700,
          color: TL.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export interface AdminTrackmanTLKpi {
  label: string;
  value: string;
}

export interface AdminTrackmanTLRad {
  key: string;
  spillerId: string;
  navn: string;
  hcp: string | null;
  dato: string;
  slag: number;
  kildeLabel: string;
}

export interface AdminTrackmanTLHero {
  playerName: string;
  club: string;
  sessionHref: string;
  result: DispersionMapResult;
}

export interface AdminTrackmanTLData {
  kpis: AdminTrackmanTLKpi[];
  oktDenneUken: number;
  antallSpillere: number;
  hero: AdminTrackmanTLHero | null;
  rader: AdminTrackmanTLRad[];
}

export function AdminTrackmanTrainLock({ data }: { data: AdminTrackmanTLData }) {
  const router = useRouter();
  const [sok, setSok] = useState("");

  const synlige = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return data.rader;
    return data.rader.filter((r) => r.navn.toLowerCase().includes(q));
  }, [data.rader, sok]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: TL.loft.s3, maxWidth: 860, margin: "0 auto", width: "100%" }}>
      <div>
        <CapsLabel>Academy · stallen</CapsLabel>
        <h1 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: TL.storrelse.tittel, fontWeight: 700, color: TL.text }}>
          TrackMan
        </h1>
        <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
          {data.oktDenneUken} {data.oktDenneUken === 1 ? "økt" : "økter"} denne uken · {data.antallSpillere}{" "}
          {data.antallSpillere === 1 ? "spiller" : "spillere"} · simulator som bookbar ressurs: nei
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 8 }}>
        {data.kpis.map((k) => (
          <KpiTile key={k.label} label={k.label} value={k.value} />
        ))}
      </div>

      {data.hero && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <CapsLabel>
              {data.hero.playerName} · {data.hero.club} · automatisk
            </CapsLabel>
            <Link
              href={data.hero.sessionHref}
              style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, textDecoration: "none" }}
            >
              Åpne økt →
            </Link>
          </div>
          {data.hero.result.caddieSentence && (
            <p style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.4 }}>
              {data.hero.result.caddieSentence}
            </p>
          )}
          <DispersionMap
            shots={data.hero.result.shots}
            oneSigmaEllipse={data.hero.result.oneSigmaEllipse}
            twoSigmaEllipse={data.hero.result.twoSigmaEllipse}
            hasEllipse={data.hero.result.hasEllipse}
            sigma={1}
            selectedShotId={null}
            onSelectShot={() => {}}
            showBiasArrow={false}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: TL.tap.min,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
        }}
      >
        <Icon name="search" size={15} style={{ color: TL.mute }} />
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk spiller"
          aria-label="Søk spiller"
          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text }}
        />
      </div>

      <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, overflow: "hidden" }}>
        {synlige.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center" }}>
            <Icon name="activity" size={20} style={{ color: TL.mute }} />
            <p style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text }}>
              {data.rader.length === 0 ? "Ingen TrackMan-økter ennå" : "Ingen treff"}
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
              {data.rader.length === 0
                ? "Data kommer fra coaching-økter — CSV-import eller API."
                : "Prøv et annet søk."}
            </p>
          </div>
        ) : (
          synlige.map((r, i) => (
            <button
              key={r.key}
              type="button"
              onClick={() => router.push(`/admin/trackman/${r.key}`)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                border: "none",
                borderBottom: i === synlige.length - 1 ? "none" : `1px solid ${TL.hair}`,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Avatar navn={r.navn} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>{r.navn}</div>
                <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
                  {r.dato}
                  {r.hcp != null ? ` · HCP ${r.hcp}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                  {r.slag}
                </span>
                <CapsLabel size={9}>{r.kildeLabel}</CapsLabel>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
