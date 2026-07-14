"use client";

/**
 * AgencyOS v2 — TrackMan-oversikt (`/admin/trackman`, AgencyOS Bølge 3.7,
 * 2026-07-14). Port fra `(legacy)/trackman/page.tsx` + `trackman-actions.tsx`
 * — samme `TrackManSession`-datamodell (KPI-strip + tabell), filter-chipsene
 * er fortsatt placeholder-toasts («kommer snart»), som i fasit.
 */

import Link from "next/link";
import { toast } from "sonner";
import { Caps, Tittel, Kort, Rad, Icon, StatusPill, T, KpiFlis } from "@/components/v2";

export interface AdminTrackmanV2Rad {
  brukerId: string;
  navn: string;
  initialer: string;
  hcpTekst: string | null;
  dato: string;
  shotCount: number;
  kilde: string;
  miljo: string | null;
}

export interface AdminTrackmanV2Data {
  siste30dAntall: number;
  shots30d: number;
  snittShots: number;
  aktiveSpillere: number;
  totalSessions: number;
  rader: AdminTrackmanV2Rad[];
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (label === "Spiller") toast.info("Filtrer via spillerkortet");
        else if (label === "Miljø") toast.info("Miljø-filter kommer snart");
        else toast.info("Kilde-filter kommer snart");
      }}
      style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 13px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.borderS}`, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.fg2 }}
    >
      {label} <Icon name="chevron-down" size={12} />
    </button>
  );
}

export function AdminTrackmanV2({ siste30dAntall, shots30d, snittShots, aktiveSpillere, totalSessions, rader }: AdminTrackmanV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>AgencyOS · TrackMan</Caps>
        <Tittel em="launch monitor, samlet.">Hver økt på</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 620 }}>
          TrackMan-sesjoner fra hele stallen — slag-volum, kilde og miljø per økt. <b style={{ color: T.fg }}>{siste30dAntall}</b> sesjoner siste 30 dager · <b style={{ color: T.fg }}>{shots30d.toLocaleString("nb-NO")}</b> slag · {totalSessions} totalt.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: T.gap }}>
        <KpiFlis label="Sesjoner · 30d" value={siste30dAntall} hjelp="trackman" instant />
        <KpiFlis label="Slag · 30d" value={shots30d.toLocaleString("nb-NO")} hjelp="trackman" instant />
        <KpiFlis label="Snitt slag/sesjon" value={snittShots} hjelp="trackman" instant />
        <KpiFlis label="Aktive spillere" value={aktiveSpillere} instant />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <FilterChip label="Spiller" />
        <FilterChip label="Miljø" />
        <FilterChip label="Kilde" />
        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>Sortert · nyeste</span>
      </div>

      <Kort pad="6px 14px">
        {rader.length === 0 ? (
          <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen TrackMan-sesjoner. Når spillere importerer CSV fra TrackMan eller kobler API-en vises sesjonene her.
          </div>
        ) : (
          rader.map((s, i) => (
            <Rad
              key={`${s.brukerId}-${i}`}
              last={i === rader.length - 1}
              leading={
                <span style={{ width: 32, height: 32, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2, flex: "none" }}>{s.initialer}</span>
              }
              title={<Link href={`/admin/spillere/${s.brukerId}`} style={{ color: "inherit", textDecoration: "none" }}>{s.navn}</Link>}
              sub={[s.hcpTekst ? `HCP ${s.hcpTekst}` : null, s.dato].filter(Boolean).join(" · ")}
              meta={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>{s.shotCount}</span>
                  <StatusPill tone="info">{s.kilde}</StatusPill>
                  {s.miljo && <StatusPill tone="lime">{s.miljo}</StatusPill>}
                </div>
              }
            />
          ))
        )}
      </Kort>
    </div>
  );
}
