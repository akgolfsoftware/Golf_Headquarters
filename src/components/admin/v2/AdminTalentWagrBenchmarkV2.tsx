"use client";

/**
 * AgencyOS — Talent · WAGR-benchmark, v2-port 17. juli 2026. Rekomponerer den
 * gamle /admin/(legacy)/talent/wagr-benchmark-skjermen i v2-idiomet med
 * IDENTISK datakontrakt: WagrSnapshot topp 5 globalt + topp 5 norske som
 * kalibreringspunkter for NGF-kategori (beregnet fra Pts Avg). Sletting bruker
 * den EKTE server action `slettWagrSnapshot` (uendret). Domeneregel: spillere
 * som forsvinner fra WAGR er blitt proff — aldri en feiltilstand.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Caps, Tittel, Kort, Rad, DeltaChip, StatusPill, TomTilstand, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { HjelpTips } from "@/components/v2/hjelp";
import { slettWagrSnapshot } from "@/app/admin/(legacy)/talent/wagr-import/actions";

// ── Datakontrakt (mappes fra ruten) ─────────────────────────────
export interface WagrBenchmarkRad {
  id: string;
  wagrPlayerSlug: string;
  fullName: string;
  country: string;
  rank: number;
  moveDelta: number | null;
  ptsAvg: number;
  ngfCategory: string | null;
}
export interface AdminTalentWagrBenchmarkV2Data {
  globale: WagrBenchmarkRad[];
  norske: WagrBenchmarkRad[];
  /** «uke 18/2026» — fra nyeste snapshotAt, null uten data. */
  snapshotLabel: string | null;
}

// NGF-kategori → tier/poenggrense (Øyvind Rojahns skala, kalibrert mot WAGR
// Pts Avg — samme fasit-tabell som legacy-skjermen).
const KATEGORI_INFO: { kat: string; tier: string; pts: string }[] = [
  { kat: "A", tier: "OWGR Top 150", pts: "≥1500" },
  { kat: "B", tier: "OWGR Top 400", pts: "≥1100" },
  { kat: "C", tier: "OWGR Top 700", pts: "≥900" },
  { kat: "D", tier: "Am. World 100", pts: "≥700" },
  { kat: "E", tier: "Am. Europa 300", pts: "≥400" },
  { kat: "F", tier: "Junior WORLD", pts: "≥220" },
  { kat: "G", tier: "Junior EUROPE", pts: "≥100" },
  { kat: "H", tier: "Junior Nasjonal", pts: "≥50" },
  { kat: "I", tier: "Junior Region/Klubb", pts: "<50" },
];

function SlettKnapp({ id, fullName }: { id: string; fullName: string }) {
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState(false);

  function slett() {
    if (!confirm(`Slette WAGR-snapshot for «${fullName}»?`)) return;
    setFeil(false);
    start(async () => {
      try {
        await slettWagrSnapshot(id);
      } catch {
        setFeil(true);
        toast.error(`Kunne ikke slette «${fullName}» — prøv igjen.`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={slett}
      disabled={pending}
      aria-label={`Slett ${fullName}`}
      className="v2-press v2-focus"
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        border: `1px solid ${feil ? T.down : T.border}`,
        background: "transparent",
        color: feil ? T.down : T.mut,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.5 : 1,
      }}
    >
      <Icon name={pending ? "loader-2" : "trash-2"} size={13} />
    </button>
  );
}

function SpillerListe({ rows }: { rows: WagrBenchmarkRad[] }) {
  return (
    <>
      {rows.map((r, i) => (
        <Rad
          key={r.id}
          leading={
            <span style={{ width: 30, fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {r.rank}
            </span>
          }
          title={r.fullName}
          sub={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name="flag" size={10} />
              <span style={{ fontFamily: T.mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.country}</span>
            </span>
          }
          meta={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              {r.moveDelta != null && r.moveDelta !== 0 && (
                <DeltaChip v={String(Math.abs(r.moveDelta))} dir={r.moveDelta > 0 ? "up" : "down"} />
              )}
              <span style={{ textAlign: "right" }}>
                <span style={{ display: "block", fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                  {r.ptsAvg.toFixed(2).replace(".", ",")}
                </span>
                <Caps size={8.5} style={{ marginTop: 2 }}>Pts Avg</Caps>
              </span>
              {r.ngfCategory && <StatusPill tone="lime">{r.ngfCategory}</StatusPill>}
              <Link
                href={`https://www.wagr.com/playerprofile/${r.wagrPlayerSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Åpne ${r.fullName} på wagr.com`}
                className="v2-focus"
                style={{ display: "inline-flex", alignItems: "center", color: T.mut }}
              >
                <Icon name="external-link" size={13} />
              </Link>
              <SlettKnapp id={r.id} fullName={r.fullName} />
            </span>
          }
          trailing={null}
          last={i === rows.length - 1}
        />
      ))}
    </>
  );
}

export function AdminTalentWagrBenchmarkV2({ data }: { data: AdminTalentWagrBenchmarkV2Data }) {
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Talent · WAGR-benchmark</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="verdens beste.">Kalibrer mot</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 560 }}>
          {data.snapshotLabel ? `Snapshot fra wagr.com · ${data.snapshotLabel}. ` : "Ingen snapshot ennå. "}
          NGF-kategori beregnes fra Pts Avg. <HjelpTips k="wagr" />
        </p>
      </div>
      <Link
        href="/admin/talent/wagr-import"
        className="v2-press v2-focus"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 15px",
          borderRadius: T.rPill,
          background: T.lime,
          color: T.onLime,
          fontFamily: T.ui,
          fontSize: 12.5,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        <Icon name="plus" size={14} />
        Importer spiller
      </Link>
    </div>
  );

  const skala = (
    <Kort eyebrow="NGF-kategori-skala" action={<Caps size={9}>Pts Avg-grenser</Caps>}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5" style={{ gap: 10 }}>
        {KATEGORI_INFO.map((info) => (
          <div
            key={info.kat}
            style={{ borderRadius: T.rRow, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
              <span style={{ fontFamily: T.disp, fontSize: 17, fontWeight: 700, color: T.fg }}>{info.kat}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{info.pts}</span>
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 3 }}>{info.tier}</div>
          </div>
        ))}
      </div>
    </Kort>
  );

  const globale = (
    <Kort eyebrow="Topp 5 menn · globalt" action={<Caps size={9}>Taket på skalaen</Caps>}>
      {data.globale.length === 0 ? (
        <TomTilstand
          icon="trophy"
          title="Ingen globale referansespillere"
          sub="Importer spillere fra wagr.com via WAGR-import for å kalibrere skalaen."
        />
      ) : (
        <SpillerListe rows={data.globale} />
      )}
    </Kort>
  );

  const norske = (
    <Kort eyebrow="Topp 5 norske gutter" action={<Caps size={9}>Floor for elite-junior</Caps>}>
      {data.norske.length === 0 ? (
        <TomTilstand
          icon="trophy"
          title="Ingen norske referansespillere"
          sub="Importer norske spillere via WAGR-import for å sette floor for elite-junior."
        />
      ) : (
        <SpillerListe rows={data.norske} />
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {skala}
      {globale}
      {norske}
      <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55, margin: 0 }}>
        Rankinger oppdateres via «Synk nå» på WAGR-import-skjermen. Spillere som
        forsvinner fra WAGR regnes som blitt proff — siste amatørtall beholdes.
      </p>
    </div>
  );
}
