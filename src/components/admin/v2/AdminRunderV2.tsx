"use client";

/**
 * AgencyOS Runder — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Alle registrerte runder på tvers av stallen (Round) med KPI og ærlig tomrom.
 * T.* only. Mobil: tabell → Rad under md.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  KpiFlis,
  TallHero,
  StatusPill,
  TomTilstand,
  CTAPill,
  Icon,
} from "@/components/v2";
import { T, fmtSg } from "@/lib/v2/tokens";

// ── Datakontrakt (mappes fra Round i ruten) ─────────────────────
export interface AdminRunderV2Round {
  id: string;
  spiller: string;
  spillerId: string;
  /** Formatert hcp «12,4» — null når spilleren mangler hcp. */
  hcp: string | null;
  bane: string;
  par: number;
  /** Formatert dato «24. jun 2026». */
  dato: string;
  /** Brutto score (ekte slag). */
  score: number;
  /** score − par. */
  vsPar: number;
  /** SG-total for runden. null = ingen SG-data. */
  sg: number | null;
}
export interface AdminRunderV2Beste {
  score: number;
  vsPar: number;
  spiller: string;
  bane: string;
}
export interface AdminRunderV2Data {
  /** Antall nyeste runder vist (rows.length). */
  vist: number;
  /** Totalt antall runder i basen. */
  total: number;
  /** Unike spillere i det viste utvalget. */
  spillere: number;
  /** Snitt brutto score (viste runder m/ score). null = ingen. */
  snittScore: number | null;
  /** Aggregert avvik mot par. null = ingen. */
  vsParSnitt: number | null;
  /** Beste runde etter minst avvik mot par. */
  beste: AdminRunderV2Beste | null;
  /** SG-total snitt. null = ingen SG-runder. */
  sgSnitt: number | null;
  /** Antall runder med SG-data. */
  sgRunder: number;
  runder: AdminRunderV2Round[];
}

