"use client";

/**
 * Precision Athletics — Innsikt og talent (AG-22).
 *
 * Kilde: Claude Design AG-22 (designsystem/precision-athletics/ui_kits/agencyos/screens/AG-22.jsx).
 * Ruter: /admin/innsikt, /innsyn/talent/radar, /innsyn/talent/discovery, /innsyn/talent/wagr-import.
 *
 * 3 faner:
 * 1. radar: Talentradar mot peer-snitt. Velg opptil 4 spillere side ved side.
 * 2. disc: Discovery (talentdager, søknader, samtykkestatus).
 * 3. wagr: WAGR-import (CSV-opplasting og matching).
 *
 * Personvernregel:
 * Spillere født 2008 eller senere uten samtykke vises aldri. Spillere uten fødselsår vises ikke.
 */

import { useState } from "react";
import {
  ClipboardList,
  Radar as RadarIcon,
  Upload,
} from "lucide-react";
import {
  FeilTilstand,
  Knapp,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import {
  Faner,
  Kort,
  KortHode,
  Tabell,
  type Kolonne,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a22.css";

export type SpillerTalent = {
  id: string;
  name: string;
  born: number | null;
  consent: boolean;
  v: number[]; // [FYS, TEK, SLAG, SPILL, TURN]
};

export type DiscoveryRad = {
  id: string;
  kilde: string;
  spiller: string;
  fodt: number;
  resultat: string;
  samtykke: boolean;
};

export type AG22Data = {
  src: string;
  axes: string[];
  peer: { label: string; v: number[] };
  players: SpillerTalent[];
  discovery: DiscoveryRad[];
  wagr: { file: string; rows: number; match: number; src: string };
};

export type AG22Tilstand = "data" | "tom" | "laster" | "feil";

export type AG22InnsiktTalentProps = {
  tilstand?: AG22Tilstand;
  data?: AG22Data;
  startFane?: string;
  onNavigerTilTester?: () => void;
};

const STANDARD_DATA: AG22Data = {
  src: "TESTER OG RUNDER · 20.09.2026 · ESTIMAT",
  axes: ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
  peer: {
    label: "Peer-snitt kategori D · 14 spillere",
    v: [60, 58, 63, 57, 52],
  },
  players: [
    { id: "p1", name: "Tobias Lindvik", born: 2009, consent: true, v: [64, 61, 70, 59, 55] },
    { id: "p2", name: "Magnus Aasheim", born: 2008, consent: true, v: [72, 69, 75, 68, 66] },
    { id: "p4", name: "Ingrid Berg", born: 2010, consent: true, v: [58, 62, 64, 61, 50] },
    { id: "p3", name: "Sara Holm", born: 2009, consent: false, v: [55, 50, 58, 56, 48] },
    { id: "p13", name: "Henrik Dahl", born: 2007, consent: false, v: [70, 71, 72, 70, 69] },
    { id: "px", name: "Ukjent fødselsår", born: null, consent: true, v: [50, 50, 50, 50, 50] },
  ],
  discovery: [
    {
      id: "d1",
      kilde: "Vår 2026 · Talentdag Borregaard",
      spiller: "Emil Strand",
      fodt: 2012,
      resultat: "SLAG 68 · 3 av 5 tester",
      samtykke: true,
    },
    {
      id: "d2",
      kilde: "Vår 2026 · Talentdag Borregaard",
      spiller: "Anonym spiller",
      fodt: 2013,
      resultat: "—",
      samtykke: false,
    },
  ],
  wagr: {
    file: "wagr-export-2026-09-21.csv",
    rows: 3,
    match: 2,
    src: "WAGR · 21.09.2026",
  },
};

function RadarDiagram({
  axes,
  v,
  peer,
  size = 220,
}: {
  axes: string[];
  v?: number[];
  peer: number[];
  size?: number;
}) {
  const n = axes.length;
  const R = size * 0.34;
  const c = size / 2;

  const pt = (i: number, x: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + (Math.cos(a) * R * x) / 100, c + (Math.sin(a) * R * x) / 100];
  };

  const poly = (vals: number[]) => vals.map((x, i) => pt(i, x).join(",")).join(" ");

  const ariaDesc = axes
    .map((a, i) => `${a} ${v ? v[i] : "—"} mot peer ${peer[i]}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{
        width: "100%",
        maxWidth: size,
        height: "auto",
        display: "block",
        margin: "0 auto",
      }}
      role="img"
      aria-label={ariaDesc}
    >
      {[25, 50, 75, 100].map((l) => (
        <polygon
          key={l}
          points={poly(axes.map(() => l))}
          fill="none"
          stroke="var(--border-hairline)"
        />
      ))}
      <polygon
        points={poly(peer)}
        fill="none"
        stroke="var(--text-muted)"
        strokeDasharray="4 3"
        strokeWidth="1.5"
      />
      {v && (
        <polygon
          points={poly(v)}
          fill="var(--surface-sunken)"
          fillOpacity=".7"
          stroke="var(--text-primary)"
          strokeWidth="2"
        />
      )}
      {v &&
        v.map((x, i) => {
          const [px, py] = pt(i, x);
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r="3.5"
              fill={`var(--axis-${axes[i].toLowerCase()})`}
            />
          );
        })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 128);
        return (
          <g key={a}>
            <text
              x={x}
              y={y - 1}
              textAnchor="middle"
              style={{
                font: "600 10px var(--font-mono)",
                fill: "var(--text-primary)",
              }}
            >
              {a}
            </text>
            <text
              x={x}
              y={y + 11}
              textAnchor="middle"
              style={{
                font: "400 10px var(--font-mono)",
                fill: "var(--text-muted)",
              }}
            >
              {v ? v[i] : "—"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AG22InnsiktTalent({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "radar",
  onNavigerTilTester,
}: AG22InnsiktTalentProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const [valgteSpillere, setValgteSpillere] = useState<string[]>(["p1", "p2"]);
  const [importert, setImportert] = useState(false);

  if (tilstand === "laster") {
    return (
      <div className="pa-a22" data-testid="ag22-laster">
        <Sidehode
          kicker="Innsikt og talent"
          title="Innsikt og talent"
          sub="Talentradar mot peer-snitt, discovery og WAGR. Kohortsammenligning er bare for coach."
        />
        <LasterTilstand text="Henter talentprofiler …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a22" data-testid="ag22-feil">
        <Sidehode
          kicker="Innsikt og talent"
          title="Innsikt og talent"
          sub="Talentradar mot peer-snitt, discovery og WAGR. Kohortsammenligning er bare for coach."
        />
        <FeilTilstand
          icon={RadarIcon}
          title="Talentdata kunne ikke hentes"
          text="Ingen profiler er endret. Prøv igjen."
          code="FEIL 503 · TALENT"
        />
      </div>
    );
  }

  // Filtrer spillere i henhold til personvernregel:
  // born != null && (born < 2008 || consent)
  const synligeSpillere =
    tilstand === "tom"
      ? []
      : data.players.filter(
          (p) => p.born != null && (p.born < 2008 || p.consent)
        );
  const skjulteAntall =
    tilstand === "tom" ? 0 : data.players.length - synligeSpillere.length;

  const toggleSpiller = (id: string) => {
    setValgteSpillere((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
        ? prev
        : [...prev, id]
    );
  };

  const valgteObjekter = synligeSpillere.filter((p) =>
    valgteSpillere.includes(p.id)
  );

  const faner = [
    { value: "radar", label: "Radar" },
    { value: "disc", label: "Discovery" },
    { value: "wagr", label: "WAGR-import" },
  ];

  const discoveryKolonner: Kolonne<DiscoveryRad>[] = [
    { key: "kilde", label: "Kilde", render: (r) => r.kilde, lead: true },
    { key: "spiller", label: "Spiller", render: (r) => r.spiller },
    { key: "fodt", label: "Født", render: (r) => String(r.fodt), mono: true },
    { key: "resultat", label: "Resultat", render: (r) => r.resultat, mono: true },
    {
      key: "samtykke",
      label: "Samtykke",
      render: (r) =>
        r.samtykke ? (
          <StatusPille tone="ok">Ja</StatusPille>
        ) : (
          <StatusPille tone="neutral">Mangler</StatusPille>
        ),
    },
  ];

  const synligeDiscovery =
    tilstand === "tom"
      ? []
      : data.discovery.filter((r) => r.fodt < 2008 || r.samtykke);

  return (
    <div className="pa-a22" data-testid="ag22-innsikt-talent">
      <Sidehode
        kicker="Innsikt og talent"
        title="Innsikt og talent"
        sub="Talentradar mot peer-snitt, discovery og WAGR. Kohortsammenligning er bare for coach."
      />

      <div
        role="region"
        aria-label="Tilgangsinformasjon"
        style={{
          padding: "12px 16px",
          borderRadius: "var(--radius)",
          background: "var(--surface-sunken)",
          border: "1px solid var(--border-hairline)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.45,
        }}
      >
        <strong
          style={{
            color: "var(--text-primary)",
            display: "block",
            marginBottom: 2,
          }}
        >
          Bare for coach
        </strong>
        Spillere født 2008 eller senere uten samtykke vises aldri. Spillere uten
        fødselsår vises ikke.
        {skjulteAntall > 0 &&
          ` ${skjulteAntall} ${
            skjulteAntall === 1 ? "spiller er" : "spillere er"
          } skjult.`}
      </div>

      <Faner faner={faner} value={aktivFane} onChange={setAktivFane} />

      {tilstand === "tom" && aktivFane !== "wagr" ? (
        <TomTilstand
          icon={RadarIcon}
          title="Ingen talentprofiler"
          text="Talentradaren bygges fra tester og runder. Tildel testbatteriet i Tester."
          actions={
            <Knapp
              icon={ClipboardList}
              onClick={() => onNavigerTilTester?.()}
            >
              Åpne Tester
            </Knapp>
          }
        />
      ) : (
        <>
          {/* Fane 1: Radar */}
          {aktivFane === "radar" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
              data-testid="ag22-fane-radar"
            >
              <div className="pa-a22__picker">
                <Meta>
                  VELG OPPTIL FIRE SPILLERE · {valgteSpillere.length} AV 4
                </Meta>
                <div className="pa-a22__pills">
                  {synligeSpillere.map((p) => {
                    const erValgt = valgteSpillere.includes(p.id);
                    const kanVelges = erValgt || valgteSpillere.length < 4;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        className="pa-choice"
                        aria-pressed={erValgt}
                        disabled={!kanVelges}
                        onClick={() => toggleSpiller(p.id)}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {valgteObjekter.length > 0 ? (
                <div className="pa-a22__radar-grid">
                  {valgteObjekter.map((p) => {
                    const snitt = Math.round(
                      p.v.reduce((a, b) => a + b, 0) / p.v.length
                    );
                    const peerSnitt = Math.round(
                      data.peer.v.reduce((a, b) => a + b, 0) / data.peer.v.length
                    );
                    return (
                      <div key={p.id} className="pa-a22__radar-card">
                        <div className="pa-a22__radar-card-header">
                          <span className="pa-a22__radar-player-name">
                            {p.name}
                          </span>
                          <Meta>FØDT {p.born}</Meta>
                        </div>
                        <RadarDiagram
                          axes={data.axes}
                          v={p.v}
                          peer={data.peer.v}
                        />
                        <Meta>
                          SNITT {snitt} · PEER {peerSnitt}
                        </Meta>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Velg minst én spiller.
                </p>
              )}

              <div className="pa-a22__legend">
                <span className="pa-a22__legend-item">
                  <span className="pa-a22__legend-solid" />
                  <Meta>SPILLER</Meta>
                </span>
                <span className="pa-a22__legend-item">
                  <span className="pa-a22__legend-dashed" />
                  <Meta>{data.peer.label.toUpperCase()}</Meta>
                </span>
                <Meta>INDEKS 0–100 · {data.src}</Meta>
              </div>
            </div>
          )}

          {/* Fane 2: Discovery */}
          {aktivFane === "disc" && (
            <div data-testid="ag22-fane-discovery">
              <Tabell
                caption="Discovery · talentdager og søknader"
                columns={discoveryKolonner}
                rows={synligeDiscovery}
                tomTekst="Ingen talentdager eller søknader registrert."
              />
            </div>
          )}

          {/* Fane 3: WAGR-import */}
          {aktivFane === "wagr" && (
            <div className="pa-a22__wagr-card" data-testid="ag22-fane-wagr">
              <Kort>
                <KortHode tittel="WAGR-import" aside={data.wagr.src} />
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.45,
                  }}
                >
                  Last opp CSV fra WAGR. Spillere matches på navn og fødselsår.
                  Umatchede rader lagres ikke.
                </p>

                {importert ? (
                  <div
                    role="status"
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius)",
                      background: "var(--surface-sunken)",
                      border: "1px solid var(--border-hairline)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--ok, var(--text-primary))",
                      }}
                    >
                      Importert {data.wagr.match} av {data.wagr.rows} rader
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {data.wagr.file} · 1 rad uten treff i stallen ble hoppet
                      over.
                    </div>
                  </div>
                ) : (
                  <div className="pa-a22__dropzone">
                    <Meta>
                      {data.wagr.file.toUpperCase()} · {data.wagr.rows} RADER
                    </Meta>
                    <Knapp
                      variant="secondary"
                      icon={Upload}
                      onClick={() => setImportert(true)}
                    >
                      Importer fil
                    </Knapp>
                  </div>
                )}
              </Kort>
            </div>
          )}
        </>
      )}
    </div>
  );
}
