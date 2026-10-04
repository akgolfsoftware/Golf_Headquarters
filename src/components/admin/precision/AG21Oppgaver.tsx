"use client";

/**
 * Precision Athletics — Oppgaver & rutiner (AG-21).
 *
 * Kilde: Claude Design AG-21 (arkiv/2026-09-30/agencyos/screens/AG-21.jsx).
 * Ruter: /admin/oppgaver, /admin/workspace/notion.
 *
 * 4 faner:
 * 1. mine: Mine oppgaver med avkryssing og gjennomstreking
 * 2. prosj: Prosjekter med fremdriftsindikator
 * 3. rutiner: Faste ukentlige rutiner
 * 4. notion: Toveis synkronisering med Notion
 */

import { useState } from "react";
import {
  Check,
  CheckSquare,
  ExternalLink,
  Plus,
  RefreshCw,
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
  Ark,
  Faner,
  Felt,
  Kort,
  KortHode,
  TekstFelt,
  ValgFelt,
} from "@/components/precision/pa-a5";
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
  notion: { page: string; synced: string };
};

export type AG21Tilstand = "data" | "tom" | "laster" | "feil";

export type AG21OppgaverProps = {
  tilstand?: AG21Tilstand;
  data?: AG21Data;
  startFane?: string;
  onOpprettOppgave?: (oppgave: Partial<Oppgave>) => void;
};

const STANDARD_DATA: AG21Data = {
  projects: [
    ["Sesongslutt 2026", 6, 2, "31.10.2026"],
    ["Vinterplan WANG", 4, 1, "15.11.2026"],
    ["Rekruttering Mini", 3, 0, "01.12.2026"],
  ],
  routines: [
    ["Mandag", "Publiser ukeplaner", "Anders Kristiansen", true],
    ["Onsdag", "Svar i Innboks innen 24 t", "Anders Kristiansen", true],
    ["Fredag", "Sjekk ACWR for WANG", "Anders Kristiansen", false],
    ["Lørdag", "Godkjenn ukerapporter", "Anders Kristiansen", false],
  ],
  mine: [
    {
      id: "o1",
      t: "Godkjenn ukeplan uke 40 · Tobias Lindvik",
      due: "26.09",
      p: "Sesongslutt 2026",
      by: "Jarvis",
      done: false,
    },
    {
      id: "o2",
      t: "Oppdater nivåstige Team Norway 2027",
      due: "30.09",
      p: "Vinterplan WANG",
      by: "Anders Kristiansen",
      done: false,
    },
    {
      id: "o3",
      t: "Les utkast til foreldrebrev Mini",
      due: "02.10",
      p: "Rekruttering Mini",
      by: "Kari Demo",
      done: false,
    },
    {
      id: "o4",
      t: "Bestill baner til klubbmesterskap",
      due: "20.09",
      p: "Sesongslutt 2026",
      by: "Anders Kristiansen",
      done: true,
    },
  ],
  notion: { page: "AK Golf · Coach-arbeidsflate", synced: "26.09.2026 14:00" },
};

