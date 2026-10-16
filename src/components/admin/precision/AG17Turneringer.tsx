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
  KnappLenke,
  LasterTilstand,
  Meta,
  Sidehode,
  StatusPille,
  TomTilstand,
} from "@/components/precision/pa";
import {
  Ark,
  Faner,
  Kort,
  KortHode,
  Nokkelverdi,
  Tabell,
  type Kolonne,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a17.css";

export type TurneringStatus = "Påmeldt" | "Åpen" | "Spilt";

/** Alle felt som ikke finnes i basen er null og vises som «—». Aldri oppdiktet. */
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

export function AG17Turneringer({
  tilstand = "data",
  data = TOM_DATA,
  startFane = "alle",
}: AG17TurneringerProps) {
  const [fane, setFane] = useState(startFane);
  const turneringer = data.tournaments;
  const dubletter = data.tDups;
  const [valgtId, setValgtId] = useState<string | null>(null);

  const erTom = tilstand === "tom";

  const synligeTurneringer = useMemo(() => {
    if (erTom) return [];
    if (fane === "mine") {
      return turneringer.filter((t) => (t.paameldte ?? 0) > 0);
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
      count: erTom ? undefined : turneringer.filter((t) => (t.paameldte ?? 0) > 0).length,
    },
    { value: "kart", label: "Kart" },
    { value: "dup", label: "Dubletter", count: erTom ? undefined : dubletter.length },
    { value: "ny", label: "Ny turnering" },
  ];

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
      render: (r) => r.course ?? "—",
    },
    {
      key: "mine",
      label: "Påmeldte",
      align: "right",
      mono: true,
      render: (r) => (r.paameldte != null && r.paameldte > 0 ? r.paameldte : "—"),
    },
    {
      key: "st",
      label: "Status",
      render: (r) => (r.st ? <StatusPille tone={r.st === "Spilt" ? "ok" : "neutral"}>{r.st}</StatusPille> : "—"),
    },
  ];

  /* Detaljpanel innhold */
  function renderDetaljPanel(turnering: TurneringRad) {
    return (
      <div className="pa-a17-detalj" aria-label={`Detaljer for ${turnering.name}`}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", justifyContent: "space-between" }}>
          <span style={{ font: "var(--type-title-s, 600 16px/1.3 var(--font-sans))", flex: "1 1 200px" }}>
            {turnering.name}
          </span>
          {turnering.st && (
            <StatusPille tone={turnering.st === "Spilt" ? "ok" : "neutral"}>{turnering.st}</StatusPille>
          )}
        </div>

        <Nokkelverdi
          items={[
            ["Dato", turnering.date],
            ["Bane", turnering.course ?? "—"],
            [
              "Påmeldte spillere",
              turnering.paameldte != null && turnering.paameldte > 0 ? String(turnering.paameldte) : "—",
            ],
          ]}
        />

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
    const medKoordinat = turneringer.filter(
      (t) =>
        t.lat != null && t.lon != null && t.lat >= la[0] && t.lat <= la[1] && t.lon >= lo[0] && t.lon <= lo[1],
    );

    return (
      <div className="pa-a17-layout">
        <Kort>
          <KortHode tittel="Kart · Sør-Norge" aside="SKJEMATISK · IKKE MÅLESTOKK" />
          <div className="pa-a17-kart-beholder" role="region" aria-label="Geografisk kart over turneringer i Sør-Norge">
            {medKoordinat.map((t) => {
              const x = (((t.lon as number) - lo[0]) / (lo[1] - lo[0])) * 100;
              const y = (1 - ((t.lat as number) - la[0]) / (la[1] - la[0])) * 100;
              const erValgt = t.id === valgtId;
              const harMine = (t.paameldte ?? 0) > 0;

              return (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`${t.name} på ${t.course ?? "ukjent bane"}`}
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

          {medKoordinat.length === 0 && (
            <Meta>INGEN TURNERINGER HAR KOORDINATER ENNÅ</Meta>
          )}

          <div className="pa-a17-kart-forklaring">
            <span className="pa-a17-kart-tegn">
              <span className="pa-a17-kart-prikk pa-a17-kart-prikk--mine" style={{ width: 10, height: 10 }} />
              <Meta>MED PÅMELDTE</Meta>
            </span>
            <span className="pa-a17-kart-tegn">
              <span className="pa-a17-kart-prikk pa-a17-kart-prikk--andre" style={{ width: 10, height: 10 }} />
              <Meta>INGEN PÅMELDTE</Meta>
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
          text="Manuelle oppføringer som ligner en turnering fra en kilde, vises her."
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
          </Kort>
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 44, alignItems: "center" }}>
          <KnappLenke href="/admin/tournaments/dubletter" icon={GitMerge}>
            Slå sammen i dubletter-lista
          </KnappLenke>
        </div>
      </div>
    );
  }

  /* Ny turnering rendering */
  function renderNyTurnering() {
    return (
      <Kort style={{ maxWidth: 640 }}>
        <KortHode tittel="Ny turnering" aside="/ADMIN/TOURNAMENTS/NY" />
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
          Turneringer legges inn i skjemaet for ny turnering. Det lagrer i basen.
        </p>
        <div style={{ paddingTop: 8 }}>
          <KnappLenke href="/admin/tournaments/ny" icon={Plus}>
            Åpne skjema for ny turnering
          </KnappLenke>
        </div>
      </Kort>
    );
  }

  return (
    <div className="pa-a17-side">
      {/* Topphode */}
      <Sidehode
        kicker="Turneringer"
        title="Turneringer"
        sub="Kun brutto score. Dato, bane og påmeldte står slik de ligger i basen."
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

      {/* Tilstandshåndtering */}
      {tilstand === "laster" && <LasterTilstand text="Henter turneringer …" />}

      {tilstand === "feil" && (
        <FeilTilstand
          icon={Calendar}
          title="Turneringene kunne ikke hentes"
          text="Prøv igjen om litt."
          code="TURNERINGER"
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
