"use client";

/**
 * Precision Athletics — Oppgaver & rutiner (AG-21).
 *
 * Kilde: Claude Design AG-21 (arkiv/2026-09-30/agencyos/screens/AG-21.jsx).
 * Ruter: /admin/oppgaver, /admin/workspace/notion.
 *
 * 4 faner:
 * Oppgaver og prosjekter har Notion som eneste kilde. Inntil koblingen er på plass
 * vises tom tilstand; ingenting lages i skjermen.
 * 1. mine  2. prosj  3. rutiner  4. notion
 */

import { useState } from "react";
import { ArrowRight, CheckSquare, Plus } from "lucide-react";
import {
  FeilTilstand,
  Knapp,
  KnappLenke,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import { Faner, Kort, KortHode } from "@/components/precision/pa-a5";
import "@/styles/precision-a21.css";

export type Oppgave = {
  id: string;
  t: string;
  due: string;
  p: string;
  by: string;
  done: boolean;
};

export type Prosjekt = [string, number, number, string]; // [navn, totalt, ferdig, frist]
export type Rutine = [string, string, string, boolean]; // [dag, tittel, hvem, gjort]

export type AG21Data = {
  mine: Oppgave[];
  projects: Prosjekt[];
  routines: Rutine[];
  /** Null når Notion ikke er koblet. */
  notion: { page: string; synced: string } | null;
};

export type AG21Tilstand = "data" | "tom" | "laster" | "feil";

export type AG21OppgaverProps = {
  tilstand?: AG21Tilstand;
  data?: AG21Data;
  startFane?: string;
};

const TOM_DATA: AG21Data = { mine: [], projects: [], routines: [], notion: null };

const SUB = "Prosjekter og oppgaver kommer fra Notion, som er eneste kilde.";

export function AG21Oppgaver({
  tilstand = "data",
  data = TOM_DATA,
  startFane = "mine",
}: AG21OppgaverProps) {
  const [aktivFane, setAktivFane] = useState(startFane);

  if (tilstand === "laster") {
    return (
      <div className="pa-a21" data-testid="ag21-laster">
        <Sidehode kicker="Oppgaver" title="Oppgaver" sub={SUB} />
        <LasterTilstand text="Henter oppgaver …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a21" data-testid="ag21-feil">
        <Sidehode kicker="Oppgaver" title="Oppgaver" sub={SUB} />
        <FeilTilstand
          icon={CheckSquare}
          title="Oppgavene kunne ikke hentes"
          text="Prøv igjen om litt."
          code="OPPGAVER"
        />
      </div>
    );
  }

  const mine = tilstand === "tom" ? [] : data.mine;
  const prosjekter = tilstand === "tom" ? [] : data.projects;
  const rutiner = tilstand === "tom" ? [] : data.routines;
  const uferdigeMine = mine.filter((x) => !x.done).length;

  const faner = [
    { value: "mine", label: "Mine oppgaver", count: uferdigeMine > 0 ? uferdigeMine : undefined },
    { value: "prosj", label: "Prosjekter" },
    { value: "rutiner", label: "Rutiner" },
    { value: "notion", label: "Notion" },
  ];

  const ikkeKoblet = (
    <TomTilstand
      icon={CheckSquare}
      title="Ingen oppgaver å vise"
      text="Oppgaver vises her når Notion er koblet til. Ingenting er lagt inn av Jarvis eller lagd i skjermen."
      actions={
        <KnappLenke href="/admin/workspace/notion" icon={ArrowRight}>
          Åpne Notion-oppsett
        </KnappLenke>
      }
    />
  );

  return (
    <div className="pa-a21" data-testid="ag21-oppgaver">
      <Sidehode kicker="Oppgaver" title="Oppgaver" sub={SUB} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Faner faner={faner} value={aktivFane} onChange={setAktivFane} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Knapp icon={Plus} disabled>
            Ny oppgave
          </Knapp>
          <Meta>IKKE KOBLET ENNÅ</Meta>
        </div>
      </div>

      {aktivFane === "mine" &&
        (mine.length === 0 ? (
          ikkeKoblet
        ) : (
          <Kort>
            {mine.map((o) => (
              <div key={o.id} className={`pa-a21__task-row ${o.done ? "pa-a21__task-row--done" : ""}`}>
                <span style={{ fontSize: "14px" }} className={o.done ? "pa-a21__task-text--done" : ""}>
                  {o.t}
                </span>
                <span className="pa-a21__task-spacer" />
                <Meta>
                  {o.p.toUpperCase()} · FRA {o.by.toUpperCase()} · FRIST {o.due}
                </Meta>
              </div>
            ))}
          </Kort>
        ))}

      {aktivFane === "prosj" &&
        (prosjekter.length === 0 ? (
          ikkeKoblet
        ) : (
          <div className="pa-a21__prosjekt-grid" data-testid="ag21-prosjekter">
            {prosjekter.map(([navn, tot, ferdig, frist]) => {
              const prosent = tot > 0 ? Math.round((ferdig / tot) * 100) : 0;
              return (
                <Kort key={navn}>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>{navn}</div>
                  <div className="pa-a21__progress-bar">
                    <div className="pa-a21__progress-fill" style={{ width: `${prosent}%` }} />
                  </div>
                  <Meta>
                    {ferdig} AV {tot} FERDIG · FRIST {frist}
                  </Meta>
                </Kort>
              );
            })}
          </div>
        ))}

      {aktivFane === "rutiner" &&
        (rutiner.length === 0 ? (
          <TomTilstand
            icon={CheckSquare}
            title="Ingen rutiner"
            text="Faste rutiner vises her når de er lagt inn."
          />
        ) : (
          <Kort data-testid="ag21-rutiner">
            {rutiner.map(([dag, tittel, , ok]) => (
              <div key={tittel} className="pa-a21__rutine-row">
                <span className="pa-a21__rutine-dag">{dag.toUpperCase()}</span>
                <span className="pa-a21__rutine-text">{tittel}</span>
                <StatusPille tone={ok ? "ok" : "neutral"}>{ok ? "Gjort denne uka" : "Ikke gjort"}</StatusPille>
              </div>
            ))}
          </Kort>
        ))}

      {aktivFane === "notion" && (
        <div className="pa-a21__notion-card" data-testid="ag21-notion">
          <Kort>
            <KortHode tittel="Notion" aside={data.notion ? `SIST SYNKET ${data.notion.synced}` : "IKKE KOBLET"} />
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              {data.notion
                ? data.notion.page
                : "Notion er ikke koblet til denne skjermen ennå. Oppsettet ligger under Notion-arbeidsflate."}
            </p>
            <div className="pa-a21__actions">
              <KnappLenke href="/admin/workspace/notion" variant="secondary" icon={ArrowRight}>
                Åpne Notion-oppsett
              </KnappLenke>
            </div>
          </Kort>
        </div>
      )}
    </div>
  );
}
