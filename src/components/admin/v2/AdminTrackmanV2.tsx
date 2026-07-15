"use client";

/**
 * AgencyOS TrackMan (på tvers) — v2 (retning C «Presis»). Coach-view over alle
 * TrackMan-sesjoner fra hele stallen. Ingen 1:1-mockup finnes i Claude
 * Design-kanon for denne cross-player-tabellen (design-kittet
 * `ui_kits/agencyos/trackman-app.jsx` er en per-spiller sesjon-dybde-visning
 * med dispersion/trajectory-plott, en annen skjerm) — komponert utelukkende
 * av v2-biblioteket (src/components/v2), samme mønster som Runder/Tester/Team:
 * ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen
 * (tidligere src/app/admin/(legacy)/trackman/page.tsx):
 *   - KPI-strip: sesjoner/slag siste 30 dager, snitt slag/sesjon, aktive spillere.
 *   - Søk (ekte klientfilter på spillernavn) + miljø-filter (ekte, ikke placeholder-toast).
 *   - Rad-liste: spiller, HCP, dato, slag, kilde, miljø — lenker til spillerprofil.
 *   - Ærlig tom-tilstand (ingen sesjoner ennå / ingen treff på filter).
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  KpiFlis,
  FilterChips,
  TomTilstand,
  HjelpTips,
  Icon,
  T,
} from "@/components/v2";

export interface AdminTrackmanV2Kpi {
  label: string;
  value: string;
  tint?: boolean;
}

export interface AdminTrackmanV2Rad {
  key: string;
  spillerId: string;
  navn: string;
  /** Formatert HCP («12,4»), eller null når spilleren mangler HCP. */
  hcp: string | null;
  dato: string;
  slag: number;
  kildeLabel: string;
  /** Miljø-label (norsk klarspråk), eller null når økta mangler miljø-tag. */
  miljoLabel: string | null;
}

export interface AdminTrackmanV2Data {
  kpis: AdminTrackmanV2Kpi[];
  /** Distinkte miljø-labels i datasettet — fyller filter-chipsene. */
  miljoer: string[];
  rader: AdminTrackmanV2Rad[];
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "lime" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 8px",
        borderRadius: 6,
        background: tone === "lime" ? `color-mix(in srgb,${T.lime} 12%,transparent)` : T.panel3,
        border: `1px solid ${tone === "lime" ? `color-mix(in srgb,${T.lime} 38%,transparent)` : T.border}`,
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: tone === "lime" ? T.lime : T.mut,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function AdminTrackmanV2({ data }: { data: AdminTrackmanV2Data }) {
  const router = useRouter();
  const [sok, setSok] = useState("");
  const [aktivMiljo, setAktivMiljo] = useState<string[]>([]);

  const synlige = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return data.rader.filter((r) => {
      if (q && !r.navn.toLowerCase().includes(q)) return false;
      if (aktivMiljo.length > 0 && (!r.miljoLabel || !aktivMiljo.includes(r.miljoLabel))) return false;
      return true;
    });
  }, [data.rader, sok, aktivMiljo]);

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Caps>Gjennomføre · TrackMan</Caps>
          <HjelpTips k="trackman" size={11} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Tittel em="på tvers.">TrackMan</Tittel>
        </div>
      </div>
    </div>
  );

  // ── KPI-flis ────────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      {data.kpis.map((k) => (
        <KpiFlis key={k.label} label={k.label} value={k.value} tint={k.tint} />
      ))}
    </div>
  );

  // ── Søk + miljø-filter ──────────────────────────────────────────
  const filterRad = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          minWidth: 220,
          height: 40,
          padding: "0 14px",
          borderRadius: T.rRow,
          background: T.panel2,
          border: `1px solid ${T.border}`,
        }}
      >
        <Icon name="search" size={15} style={{ color: T.mut }} />
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk spiller"
          aria-label="Søk spiller"
          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 13.5, color: T.fg }}
        />
      </div>
      {data.miljoer.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Caps size={9}>Miljø</Caps>
          <FilterChips items={data.miljoer} active={aktivMiljo} onToggle={(x) => setAktivMiljo((cur) => (cur.includes(x) ? cur.filter((v) => v !== x) : [...cur, x]))} />
        </div>
      )}
    </div>
  );

  // ── Ingen sesjoner registrert i det hele tatt ────────────────────
  if (data.rader.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand icon="activity" title="Ingen TrackMan-sesjoner ennå" sub="Når spillere importerer CSV fra TrackMan eller kobler API-en, vises sesjonene her." />
        </Kort>
      </div>
    );
  }

  // ── Sesjon-liste ──────────────────────────────────────────────
  const liste = (
    <Kort eyebrow={`Sesjoner · sortert nyeste (${synlige.length})`}>
      {synlige.length === 0 ? (
        <TomTilstand icon="search" title="Ingen treff" sub="Prøv et annet søk eller fjern miljø-filteret." />
      ) : (
        <div style={{ maxHeight: 560, overflowY: "auto", margin: "0 -4px", padding: "0 4px" }}>
          {synlige.map((r, i) => (
            <Rad
              key={r.key}
              onClick={() => router.push(`/admin/spillere/${r.spillerId}`)}
              leading={<AvatarInit navn={r.navn} size={34} />}
              title={r.navn}
              sub={
                r.hcp != null ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {r.dato} · HCP {r.hcp}
                    <HjelpTips k="hcp" size={10} />
                  </span>
                ) : (
                  r.dato
                )
              }
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{r.slag}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>slag</span>
                  <Badge>{r.kildeLabel}</Badge>
                  {r.miljoLabel && <Badge tone="lime">{r.miljoLabel}</Badge>}
                </span>
              }
              trailing={null}
              last={i === synlige.length - 1}
            />
          ))}
        </div>
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {filterRad}
      {liste}
    </div>
  );
}