export function AG21Oppgaver({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "mine",
  onOpprettOppgave,
}: AG21OppgaverProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const [mine, setMine] = useState<Oppgave[]>(tilstand === "tom" ? [] : data.mine);
  const [rutiner, setRutiner] = useState<Rutine[]>(data.routines);
  const [arkAapen, setArkAapen] = useState(false);
  const [skjema, setSkjema] = useState({
    t: "",
    p: data.projects[0]?.[0] || "Sesongslutt 2026",
    who: "Anders Kristiansen",
  });
  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  const [bekreftelse, setBekreftelse] = useState<string | null>(null);

  if (tilstand === "laster") {
    return (
      <div className="pa-a21" data-testid="ag21-laster">
        <Sidehode
          kicker="Oppgaver"
          title="Oppgaver"
          sub="Prosjekter, rutiner og oppgaver du har fått. Synkes med Notion."
        />
        <LasterTilstand text="Henter oppgaver …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a21" data-testid="ag21-feil">
        <Sidehode
          kicker="Oppgaver"
          title="Oppgaver"
          sub="Prosjekter, rutiner og oppgaver du har fått. Synkes med Notion."
        />
        <FeilTilstand
          icon={CheckSquare}
          title="Oppgavene kunne ikke hentes"
          text="Notion svarer ikke. Endringer lagres og synkes senere."
          code="NOTION API · 502"
        />
      </div>
    );
  }

  const uferdigeMine = mine.filter((x) => !x.done).length;

  const toggleOppgave = (id: string, ferdig: boolean) => {
    setMine((prev) =>
      prev.map((o) => (o.id === id ? { ...o, done: ferdig } : o))
    );
    setBekreftelse(ferdig ? "Oppgaven er fullført." : "Oppgaven er åpnet igjen.");
  };

  const handleNyOppgave = () => {
    if (!skjema.t.trim()) {
      setFeilmelding("Skriv hva som skal gjøres.");
      return;
    }
    const ny: Oppgave = {
      id: "o" + Date.now(),
      t: skjema.t.trim(),
      due: "03.10",
      p: skjema.p,
      by: "Anders Kristiansen",
      done: false,
    };
    setMine((prev) => [ny, ...prev]);
    setArkAapen(false);
    setSkjema({ ...skjema, t: "" });
    setFeilmelding(null);
    setAktivFane("mine");
    setBekreftelse("Oppgaven er lagt til.");
    onOpprettOppgave?.(ny);
  };

  const faner = [
    { value: "mine", label: "Mine oppgaver", count: uferdigeMine > 0 ? uferdigeMine : undefined },
    { value: "prosj", label: "Prosjekter" },
    { value: "rutiner", label: "Rutiner" },
    { value: "notion", label: "Notion" },
  ];

  return (
    <div className="pa-a21" data-testid="ag21-oppgaver">
      <Sidehode
        kicker="Oppgaver"
        title="Oppgaver"
        sub="Prosjekter, rutiner og oppgaver du har fått. Synkes med Notion."
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Faner faner={faner} value={aktivFane} onChange={setAktivFane} />
        <Knapp icon={Plus} onClick={() => setArkAapen(true)}>
          Ny oppgave
        </Knapp>
      </div>

      {bekreftelse && (
        <div
          role="status"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-card, 8px)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-hairline)",
            fontSize: "13px",
            color: "var(--text-primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{bekreftelse}</span>
          <Knapp
            variant="ghost"
            size="sm"
            onClick={() => setBekreftelse(null)}
            aria-label="Lukk varsel"
          >
            Lukk
          </Knapp>
        </div>
      )}

      {/* Fane 1: Mine oppgaver */}
      {aktivFane === "mine" && (
        <>
          {mine.length === 0 ? (
            <TomTilstand
              icon={CheckSquare}
              title="Ingen oppgaver"
              text="Oppgaver du får tildelt, eller lager selv, samles her."
              actions={
                <Knapp icon={Plus} onClick={() => setArkAapen(true)}>
                  Ny oppgave
                </Knapp>
              }
            />
          ) : (
            <Kort>
              {mine.map((o) => (
                <div
                  key={o.id}
                  className={`pa-a21__task-row ${
                    o.done ? "pa-a21__task-row--done" : ""
                  }`}
                >
                  <label className="pa-check">
                    <input
                      type="checkbox"
                      checked={o.done}
                      onChange={(e) => toggleOppgave(o.id, e.target.checked)}
                      aria-label={`Marker oppgave som ${o.done ? "ugjort" : "fullført"}: ${o.t}`}
                    />
                    <span className="pa-check__box" aria-hidden>
                      {o.done && <Check size={14} />}
                    </span>
                    <span
                      style={{ fontSize: "14px" }}
                      className={o.done ? "pa-a21__task-text--done" : ""}
                    >
                      {o.t}
                    </span>
                  </label>

                  <span className="pa-a21__task-spacer" />

                  <Meta>
                    {o.p.toUpperCase()} · FRA {o.by.toUpperCase()} · FRIST {o.due}
                  </Meta>
                </div>
              ))}
            </Kort>
          )}
        </>
      )}

      {/* Fane 2: Prosjekter */}
      {aktivFane === "prosj" && (
        <div className="pa-a21__prosjekt-grid" data-testid="ag21-prosjekter">
          {data.projects.map(([navn, tot, ferdig, frist]) => {
            const prosent = tot > 0 ? Math.round((ferdig / tot) * 100) : 0;
            return (
              <Kort key={navn}>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>{navn}</div>
                <div className="pa-a21__progress-bar">
                  <div
                    className="pa-a21__progress-fill"
                    style={{ width: `${prosent}%` }}
                  />
                </div>
                <Meta>
                  {ferdig} AV {tot} FERDIG · FRIST {frist}
                </Meta>
              </Kort>
            );
          })}
        </div>
      )}

      {/* Fane 3: Rutiner */}
      {aktivFane === "rutiner" && (
        <Kort data-testid="ag21-rutiner">
          {rutiner.map(([dag, tittel, _hvem, ok], i) => (
            <div key={tittel} className="pa-a21__rutine-row">
              <span className="pa-a21__rutine-dag">{dag.toUpperCase()}</span>
              <span className="pa-a21__rutine-text">{tittel}</span>

              {ok ? (
                <StatusPille tone="ok">Gjort denne uka</StatusPille>
              ) : (
                <Knapp
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setRutiner((prev) =>
                      prev.map((r, idx) =>
                        idx === i ? [r[0], r[1], r[2], true] : r
                      )
                    );
                    setBekreftelse(`Rutine markert som gjort: ${tittel}`);
                  }}
                >
                  Marker gjort
                </Knapp>
              )}
            </div>
          ))}
        </Kort>
      )}

      {/* Fane 4: Notion-arbeidsflate */}
      {aktivFane === "notion" && (
        <div className="pa-a21__notion-card" data-testid="ag21-notion">
          <Kort>
            <KortHode
              tittel="Notion-arbeidsflate"
              aside={`SIST SYNKET ${data.notion.synced}`}
            />
            <div style={{ fontSize: "16px", fontWeight: 600 }}>
              {data.notion.page}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              Prosjekter og oppgaver synkes begge veier hvert 15. minutt. Spillerdata
              synkes aldri til Notion.
            </p>
            <div className="pa-a21__actions">
              <Knapp
                variant="secondary"
                icon={ExternalLink}
                onClick={() =>
                  setBekreftelse("Åpner Notion i ny fane (simulert).")
                }
              >
                Åpne i Notion
              </Knapp>
              <Knapp
                variant="ghost"
                icon={RefreshCw}
                onClick={() =>
                  setBekreftelse("Synkroniserer prosjekter og oppgaver nå …")
                }
              >
                Synk nå
              </Knapp>
            </div>
          </Kort>
        </div>
      )}

      {/* Ark / Dialog for ny oppgave */}
      <Ark
        open={arkAapen}
        onClose={() => {
          setArkAapen(false);
          setFeilmelding(null);
        }}
        kicker="Ny oppgave"
        tittel="Legg til oppgave"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <Knapp fullWidth icon={Check} onClick={handleNyOppgave}>
              Legg til
            </Knapp>
            <Knapp
              variant="ghost"
              fullWidth
              onClick={() => {
                setArkAapen(false);
                setFeilmelding(null);
              }}
            >
              Avbryt
            </Knapp>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Felt label="Oppgave" error={feilmelding || undefined}>
            <TekstFelt
              value={skjema.t}
              onChange={(e) => {
                setSkjema({ ...skjema, t: e.target.value });
                setFeilmelding(null);
              }}
              placeholder="F.eks. Godkjenn ukeplan for Tobias"
              aria-label="Oppgavetekst"
            />
          </Felt>

          <Felt label="Prosjekt">
            <ValgFelt
              value={skjema.p}
              onChange={(e) => setSkjema({ ...skjema, p: e.target.value })}
              options={data.projects.map((p) => p[0])}
              aria-label="Velg prosjekt"
            />
          </Felt>

          <Felt label="Tildel til">
            <ValgFelt
              value={skjema.who}
              onChange={(e) => setSkjema({ ...skjema, who: e.target.value })}
              options={["Anders Kristiansen", "Kari Demo", "Per Demo"]}
              aria-label="Tildel til person"
            />
          </Felt>
        </div>
      </Ark>
    </div>
  );
}
