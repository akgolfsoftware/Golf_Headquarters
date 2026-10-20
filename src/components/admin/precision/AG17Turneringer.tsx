"use client";

/**
 * Turneringer (AG-17) i nytt design: /admin/turnering (og /admin/turneringer).
 * Faner: Alle, Mine spillere, Kart (skjematisk, Sør-Norge), Dubletter og Ny turnering.
 * Tegning: canvaset «AgencyOS nøkkelskjermer», raden «Turnering, TrackMan og runder».
 * Alle felt som ikke finnes i basen er null og vises som «—». Aldri oppdiktet.
 */

import { useMemo, useState } from "react";
import { Feil, KnappLenke, Knapp, Laster, Nokkelverdier, Pille, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-turnering.css";

export type TurneringStatus = "Påmeldt" | "Åpen" | "Spilt";

export type TurneringRad = {
  id: string;
  name: string;
  date: string;
  course: string | null;
  /** Bare ekte koordinater fra turneringen; null = vises ikke på kartet. */
  lat: number | null;
  lon: number | null;
  /** Antall påmeldte fra stallen (basen), eller null når det ikke er kjent. */
  paameldte: number | null;
  st: TurneringStatus | null;
};

export type TurneringDublett = {
  id: string;
  match: string;
  a: { src: string; name: string; date: string; course: string };
  b: { src: string; name: string; date: string; course: string };
};

export type AG17Data = {
  tournaments: TurneringRad[];
  tDups: TurneringDublett[];
};

export type AG17Tilstand = "data" | "tom" | "laster" | "feil";

export type AG17TurneringerProps = {
  tilstand?: AG17Tilstand;
  data?: AG17Data;
  startFane?: string;
};

const TOM_DATA: AG17Data = { tournaments: [], tDups: [] };

type FaneId = "alle" | "mine" | "kart" | "dup" | "ny";
const FANER: FaneId[] = ["alle", "mine", "kart", "dup", "ny"];

/** Adressene bruker «mine-spillere» og «dubletter»; komponenten bruker «mine» og «dup». */
function normaliserFane(raw?: string): FaneId {
  if (raw === "mine-spillere") return "mine";
  if (raw === "dubletter") return "dup";
  return FANER.includes(raw as FaneId) ? (raw as FaneId) : "alle";
}

const INGRESS = "Kun brutto score. Dato, bane og påmeldte står slik de ligger i basen.";

export function AG17Turneringer({ tilstand = "data", data = TOM_DATA, startFane = "alle" }: AG17TurneringerProps) {
  const [fane, setFane] = useState<FaneId>(normaliserFane(startFane));
  const [valgtId, setValgtId] = useState<string | null>(null);
  const turneringer = data.tournaments;
  const dubletter = data.tDups;
  const erTom = tilstand === "tom";

  const synlige = useMemo(() => {
    if (erTom) return [];
    return fane === "mine" ? turneringer.filter((t) => (t.paameldte ?? 0) > 0) : turneringer;
  }, [turneringer, fane, erTom]);

  const aktiv = turneringer.find((t) => t.id === valgtId) ?? null;
  const mineAntall = turneringer.filter((t) => (t.paameldte ?? 0) > 0).length;

  const topp = (
    <Topp
      dato="Spillere · fra GolfBox og manuelt"
      tittel="Turneringer"
      ingress={INGRESS}
      handlinger={fane !== "ny" ? <Knapp onClick={() => setFane("ny")}>Ny turnering</Knapp> : undefined}
    />
  );

  if (tilstand === "laster") return <div className="agn-s">{topp}<Laster tekst="Henter turneringer …" /></div>;
  if (tilstand === "feil") {
    return (
      <div className="agn-s">
        {topp}
        <Feil tittel="Turneringene kunne ikke hentes" tekst="Prøv igjen om litt." kode="TURNERINGER" onProv={() => window.location.reload()} />
      </div>
    );
  }

  const navn: Record<FaneId, string> = {
    alle: erTom ? "Alle" : `Alle · ${turneringer.length}`,
    mine: erTom ? "Mine spillere" : `Mine spillere · ${mineAntall}`,
    kart: "Kart",
    dup: erTom ? "Dubletter" : `Dubletter · ${dubletter.length}`,
    ny: "Ny turnering",
  };

  const detalj = (t: TurneringRad) => (
    <Seksjon tittel={t.name} kilde={t.st ?? undefined}>
      <div className="kort" aria-label={`Detaljer for ${t.name}`}>
        <Nokkelverdier
          rader={[
            ["Dato", t.date],
            ["Bane", t.course ?? "—"],
            ["Påmeldte spillere", t.paameldte != null && t.paameldte > 0 ? String(t.paameldte) : "—"],
          ]}
        />
        <div className="knapper">
          <KnappLenke href={`/admin/tournaments/${t.id}`}>Åpne turneringen</KnappLenke>
          <Knapp variant="sek" onClick={() => setValgtId(null)}>Lukk</Knapp>
        </div>
      </div>
    </Seksjon>
  );

  const liste = (
    <Seksjon tittel="Turneringsliste" kilde="Brutto score">
      <div className="liste">
        {synlige.map((t) => (
          <button key={t.id} type="button" className="drift-rad" aria-pressed={valgtId === t.id} onClick={() => setValgtId(t.id)}>
            <span><b>{t.name}</b><span className="kilde">{t.date} · {t.course ?? "—"}</span></span>
            <span className="mono kilde">{t.paameldte != null && t.paameldte > 0 ? `${t.paameldte} påmeldt` : "—"}</span>
            {t.st ? <Pille tone={t.st === "Spilt" ? "ok" : "noy"}>{t.st}</Pille> : <span className="kilde">—</span>}
          </button>
        ))}
      </div>
    </Seksjon>
  );

  function kart() {
    const la = [58, 60.2];
    const lo = [7.6, 11.6];
    const medKoordinat = turneringer.filter((t) => t.lat != null && t.lon != null && t.lat >= la[0] && t.lat <= la[1] && t.lon >= lo[0] && t.lon <= lo[1]);
    return (
      <div className="to-del bred-v">
        <Seksjon tittel="Kart · Sør-Norge" kilde="Skjematisk, ikke målestokk">
          <div className="kort">
            <div className="tur-kart" role="region" aria-label="Geografisk kart over turneringer i Sør-Norge">
              {medKoordinat.map((t) => {
                const x = (((t.lon as number) - lo[0]) / (lo[1] - lo[0])) * 100;
                const y = (1 - ((t.lat as number) - la[0]) / (la[1] - la[0])) * 100;
                const harMine = (t.paameldte ?? 0) > 0;
                return (
                  <button key={t.id} type="button" aria-label={`${t.name} på ${t.course ?? "ukjent bane"}`} aria-pressed={t.id === valgtId} onClick={() => setValgtId(t.id)} className="tur-punkt" style={{ left: `calc(${x}% - 22px)`, top: `calc(${y}% - 22px)` }}>
                    <span className={harMine ? "tur-prikk mine" : "tur-prikk"} />
                  </button>
                );
              })}
            </div>
            {medKoordinat.length === 0 && <p className="kilde">Ingen turneringer har koordinater ennå.</p>}
            <p className="kilde"><span className="tur-prikk mine liten" /> Med påmeldte &nbsp; <span className="tur-prikk liten" /> Ingen påmeldte</p>
          </div>
        </Seksjon>
        {aktiv ? detalj(aktiv) : <div className="kort"><p className="forklar">Trykk på et punkt i kartet for å se detaljer om turneringen.</p></div>}
      </div>
    );
  }

  function dublettvisning() {
    if (!dubletter.length || erTom) {
      return <Tom tittel="Ingen dubletter" tekst="Manuelle oppføringer som ligner en turnering fra en kilde, vises her." />;
    }
    return (
      <div className="agn-s-stack">
        {dubletter.map((d) => (
          <Seksjon key={d.id} tittel="Mulig dublett" kilde={d.match}>
            <div className="kort tur-par">
              {(["a", "b"] as const).map((side) => (
                <div key={side}>
                  <span className="kilde mono">{side.toUpperCase()} · {d[side].src}</span>
                  <b className="undertittel">{d[side].name}</b>
                  <span className="kilde mono">{d[side].date} · {d[side].course}</span>
                </div>
              ))}
            </div>
          </Seksjon>
        ))}
        <div className="knapper"><KnappLenke href="/admin/tournaments/dubletter">Slå sammen i dubletter-lista</KnappLenke></div>
      </div>
    );
  }

  return (
    <div className="agn-s" data-testid="ag17-turneringer">
      {topp}

      <div className="teller-rad">
        <div className="teller"><span className="e">Turneringer</span><b className="t">{erTom ? "—" : turneringer.length}</b></div>
        <div className="teller"><span className="e">Med mine spillere</span><b className="t">{erTom ? "—" : mineAntall}</b></div>
        <div className="teller"><span className="e">Mulige dubletter</span><b className="t">{erTom ? "—" : dubletter.length}</b></div>
      </div>

      <nav className="valg" aria-label="Turneringer">
        {FANER.map((f) => <button key={f} type="button" aria-pressed={fane === f} onClick={() => { setFane(f); setValgtId(null); }}>{navn[f]}</button>)}
      </nav>

      {tilstand === "tom" && fane !== "ny" && fane !== "dup" && (
        <Tom tittel="Ingen turneringer" tekst="Legg inn en turnering, eller vent på nattlig henting fra GolfBox." handling={<Knapp onClick={() => setFane("ny")}>Ny turnering</Knapp>} />
      )}

      {tilstand === "data" && (
        <>
          {(fane === "alle" || fane === "mine") && (
            synlige.length === 0 ? (
              <Tom tittel="Ingen turneringer funnet" tekst={fane === "mine" ? "Ingen av spillerne dine er meldt på en turnering." : "Ingen turneringer registrert."} handling={<Knapp onClick={() => setFane("ny")}>Ny turnering</Knapp>} />
            ) : (
              <div className="to-del bred-v">
                {liste}
                {aktiv ? detalj(aktiv) : <span aria-hidden />}
              </div>
            )
          )}
          {fane === "kart" && kart()}
          {fane === "dup" && dublettvisning()}
        </>
      )}

      {tilstand === "tom" && fane === "dup" && dublettvisning()}

      {fane === "ny" && (
        <Seksjon tittel="Ny turnering" kilde="/admin/tournaments/ny">
          <div className="kort">
            <p className="forklar">Turneringer legges inn i skjemaet for ny turnering. Det lagrer i basen.</p>
            <div className="knapper"><KnappLenke href="/admin/tournaments/ny">Åpne skjema for ny turnering</KnappLenke></div>
          </div>
        </Seksjon>
      )}
    </div>
  );
}
