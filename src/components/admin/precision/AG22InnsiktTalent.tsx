"use client";

/**
 * Innsikt og talent (AG-22) i nytt design: /admin/innsikt, /innsyn/talent/radar,
 * /innsyn/talent/discovery, /innsyn/talent/wagr-import. Bare coach.
 * Personvern: spillere født 2008 eller senere uten samtykke vises aldri, og spillere uten
 * fødselsår vises ikke (filtrerSynligeTalenter / filtrerSynligeDiscovery).
 * Tegning: canvaset «AgencyOS nøkkelskjermer», raden «Kø, oppgaver, innsikt, Jarvis …».
 */

import { useState } from "react";
import { Feil, KnappLenke, Laster, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import { filtrerSynligeDiscovery, filtrerSynligeTalenter } from "@/lib/talent/personvern-filter";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-liste.css";

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
  fodt: number | null;
  resultat: string;
  samtykke: boolean;
};

export type AG22Data = {
  src: string;
  axes: string[];
  peer: { label: string; v: number[] };
  players: SpillerTalent[];
  discovery: DiscoveryRad[];
  /** Null når ingen WAGR-fil er importert. */
  wagr: { file: string; rows: number; match: number; src: string } | null;
};

export type AG22Tilstand = "data" | "tom" | "laster" | "feil";

export type AG22InnsiktTalentProps = {
  tilstand?: AG22Tilstand;
  data?: AG22Data;
  startFane?: string;
};

