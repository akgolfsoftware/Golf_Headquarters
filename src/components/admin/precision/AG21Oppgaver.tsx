"use client";

/**
 * Oppgaver og rutiner (AG-21) i nytt design: /admin/oppgaver.
 * Oppgaver og prosjekter har Notion som eneste kilde. Inntil koblingen er på plass
 * vises tom tilstand; ingenting lages i skjermen, og ingen tall er oppdiktet.
 * Tegning: canvaset «AgencyOS nøkkelskjermer», raden «Kø, oppgaver, innsikt, Jarvis …».
 */

import { useState } from "react";
import { Feil, KnappLenke, Laster, Nokkelverdier, Pille, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-liste.css";

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
const INGRESS = "Prosjekter og oppgaver kommer fra Notion, som er eneste kilde. Her kan du bare lese.";

type FaneId = "mine" | "prosj" | "rutiner" | "notion";
const FANER: FaneId[] = ["mine", "prosj", "rutiner", "notion"];

export function AG21Oppgaver({ tilstand = "data", data = TOM_DATA, startFane = "mine" }: AG21OppgaverProps) {
  const [aktivFane, setAktivFane] = useState<FaneId>(FANER.includes(startFane as FaneId) ? (startFane as FaneId) : "mine");
  const topp = <Topp dato="Daglig · fra Notion" tittel="Oppgaver" ingress={INGRESS} />;

  if (tilstand === "laster") return <div className="agn-s" data-testid="ag21-laster">{topp}<Laster tekst="Henter oppgaver …" /></div>;
  if (tilstand === "feil") return <div className="agn-s" data-testid="ag21-feil">{topp}<Feil tittel="Oppgavene kunne ikke hentes" tekst="Prøv igjen om litt." kode="OPPGAVER" /></div>;

  const mine = tilstand === "tom" ? [] : data.mine;
  const prosjekter = tilstand === "tom" ? [] : data.projects;
  const rutiner = tilstand === "tom" ? [] : data.routines;
  const uferdige = mine.filter((x) => !x.done).length;

  const navn: Record<FaneId, string> = {
    mine: uferdige > 0 ? `Mine oppgaver · ${uferdige}` : "Mine oppgaver",
    prosj: "Prosjekter",
    rutiner: "Rutiner",
    notion: "Notion",
  };

  const ikkeKoblet = (
    <Tom
      tittel="Ingen oppgaver å vise"
      tekst="Oppgaver vises her når Notion er koblet til. Ingenting er lagt inn av Jarvis eller lagd i skjermen."
      handling={<KnappLenke href="/admin/workspace/notion">Åpne Notion-oppsett</KnappLenke>}
    />
  );

  return (
    <div className="agn-s" data-testid="ag21-oppgaver">
      {topp}

      <div className="teller-rad">
        <div className="teller"><span className="e">Åpne oppgaver</span><b className="t">{tilstand === "tom" ? "—" : uferdige}</b><span className="s">{data.notion ? "Fra Notion" : "Notion er ikke koblet"}</span></div>
        <div className="teller"><span className="e">Prosjekter</span><b className="t">{tilstand === "tom" ? "—" : prosjekter.length}</b></div>
        <div className="teller"><span className="e">Rutiner</span><b className="t">{tilstand === "tom" ? "—" : rutiner.length}</b></div>
      </div>

      <nav className="valg" aria-label="Oppgaver">
        {FANER.map((f) => <button key={f} type="button" aria-pressed={aktivFane === f} onClick={() => setAktivFane(f)}>{navn[f]}</button>)}
      </nav>

      {aktivFane === "mine" && (mine.length === 0 ? ikkeKoblet : (
        <Seksjon tittel="Mine oppgaver" kilde="Fra Notion">
          <div className="liste">
            {mine.map((o) => (
              <div key={o.id} className="drift-rad" style={o.done ? { opacity: 0.6 } : undefined}>
                <span><b>{o.t}</b><span className="kilde">{o.p} · fra {o.by}</span></span>
                <span aria-hidden />
                <span className="mono kilde">Frist {o.due}</span>
              </div>
            ))}
          </div>
        </Seksjon>
      ))}

      {aktivFane === "prosj" && (prosjekter.length === 0 ? ikkeKoblet : (
        <Seksjon tittel="Prosjekter" kilde="Fra Notion">
          <div className="liste" data-testid="ag21-prosjekter">
            {prosjekter.map(([pnavn, tot, ferdig, frist]) => {
              const prosent = tot > 0 ? Math.round((ferdig / tot) * 100) : 0;
              return (
                <div key={pnavn} className="drift-rad">
                  <span><b>{pnavn}</b><span className="kilde">{ferdig} av {tot} ferdig · frist {frist}</span></span>
                  <span aria-hidden />
                  <span className="mono"><b>{prosent} %</b></span>
                </div>
              );
            })}
          </div>
        </Seksjon>
      ))}

      {aktivFane === "rutiner" && (rutiner.length === 0 ? (
        <Tom tittel="Ingen rutiner" tekst="Faste rutiner vises her når de er lagt inn." />
      ) : (
        <Seksjon tittel="Rutiner">
          <div className="liste" data-testid="ag21-rutiner">
            {rutiner.map(([dag, tittel, , ok]) => (
              <div key={tittel} className="drift-rad">
                <span><b>{tittel}</b><span className="kilde">{dag}</span></span>
                <span aria-hidden />
                <Pille tone={ok ? "ok" : "vent"}>{ok ? "Gjort denne uka" : "Ikke gjort"}</Pille>
              </div>
            ))}
          </div>
        </Seksjon>
      ))}

      {aktivFane === "notion" && (
        <div data-testid="ag21-notion">
          <Seksjon tittel="Notion" kilde={data.notion ? `Sist synket ${data.notion.synced}` : "Ikke koblet"}>
            <div className="kort">
              <Nokkelverdier rader={[
                ["Status", data.notion ? "Koblet" : "Ikke koblet"],
                ["Siste synk", data.notion?.synced ?? "—"],
                ["Side", data.notion?.page ?? "—"],
              ]} />
              <div className="knapper"><KnappLenke href="/admin/workspace/notion">Åpne Notion-oppsett</KnappLenke></div>
            </div>
          </Seksjon>
        </div>
      )}
    </div>
  );
}
