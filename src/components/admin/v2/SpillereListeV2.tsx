"use client";

/**
 * AgencyOS Spillere (stall-tabell) — v2 (retning C «Presis»). Rekomponert
 * fra legacy-skjermen (admin/(legacy)/agencyos/spillere): søkbar, data-tett
 * tabell med HCP, SG-trend, pakke og betalingsstatus. Filter/søk er
 * server-side via URL-searchParams (delbare/bokmerkbare lenker, samme som
 * legacy) — denne komponenten er ren visning av allerede filtrerte rader.
 *
 * Ny v2-primitiv: MiniSpark (src/components/v2/datavis.tsx) — inline
 * trend-sparkline, lagt til her fordi den er et reelt gjentatt databehov
 * (Anders' mandat 9. juli: skreddersy komponenter for dataene).
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  TomTilstand,
  MiniSpark,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type SpillerRadData = {
  id: string;
  navn: string;
  initialer: string;
  hcp: number | null;
  pakke: string;
  pakkeAktiv: boolean;
  sistMott: string | null;
  totaltOkter: number;
  skylder: boolean;
  sgTotal: number | null;
  /** Eldste → nyeste, for MiniSpark. */
  sgTrend: number[];
};

export type SpillereFilter = "alle" | "aktiv" | "abonnent" | "skylder";

export type SpillereListeV2Data = {
  rader: SpillerRadData[];
  filtrert: SpillerRadData[];
  q: string;
  filter: SpillereFilter;
  filtere: { key: SpillereFilter; label: string; count: number }[];
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

function fmtSg(n: number | null): string {
  if (n == null) return "—";
  const s = Math.abs(n).toFixed(2).replace(".", ",");
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
}

function fmtHcp(n: number | null): string {
  return n != null ? n.toFixed(1).replace(".", ",") : "—";
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function SpillereListeV2({ data }: { data: SpillereListeV2Data }) {
  const { filtrert, q, filter, filtere, rader } = data;

  function filterHref(key: SpillereFilter): string {
    const qs = new URLSearchParams();
    qs.set("filter", key);
    if (q) qs.set("q", q);
    return `/admin/agencyos/spillere?${qs.toString()}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>AgencyOS · Spillere</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="spillere">Mine</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
          {rader.length} totalt. Caddie holder hver spillerside oppdatert etter hver økt.
        </p>
      </div>

      {/* Filter + søk (server-side via URL — samme lenke-mønster som legacy) */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {filtere.map((f) => {
          const on = filter === f.key;
          return (
            <Link key={f.key} href={filterHref(f.key)} style={{ textDecoration: "none" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 28,
                  padding: "0 12px",
                  borderRadius: 9999,
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  color: on ? T.onLime : T.mut,
                  background: on ? T.lime : T.panel2,
                  border: `1px solid ${on ? "transparent" : T.border}`,
                }}
              >
                {f.label}
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "1px 5px",
                    borderRadius: 9999,
                    background: on ? "color-mix(in srgb, black 15%, transparent)" : T.panel3,
                  }}
                >
                  {f.count}
                </span>
              </span>
            </Link>
          );
        })}

        <form style={{ flex: "1 1 200px", maxWidth: 320 }}>
          <input type="hidden" name="filter" value={filter} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Søk på navn, pakke eller fokus …"
            style={{
              width: "100%",
              height: 28,
              borderRadius: 9999,
              border: `1px solid ${T.border}`,
              background: T.panel,
              padding: "0 14px",
              fontFamily: T.ui,
              fontSize: 12,
              color: T.fg,
              outline: "none",
            }}
          />
        </form>
      </div>

      {/* Tabell/liste */}
      {rader.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere i stallen ennå"
            sub="Spillere du coacher dukker opp her med HCP, SG-trend, pakke og betalingsstatus."
          />
        </Kort>
      ) : filtrert.length === 0 ? (
        <Kort>
          <TomTilstand icon="search" title="Ingen treff" sub="Ingen spillere matcher filteret." />
        </Kort>
      ) : (
        <Kort pad="6px 18px">
          {filtrert.map((r, i) => (
            <Link key={r.id} href={`/admin/spillere/${r.id}`} style={{ textDecoration: "none", display: "block" }}>
              <Rad
                last={i === filtrert.length - 1}
                leading={<AvatarInit navn={r.navn} size={34} />}
                title={r.navn}
                sub={`${r.totaltOkter} økter · HCP ${fmtHcp(r.hcp)} · ${r.pakke}`}
                meta={
                  <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <MiniSpark verdier={r.sgTrend} />
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        minWidth: 46,
                        textAlign: "right",
                        color: r.sgTotal == null ? T.mut : r.sgTotal > 0 ? T.up : r.sgTotal < 0 ? T.down : T.mut,
                      }}
                    >
                      {fmtSg(r.sgTotal)}
                    </span>
                    <StatusPill tone={r.skylder ? "down" : "up"}>{r.skylder ? "Skylder" : "OK"}</StatusPill>
                  </span>
                }
              />
            </Link>
          ))}
        </Kort>
      )}
    </div>
  );
}