const TOM_DATA: AG22Data = {
  src: "",
  axes: ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
  peer: { label: "Peer-snitt", v: [0, 0, 0, 0, 0] },
  players: [],
  discovery: [],
  wagr: null,
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

const INGRESS = "Talentradar mot peer-snitt, discovery og WAGR. Kohortsammenligning er bare for coach.";
type FaneId = "radar" | "disc" | "wagr";
const FANER: FaneId[] = ["radar", "disc", "wagr"];
const FANE_NAVN: Record<FaneId, string> = { radar: "Radar", disc: "Discovery", wagr: "WAGR-import" };

export function AG22InnsiktTalent({ tilstand = "data", data = TOM_DATA, startFane = "radar" }: AG22InnsiktTalentProps) {
  const [aktivFane, setAktivFane] = useState<FaneId>(FANER.includes(startFane as FaneId) ? (startFane as FaneId) : "radar");
  const [valgteSpillere, setValgteSpillere] = useState<string[]>(() => data.players.slice(0, 2).map((p) => p.id));
  const topp = <Topp dato="Spillere · bare coach" tittel="Innsikt og talent" ingress={INGRESS} />;

  if (tilstand === "laster") return <div className="agn-s" data-testid="ag22-laster">{topp}<Laster tekst="Henter talentprofiler …" /></div>;
  if (tilstand === "feil") return <div className="agn-s" data-testid="ag22-feil">{topp}<Feil tittel="Talentdata kunne ikke hentes" tekst="Ingen profiler er endret. Prøv igjen." kode="FEIL 503 · TALENT" /></div>;

  // Personvernregel: born != null && (born < 2008 || consent)
  const synligeSpillere = tilstand === "tom" ? [] : filtrerSynligeTalenter(data.players);
  const skjulteAntall = tilstand === "tom" ? 0 : data.players.length - synligeSpillere.length;
  const synligeDiscovery = tilstand === "tom" ? [] : filtrerSynligeDiscovery(data.discovery);

  const toggleSpiller = (id: string) => {
    setValgteSpillere((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]));
  };
  const valgteObjekter = synligeSpillere.filter((p) => valgteSpillere.includes(p.id));
  const peerSnitt = Math.round(data.peer.v.reduce((a, b) => a + b, 0) / (data.peer.v.length || 1));

  return (
    <div className="agn-s" data-testid="ag22-innsikt-talent">
      {topp}

      <div className="teller-rad">
        <div className="teller"><span className="e">Spillere i utvalget</span><b className="t">{tilstand === "tom" ? "—" : synligeSpillere.length}</b><span className="s">{skjulteAntall > 0 ? `${skjulteAntall} skjult av personvernregelen` : "Synlige for coach"}</span></div>
        <div className="teller"><span className="e">Discovery</span><b className="t">{tilstand === "tom" ? "—" : synligeDiscovery.length}</b></div>
        <div className="teller"><span className="e">Kilde</span><b className="t" style={{ fontSize: 20 }}>{data.src || "—"}</b></div>
      </div>

      <Varsel tone="info" tittel="Bare for coach">
        Spillere født 2008 eller senere uten samtykke vises aldri. Spillere uten fødselsår vises ikke.
        {skjulteAntall > 0 ? ` ${skjulteAntall} ${skjulteAntall === 1 ? "spiller er" : "spillere er"} skjult.` : ""}
      </Varsel>

      <nav className="valg" aria-label="Innsikt og talent">
        {FANER.map((f) => <button key={f} type="button" aria-pressed={aktivFane === f} onClick={() => setAktivFane(f)}>{FANE_NAVN[f]}</button>)}
      </nav>

      {tilstand === "tom" && aktivFane !== "wagr" ? (
        <Tom tittel="Ingen talentprofiler" tekst="Talentradaren bygges fra tester og runder. Tildel testbatteriet i Tester." handling={<KnappLenke href="/admin/tester">Åpne Tester</KnappLenke>} />
      ) : (
        <>
          {aktivFane === "radar" && (
            <div className="agn-s-stack" data-testid="ag22-fane-radar">
              <Seksjon tittel="Velg spillere" kilde={`${valgteSpillere.length} av 4`}>
                <div className="valg" role="group" aria-label="Velg opptil fire spillere">
                  {synligeSpillere.map((p) => {
                    const erValgt = valgteSpillere.includes(p.id);
                    const kanVelges = erValgt || valgteSpillere.length < 4;
                    return <button type="button" key={p.id} aria-pressed={erValgt} disabled={!kanVelges} onClick={() => toggleSpiller(p.id)}>{p.name}</button>;
                  })}
                </div>
              </Seksjon>

              {valgteObjekter.length > 0 ? (
                <div className="radar-grid">
                  {valgteObjekter.map((p) => {
                    const snitt = Math.round(p.v.reduce((a, b) => a + b, 0) / (p.v.length || 1));
                    return (
                      <div key={p.id} className="kort">
                        <div className="radar-hode"><b className="undertittel">{p.name}</b><span className="kilde mono">Født {p.born}</span></div>
                        <RadarDiagram axes={data.axes} v={p.v} peer={data.peer.v} />
                        <p className="kilde mono">Snitt {snitt} · peer {peerSnitt}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="forklar">Velg minst én spiller.</p>
              )}
              <p className="kilde">Heltrukket linje er spilleren, stiplet er {data.peer.label}. Indeks 0–100 · {data.src}</p>
            </div>
          )}

          {aktivFane === "disc" && (
            <div data-testid="ag22-fane-discovery">
              {synligeDiscovery.length === 0 ? (
                <Tom tittel="Ingen talentdager eller søknader" tekst="Ingen er registrert ennå." />
              ) : (
                <Seksjon tittel="Discovery" kilde="Talentdager og søknader">
                  <div className="liste">
                    {synligeDiscovery.map((r) => (
                      <div key={r.id} className="drift-rad">
                        <span><b>{r.spiller}</b><span className="kilde">{r.kilde} · født {r.fodt != null ? r.fodt : "—"} · {r.resultat}</span></span>
                        <span aria-hidden />
                        <Pille tone={r.samtykke ? "ok" : "vent"}>{r.samtykke ? "Samtykke" : "Mangler"}</Pille>
                      </div>
                    ))}
                  </div>
                </Seksjon>
              )}
            </div>
          )}

          {aktivFane === "wagr" && (
            <div data-testid="ag22-fane-wagr">
              <Seksjon tittel="WAGR-import" kilde={data.wagr ? data.wagr.src : "Ingen fil importert"}>
                <div className="kort">
                  <p className="forklar">
                    {data.wagr ? `${data.wagr.file} · ${data.wagr.match} av ${data.wagr.rows} rader matchet.` : "Ingen WAGR-fil er importert. Import gjøres i WAGR-importen."}
                  </p>
                  <div className="knapper"><KnappLenke href="/innsyn/talent/wagr-import">Åpne WAGR-import</KnappLenke></div>
                </div>
              </Seksjon>
            </div>
          )}
        </>
      )}
    </div>
  );
}