/** Heltalls score-avvik med fortegn: «+3» / «−2» / «E» (par). */
function fmtDiff(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

/** vs par → farge: under par = signal-grønt (prestasjon), par/over = nøytralt. */
function diffFarge(n: number): string {
  return n < 0 ? T.up : n === 0 ? T.fg : T.mut;
}

/** 1-desimal komma-snitt (aldri rå JS-float). */
function fmtSnitt(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function sgFarge(sg: number | null): string {
  if (sg == null || sg === 0) return T.mut;
  return sg > 0 ? T.up : T.down;
}

/* ── SG-verdi (mono, fortegnsfarget) ──────────────────────────── */
function SgVerdi({ sg }: { sg: number | null }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 13,
        fontWeight: 700,
        color: sgFarge(sg),
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {sg == null ? "—" : fmtSg(sg)}
    </span>
  );
}

/* ── Desktop-tabell (md+) — tett kolonneoppsett i v2-tokens ────── */
function RunderTabell({
  runder,
  onProfil,
}: {
  runder: AdminRunderV2Round[];
  onProfil: (id: string) => void;
}) {
  const th: React.CSSProperties = {
    padding: "9px 12px",
    textAlign: "left",
    fontFamily: T.mono,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: T.mut,
    borderBottom: `1px solid ${T.borderS}`,
    whiteSpace: "nowrap",
  };
  const thNum: React.CSSProperties = { ...th, textAlign: "right" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th style={th}>Spiller</th>
            <th style={th}>Bane</th>
            <th style={th}>Dato</th>
            <th style={thNum}>Score</th>
            <th style={thNum}>Vs par</th>
            <th style={thNum}>SG total</th>
            <th style={{ ...th, width: 44 }} aria-label="Profil" />
          </tr>
        </thead>
        <tbody>
          {runder.map((r, i) => {
            const last = i === runder.length - 1;
            const bd: React.CSSProperties = {
              padding: "11px 12px",
              borderBottom: last ? "none" : `1px solid ${T.border}`,
              verticalAlign: "middle",
            };
            const bdNum: React.CSSProperties = {
              ...bd,
              textAlign: "right",
              fontFamily: T.mono,
              fontVariantNumeric: "tabular-nums",
            };
            return (
              <tr
                key={r.id}
                className="v2-row-h"
                onClick={() => onProfil(r.spillerId)}
                style={{ cursor: "pointer" }}
              >
                <td style={bd}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <AvatarInit navn={r.spiller} size={30} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
                        {r.spiller}
                      </span>
                      {r.hcp && (
                        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 1 }}>
                          Hcp {r.hcp}
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <td style={bd}>
                  <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, color: T.fg }}>{r.bane}</span>
                  <span style={{ display: "block", fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 1 }}>
                    Par {r.par}
                  </span>
                </td>
                <td style={{ ...bd, fontFamily: T.mono, fontSize: 12, color: T.fg2, whiteSpace: "nowrap" }}>
                  {r.dato}
                </td>
                <td style={{ ...bdNum, fontSize: 14, fontWeight: 700, color: T.fg }}>{r.score}</td>
                <td style={{ ...bdNum, fontSize: 13, fontWeight: 700, color: diffFarge(r.vsPar) }}>
                  {fmtDiff(r.vsPar)}
                </td>
                <td style={bdNum}>
                  <SgVerdi sg={r.sg} />
                </td>
                <td style={{ ...bd, width: 44, textAlign: "right" }}>
                  <Link
                    href={`/admin/spillere/${r.spillerId}`}
                    aria-label={`Profil for ${r.spiller}`}
                    onClick={(e) => e.stopPropagation()}
                    className="v2-press v2-focus"
                    style={{
                      display: "inline-flex",
                      width: 28,
                      height: 28,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.panel2,
                      color: T.mut,
                    }}
                  >
                    <Icon name="chevron-right" size={14} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Mobil-liste (<md) — kort-rader (Rad) ─────────────────────── */
function RunderListe({
  runder,
  onProfil,
}: {
  runder: AdminRunderV2Round[];
  onProfil: (id: string) => void;
}) {
  return (
    <Kort pad="4px 18px">
      {runder.map((r, i) => (
        <Rad
          key={r.id}
          onClick={() => onProfil(r.spillerId)}
          leading={<AvatarInit navn={r.spiller} size={34} />}
          title={r.spiller}
          sub={`${r.bane} · Par ${r.par} · ${r.dato}`}
          meta={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "block",
                    fontFamily: T.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    color: T.fg,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {r.score}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: T.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: diffFarge(r.vsPar),
                    marginTop: 2,
                  }}
                >
                  {fmtDiff(r.vsPar)}
                </span>
              </span>
              <SgVerdi sg={r.sg} />
            </span>
          }
          last={i === runder.length - 1}
        />
      ))}
    </Kort>
  );
}

export function AdminRunderV2({ data }: { data: AdminRunderV2Data }) {
  const router = useRouter();
  const [sok, setSok] = useState("");

  const onProfil = (id: string) => router.push(`/admin/spillere/${id}`);

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return data.runder;
    return data.runder.filter(
      (r) => r.spiller.toLowerCase().includes(q) || r.bane.toLowerCase().includes(q),
    );
  }, [sok, data.runder]);

  // ── Hode — B: status ───────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Analysere · Runder · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="stallen.">Runder på tvers av</Tittel>
        </div>
      </div>
      <StatusPill tone={data.total > 0 ? "lime" : "warn"}>
        {data.total === 0 ? "Ingen runder" : `${data.vist} av ${data.total} · ${data.spillere} spillere`}
      </StatusPill>
    </div>
  );

  // B: én primær CTA — stall for å følge opp spillere uten runder
  const primaerCta = (
    <Link href="/admin/stall" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="users" full>
        Åpne stall
      </CTAPill>
    </Link>
  );

  // ── KPI-strip (4) ───────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Snitt-score" value={data.snittScore == null ? "—" : fmtSnitt(data.snittScore)} />
      <KpiFlis
        label="Vs par · snitt"
        value={data.vsParSnitt == null ? "—" : (data.vsParSnitt > 0 ? "+" : data.vsParSnitt < 0 ? "−" : "") + fmtSnitt(Math.abs(data.vsParSnitt))}
      />
      <Kort>
        {data.beste ? (
          <TallHero
            label="Beste runde"
            value={data.beste.score}
            unit={fmtDiff(data.beste.vsPar)}
            sub={`${data.beste.spiller} · ${data.beste.bane}`}
            size={38}
            accent={data.beste.vsPar <= 0}
          />
        ) : (
          <TallHero label="Beste runde" value="—" sub="Ingen data" size={38} />
        )}
      </Kort>
      <KpiFlis
        label="SG total · snitt"
        value={data.sgSnitt == null ? "—" : fmtSg(data.sgSnitt)}
      />
    </div>
  );

  // ── Søk + sortnote ──────────────────────────────────────────────
  const sokefelt = (
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
          placeholder="Søk spiller eller bane"
          aria-label="Søk spiller eller bane"
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: T.ui,
            fontSize: 13.5,
            color: T.fg,
          }}
        />
      </div>
      <Caps size={9} style={{ display: "block" }}>
        Sortert · nyeste
      </Caps>
    </div>
  );

  // ── Tom-tilstand + vei videre ───────────────────────────────────
  if (data.runder.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {kpi}
        <Kort>
          <TomTilstand
            icon="flag"
            title="Ingen runder registrert"
            sub="Når spillere logger runder fra portalen eller via import, dukker de opp her. Følg opp stallen for å få i gang logging."
          />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  const innhold =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand icon="search" title="Ingen treff" sub="Ingen runder matcher søket akkurat nå." />
      </Kort>
    ) : (
      <>
        <div className="hidden md:block">
          <Kort pad="8px 8px 4px">
            <RunderTabell runder={filtrert} onProfil={onProfil} />
          </Kort>
        </div>
        <div className="md:hidden">
          <RunderListe runder={filtrert} onProfil={onProfil} />
        </div>
      </>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {primaerCta}
      {sokefelt}
      {innhold}
    </div>
  );
}
