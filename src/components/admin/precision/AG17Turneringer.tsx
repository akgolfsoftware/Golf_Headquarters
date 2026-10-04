"use client";

/**
 * Precision Athletics — Turneringer (AG-17).
 *
 * Kilde: Claude Design AG-17 (arkiv/2026-09-30/agencyos/screens/AG-17.jsx).
 * Rute: /admin/turnering og /admin/turneringer.
 *
 * 5 faner:
 * 1. alle: Alle turneringer med DataTable og detaljpanel
 * 2. mine: Mine spillere
 * 3. kart: Skjematisk kart over Sør-Norge med interaktive prikker
 * 4. dup: Dubletter med sammenligning A vs B
 * 5. ny: Opprett turnering skjema med validering
 */

import { useState, useMemo } from "react";
import {
  Calendar,
  Check,
  GitMerge,
  Plus,
  Trophy,
  X,
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
  InlineVarsel,
  Kort,
  KortHode,
  Nokkelverdi,
  Tabell,
  TekstFelt,
  ValgFelt,
  type Kolonne,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a17.css";

export type TurneringStatus = "Påmeldt" | "Åpen" | "Spilt";

export type ResultatRad = {
  0: string; // Spiller
  1: string; // Runder
  2: string; // Brutto
  3: string; // Plass
};

export type TurneringRad = {
  id: string;
  name: string;
  date: string;
  course: string;
  place: string;
  lat: number;
  lon: number;
  level: string;
  mine: string[];
  st: TurneringStatus;
  result?: ResultatRad[];
};

export type TurneringDublett = {
  id: string;
  match: string;
  a: { src: string; name: string; date: string; course: string };
  b: { src: string; name: string; date: string; course: string };
};

export type DataGolfInfo = {
  src: string;
  rows: [string, string][];
};

export type AG17Data = {
  tournaments: TurneringRad[];
  tDups: TurneringDublett[];
  dg: DataGolfInfo;
};

export type AG17Tilstand = "data" | "tom" | "laster" | "feil";

export type AG17TurneringerProps = {
  tilstand?: AG17Tilstand;
  data?: AG17Data;
  startFane?: string;
  onOpprettTurnering?: (data: { name: string; date: string; course: string; level: string }) => void;
};

const BANER = [
  "Borregaard GK",
  "Fredrikstad GK",
  "Hvaler GK",
  "Onsøy GK",
  "Oslo GK",
  "Larvik GK",
  "Miklagard GK",
  "Stavanger GK",
];

const NIVAER = ["Klubb", "Regional", "Nasjonal", "Internasjonal"];

const STANDARD_DATA: AG17Data = {
  tournaments: [
    {
      id: "t-01",
      name: "Srixon Tour 5 — Borregaard",
      date: "20.09.2026",
      course: "Borregaard GK",
      place: "Sarpsborg",
      lat: 59.28,
      lon: 11.11,
      level: "Nasjonal",
      mine: ["Henrik Simonsen", "Kasper Thorsen"],
      st: "Spilt",
      result: [
        { 0: "Henrik Simonsen", 1: "71-69 (140)", 2: "-4", 3: "1" },
        { 0: "Kasper Thorsen", 1: "73-72 (145)", 2: "+1", 3: "T4" },
        { 0: "Magnus Berntsen", 1: "76-74 (150)", 2: "+6", 3: "12" },
      ],
    },
    {
      id: "t-02",
      name: "Garmin Norgescup 4",
      date: "03.10.2026",
      course: "Fredrikstad GK",
      place: "Fredrikstad",
      lat: 59.22,
      lon: 10.93,
      level: "Nasjonal",
      mine: ["Henrik Simonsen"],
      st: "Påmeldt",
    },
    {
      id: "t-03",
      name: "Klubbmesterskap Onsøy",
      date: "10.10.2026",
      course: "Onsøy GK",
      place: "Gressvik",
      lat: 59.25,
      lon: 10.82,
      level: "Klubb",
      mine: [],
      st: "Åpen",
    },
    {
      id: "t-04",
      name: "Titleist Tour Finale",
      date: "17.10.2026",
      course: "Larvik GK",
      place: "Larvik",
      lat: 59.05,
      lon: 10.03,
      level: "Nasjonal",
      mine: ["Kasper Thorsen"],
      st: "Påmeldt",
    },
    {
      id: "t-05",
      name: "Nordic Golf League Kvalik",
      date: "24.10.2026",
      course: "Miklagard GK",
      place: "Kløfta",
      lat: 60.07,
      lon: 11.14,
      level: "Internasjonal",
      mine: [],
      st: "Åpen",
    },
    {
      id: "t-06",
      name: "Vestfold Junior Open",
      date: "31.10.2026",
      course: "Hvaler GK",
      place: "Skjærhalden",
      lat: 59.03,
      lon: 11.02,
      level: "Regional",
      mine: ["Henrik Simonsen"],
      st: "Påmeldt",
    },
  ],
  tDups: [
    {
      id: "dup-1",
      match: "Høstpokalen 2026",
      a: {
        src: "GolfBox",
        name: "Høstpokalen Borregaard 2026",
        date: "17.10.2026",
        course: "Borregaard GK",
      },
      b: {
        src: "Manuell",
        name: "Høstpokalen",
        date: "17.10.2026",
        course: "Borregaard GK",
      },
    },
    {
      id: "dup-2",
      match: "Fredrikstad Juniorcup",
      a: {
        src: "GolfBox",
        name: "Fredrikstad Juniorcup — Runde 2",
        date: "24.10.2026",
        course: "Fredrikstad GK",
      },
      b: {
        src: "Manuell",
        name: "Juniorcup Fredrikstad",
        date: "24.10.2026",
        course: "Fredrikstad GK",
      },
    },
  ],
  dg: {
    src: "DATAGOLF_PREDICT_V1",
    rows: [
      ["Feltstyrke", "+1.42"],
      ["Vinn-sannsynlighet", "14.2 %"],
      ["Cut-grense", "+3"],
      ["Kvalifiseringskrav", "Topp 10"],
    ],
  },
};

export function AG17Turneringer({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "alle",
  onOpprettTurnering,
}: AG17TurneringerProps) {
  const [fane, setFane] = useState(startFane);
  const [turneringer, setTurneringer] = useState<TurneringRad[]>(data.tournaments);
  const [dubletter, setDubletter] = useState<TurneringDublett[]>(data.tDups);
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [varselTekst, setVarselTekst] = useState<{ tittel: string; meta?: string } | null>(null);

  // Ny turnering skjemastilstand
  const [nyNavn, setNyNavn] = useState("");
  const [nyDato, setNyDato] = useState("");
  const [nyBane, setNyBane] = useState(BANER[0]);
  const [nyNiva, setNyNiva] = useState(NIVAER[1]);
  const [feil, setFeil] = useState<{ navn?: string; dato?: string }>({});

  const erTom = tilstand === "tom";

  const synligeTurneringer = useMemo(() => {
    if (erTom) return [];
    if (fane === "mine") {
      return turneringer.filter((t) => t.mine.length > 0);
    }
    return turneringer;
  }, [turneringer, fane, erTom]);

  const aktivTurnering = useMemo(() => {
    if (!turneringer.length || !valgtId) return null;
    return turneringer.find((t) => t.id === valgtId) || null;
  }, [turneringer, valgtId]);

  const faner = [
    { value: "alle", label: "Alle", count: erTom ? undefined : turneringer.length },
    {
      value: "mine",
      label: "Mine spillere",
      count: erTom ? undefined : turneringer.filter((t) => t.mine.length > 0).length,
    },
    { value: "kart", label: "Kart" },
    { value: "dup", label: "Dubletter", count: erTom ? undefined : dubletter.length },
    { value: "ny", label: "Ny turnering" },
  ];

  /* Slå sammen dublett */
  function slaSammen(dupId: string, navn: string) {
    setDubletter((prev) => prev.filter((d) => d.id !== dupId));
    setVarselTekst({
      tittel: "Turneringene er slått sammen",
      meta: navn.toUpperCase(),
    });
  }

  /* Ikke dublett */
  function beholdBegge(dupId: string) {
    setDubletter((prev) => prev.filter((d) => d.id !== dupId));
    setVarselTekst({
      tittel: "Merket som ikke dublett",
      meta: "BEGGE BEHOLDES",
    });
  }

  /* Håndter oppretting av turnering */
  function opprettTurnering() {
    const nyeFeil: { navn?: string; dato?: string } = {};
    if (!nyNavn.trim()) {
      nyeFeil.navn = "Skriv navnet på turneringen.";
    }
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(nyDato.trim())) {
      nyeFeil.dato = "Skriv dato som DD.MM.ÅÅÅÅ, for eksempel 17.10.2026.";
    }

    setFeil(nyeFeil);
    if (Object.keys(nyeFeil).length > 0) return;

    const nyTurnering: TurneringRad = {
      id: `t-${Date.now()}`,
      name: nyNavn.trim(),
      date: nyDato.trim(),
      course: nyBane,
      place: "—",
      lat: 59.2,
      lon: 10.9,
      level: nyNiva,
      mine: [],
      st: "Åpen",
    };

    setTurneringer((prev) => [...prev, nyTurnering]);
    onOpprettTurnering?.({
      name: nyNavn.trim(),
      date: nyDato.trim(),
      course: nyBane,
      level: nyNiva,
    });

    setNyNavn("");
    setNyDato("");
    setFane("alle");
    setVarselTekst({
      tittel: "Turneringen er lagt til",
      meta: "SJEKKES MOT GOLFBOX I NATT",
    });
  }

  /* Kolonner for DataTable */
  const kolonner: Kolonne<TurneringRad>[] = [
    {
      key: "date",
      label: "Dato",
      mono: true,
      render: (r) => r.date,
    },
    {
      key: "name",
      label: "Turnering",
      render: (r) => (
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.name}</span>
      ),
    },
    {
      key: "course",
      label: "Bane",
      render: (r) => r.course,
    },
    {
      key: "level",
      label: "Nivå",
      render: (r) => r.level,
    },
    {
      key: "mine",
      label: "Mine spillere",
      align: "right",
      mono: true,
      render: (r) => (r.mine.length > 0 ? r.mine.length : null),
    },
    {
      key: "st",
      label: "Status",
      render: (r) => {
        const tone = r.st === "Spilt" ? "ok" : r.st === "Påmeldt" ? "signal" : "neutral";
        return <StatusPille tone={tone}>{r.st}</StatusPille>;
      },
    },
  ];

  /* Detaljpanel innhold */
  function renderDetaljPanel(turnering: TurneringRad) {
    const tone = turnering.st === "Spilt" ? "ok" : turnering.st === "Påmeldt" ? "signal" : "neutral";

    return (
      <div className="pa-a17-detalj" aria-label={`Detaljer for ${turnering.name}`}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", justifyContent: "space-between" }}>
          <span style={{ font: "var(--type-title-s, 600 16px/1.3 var(--font-sans))", flex: "1 1 200px" }}>
            {turnering.name}
          </span>
          <StatusPille tone={tone}>{turnering.st}</StatusPille>
        </div>

        <Nokkelverdi
          items={[
            ["Dato", turnering.date],
            ["Bane", `${turnering.course} · ${turnering.place}`],
            ["Nivå", turnering.level],
            ["Mine spillere", turnering.mine.length ? turnering.mine.join(", ") : "Ingen påmeldt"],
          ]}
        />

        {turnering.result && turnering.result.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Meta>RESULTAT · BRUTTO · GOLFBOX · {turnering.date}</Meta>
            <table className="pa-table" style={{ width: "100%", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Spiller</th>
                  <th style={{ textAlign: "left" }} className="is-mono">Runder</th>
                  <th style={{ textAlign: "right" }} className="is-mono">Brutto</th>
                  <th style={{ textAlign: "right" }} className="is-mono">Plass</th>
                </tr>
              </thead>
              <tbody>
                {turnering.result.map((res, i) => (
                  <tr key={i}>
                    <td>{res[0]}</td>
                    <td className="is-mono">{res[1]}</td>
                    <td className="is-mono" style={{ textAlign: "right" }}>{res[2]}</td>
                    <td className="is-mono" style={{ textAlign: "right", fontWeight: 600 }}>{res[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {turnering.result && (
          <div className="pa-a17-dg-boks">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <Meta>BARE SYNLIG FOR ANDERS KRISTIANSEN</Meta>
              <span className="pa-a17-dg-badge">Powered by Data Golf</span>
            </div>
            <Nokkelverdi items={data.dg.rows.map(([k, v]) => [k, v, data.dg.src])} kolonner={2} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
          <Knapp variant="ghost" size="sm" onClick={() => setValgtId(null)} icon={X}>
            Lukk
          </Knapp>
        </div>
      </div>
    );
  }

  /* Kart rendering */
  function renderKart() {
    const la = [58, 60.2];
    const lo = [7.6, 11.6];

    return (
      <div className="pa-a17-layout">
        <Kort>
          <KortHode tittel="Kart · Sør-Norge" aside="SKJEMATISK · IKKE MÅLESTOKK" />
          <div className="pa-a17-kart-beholder" role="region" aria-label="Geografisk kart over turneringer i Sør-Norge">
            {turneringer.map((t) => {
              const x = ((t.lon - lo[0]) / (lo[1] - lo[0])) * 100;
              const y = (1 - (t.lat - la[0]) / (la[1] - la[0])) * 100;
              const erValgt = t.id === valgtId;
              const harMine = t.mine.length > 0;

              return (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`${t.name} på ${t.course}`}
                  aria-pressed={erValgt}
                  onClick={() => setValgtId(t.id)}
                  className="pa-a17-kart-punkt"
                  style={{
                    left: `calc(${x}% - 22px)`,
                    top: `calc(${y}% - 22px)`,
                  }}
                >
                  <span
                    className={`pa-a17-kart-prikk ${harMine ? "pa-a17-kart-prikk--mine" : "pa-a17-kart-prikk--andre"}`}
                    style={{
                      width: erValgt ? 16 : 12,
                      height: erValgt ? 16 : 12,
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div className="pa-a17-kart-forklaring">
            <span className="pa-a17-kart-tegn">
              <span className="pa-a17-kart-prikk pa-a17-kart-prikk--mine" style={{ width: 10, height: 10 }} />
              <Meta>MINE SPILLERE</Meta>
            </span>
            <span className="pa-a17-kart-tegn">
              <span className="pa-a17-kart-prikk pa-a17-kart-prikk--andre" style={{ width: 10, height: 10 }} />
              <Meta>INGEN AV MINE</Meta>
            </span>
          </div>
        </Kort>

        {aktivTurnering ? (
          renderDetaljPanel(aktivTurnering)
        ) : (
          <Kort>
            <p style={{ margin: 0, font: "var(--type-body-s, 14px/1.4 var(--font-sans))", color: "var(--text-secondary)" }}>
              Trykk på et punkt i kartet for å se detaljer om turneringen.
            </p>
          </Kort>
        )}
      </div>
    );
  }

  /* Dubletter rendering */
  function renderDubletter() {
    if (!dubletter.length || erTom) {
      return (
        <TomTilstand
          icon={Check}
          title="Ingen dubletter"
          text="Turneringer fra GolfBox og manuelle oppføringer sammenlignes hver natt."
        />
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dubletter.map((d) => (
          <Kort key={d.id}>
            <KortHode tittel="Mulig dublett" aside={d.match.toUpperCase()} />
            <div className="pa-a17-dup-par">
              {(["a", "b"] as const).map((side) => (
                <div key={side} className="pa-a17-dup-boks">
                  <Meta>{side.toUpperCase()} · {d[side].src.toUpperCase()}</Meta>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{d[side].name}</span>
                  <span style={{ font: "var(--type-num-s, 13px tabular-nums)" }}>
                    {d[side].date} · {d[side].course}
                  </span>
                </div>
              ))}
            </div>

            <Meta>A BEHOLDES SOM HOVEDOPPFØRING · PÅMELDINGER FRA BEGGE FLYTTES</Meta>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 44, alignItems: "center" }}>
              <Knapp
                variant="primary"
                size="sm"
                icon={GitMerge}
                onClick={() => slaSammen(d.id, d.a.name)}
                style={{ minHeight: 44, minWidth: 44 }}
              >
                Slå sammen
              </Knapp>
              <Knapp
                variant="ghost"
                size="sm"
                onClick={() => beholdBegge(d.id)}
                style={{ minHeight: 44, minWidth: 44 }}
              >
                Ikke dublett
              </Knapp>
            </div>
          </Kort>
        ))}
      </div>
    );
  }

  /* Ny turnering rendering */
  function renderNyTurnering() {
    return (
      <Kort style={{ maxWidth: 640 }}>
        <KortHode tittel="Ny turnering" aside="/ADMIN/TURNERINGER/NY" />

        {Object.keys(feil).length > 0 && (
          <InlineVarsel tone="warn" tittel="Turneringen er ikke lagret">
            Rett feltene under.
          </InlineVarsel>
        )}

        <Felt label="Navn" hint="Navnet på turneringen" error={feil.navn}>
          <TekstFelt
            value={nyNavn}
            onChange={(e) => setNyNavn(e.target.value)}
            placeholder="Høstpokalen"
            style={{ minHeight: 44 }}
          />
        </Felt>

        <Felt label="Dato" hint="DD.MM.ÅÅÅÅ" error={feil.dato}>
          <TekstFelt
            value={nyDato}
            onChange={(e) => setNyDato(e.target.value)}
            placeholder="17.10.2026"
            style={{ minHeight: 44, fontVariantNumeric: "tabular-nums" }}
          />
        </Felt>

        <Felt label="Bane">
          <ValgFelt
            value={nyBane}
            onChange={(e) => setNyBane(e.target.value)}
            options={BANER}
            style={{ minHeight: 44 }}
          />
        </Felt>

        <Felt label="Nivå">
          <ValgFelt
            value={nyNiva}
            onChange={(e) => setNyNiva(e.target.value)}
            options={NIVAER}
            style={{ minHeight: 44 }}
          />
        </Felt>

        <div style={{ paddingTop: 8 }}>
          <Knapp
            variant="primary"
            icon={Check}
            onClick={opprettTurnering}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            Legg til turnering
          </Knapp>
        </div>
      </Kort>
    );
  }

  return (
    <div className="pa-a17-side">
      {/* Topphode */}
      <Sidehode
        kicker="Turneringer · høst 2026"
        title="Turneringer"
        sub="Kun brutto score. Resultater hentes fra GolfBox."
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Faner faner={faner} value={fane} onChange={(v) => { setFane(v); setValgtId(null); }} />
        {fane !== "ny" && (
          <Knapp
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setFane("ny")}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            Ny turnering
          </Knapp>
        )}
      </div>

      {varselTekst && (
        <InlineVarsel tone="ok" tittel={varselTekst.tittel}>
          {varselTekst.meta}
        </InlineVarsel>
      )}

      {/* Tilstandshåndtering */}
      {tilstand === "laster" && <LasterTilstand text="Henter turneringer …" />}

      {tilstand === "feil" && (
        <FeilTilstand
          icon={Calendar}
          title="Turneringene kunne ikke hentes"
          text="GolfBox svarer ikke. Påmeldinger du har gjort er lagret."
          code="GOLFBOX · 504"
          retry={<Knapp variant="secondary" onClick={() => window.location.reload()}>Prøv igjen</Knapp>}
        />
      )}

      {tilstand === "tom" && fane !== "ny" && fane !== "dup" && (
        <TomTilstand
          icon={Trophy}
          title="Ingen turneringer"
          text="Legg inn en turnering, eller vent på nattlig henting fra GolfBox."
          actions={
            <Knapp variant="primary" icon={Plus} onClick={() => setFane("ny")} style={{ minHeight: 44, minWidth: 44 }}>
              Ny turnering
            </Knapp>
          }
        />
      )}

      {tilstand === "data" && (
        <>
          {(fane === "alle" || fane === "mine") && (
            synligeTurneringer.length === 0 ? (
              <TomTilstand
                icon={Trophy}
                title="Ingen turneringer funnet"
                text={fane === "mine" ? "Ingen av spillerne dine er meldt på en turnering." : "Ingen turneringer registrert."}
                actions={
                  <Knapp variant="primary" icon={Plus} onClick={() => setFane("ny")} style={{ minHeight: 44, minWidth: 44 }}>
                    Ny turnering
                  </Knapp>
                }
              />
            ) : (
              <div className="pa-a17-layout">
                <div>
                  <Tabell
                    caption="Turneringsliste · Brutto score"
                    columns={kolonner}
                    rows={synligeTurneringer}
                    selected={valgtId}
                    onSelect={(r) => setValgtId(r.id)}
                  />
                </div>
                {aktivTurnering && (
                  <div className="pa-desktop-only">
                    {renderDetaljPanel(aktivTurnering)}
                  </div>
                )}
              </div>
            )
          )}

          {fane === "kart" && renderKart()}
          {fane === "dup" && renderDubletter()}
          {fane === "ny" && renderNyTurnering()}
        </>
      )}

      {/* Mobil Ark / Sheet for detaljvisning */}
      {aktivTurnering && (
        <div className="pa-mobile-only">
          <Ark
            open={!!aktivTurnering}
            onClose={() => setValgtId(null)}
            kicker="Turnering"
            tittel={aktivTurnering.name}
          >
            {renderDetaljPanel(aktivTurnering)}
          </Ark>
        </div>
      )}
    </div>
  );
}
