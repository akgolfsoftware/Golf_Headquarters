"use client";

/**
 * Precision Athletics — Drift (AG-24).
 *
 * Kilde: Claude Design AG-24 (designsystem/precision-athletics/ui_kits/agencyos/screens/AG-24.jsx).
 * Ruter: /admin/drift, /admin/audit-log, /admin/feillogg, /admin/gdpr, /admin/hjelp.
 *
 * 4 faner:
 * 1. gdpr: Sletteforespørsler (GDPR art. 17, innsynskopi, sletting med SLETT-bekreftelse)
 * 2. audit: Revisjonslogg (siste 7 dager)
 * 3. feil: Feillogg (siste 7 dager med feilnivå)
 * 4. hjelp: Hjelp og vanlige spørsmål (FAQ med utfellbare detaljer)
 */

import { useState } from "react";
import {
  AlertTriangle,
  Download,
  List,
  ShieldCheck,
  Trash2,
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
  Nokkelverdi,
  Tabell,
  TekstFelt,
  type Kolonne,
} from "@/components/precision/pa-a5";
import "@/styles/precision-a24.css";

export type GdprForesporsel = {
  id: string;
  who: string;
  role: string;
  by: string;
  at: string;
  due: string;
  scope: string;
  st: "Venter" | "Slettet";
  doneAt?: string;
};

export type AuditHendelse = {
  id: string;
  t: string;
  who: string;
  what: string;
  obj: string;
};

export type FeilloggRad = {
  id: string;
  t: string;
  lvl: "Feil" | "Advarsel" | "Info";
  where: string;
  msg: string;
  n: number;
};

export type AG24Data = {
  gdpr: GdprForesporsel[];
  audit: AuditHendelse[];
  errors: FeilloggRad[];
  faq: [string, string][];
};

export type AG24Tilstand = "data" | "tom" | "laster" | "feil";

export type AG24DriftProps = {
  tilstand?: AG24Tilstand;
  data?: AG24Data;
  startFane?: string;
  onSlettData?: (id: string) => void;
};

const STANDARD_DATA: AG24Data = {
  gdpr: [
    {
      id: "g1",
      who: "Mia Fjell",
      role: "Spiller · født 2012",
      by: "Forelder · Siv Fjell",
      at: "22.09.2026",
      due: "22.10.2026",
      scope: "All spillerdata, video og testresultater",
      st: "Venter",
    },
    {
      id: "g2",
      who: "Tidligere spiller",
      role: "Spiller · født 2006",
      by: "Spilleren selv",
      at: "02.09.2026",
      due: "02.10.2026",
      scope: "Profil og meldinger. Faktura beholdes i 5 år (bokføringsloven).",
      st: "Venter",
    },
  ],
  audit: [
    { id: "a1", t: "26.09 14:06", who: "Anders Kristiansen", what: "Lagret notat · øktark O13", obj: "Tobias Lindvik" },
    { id: "a2", t: "26.09 13:48", who: "Belastningsagent", what: "Laget utkast · hviledag 01.10", obj: "Tobias Lindvik" },
    { id: "a3", t: "26.09 11:42", who: "Hanne Lindvik", what: "Signerte samtykke · videoanalyse", obj: "Tobias Lindvik" },
    { id: "a4", t: "26.09 08:40", who: "Anders Kristiansen", what: "Godkjente ny tid · privattime", obj: "Jonas Lie" },
    { id: "a5", t: "25.09 20:05", who: "Anders Kristiansen", what: "Endret tjeneste · Privattime 30 min", obj: "ServiceType pt30" },
  ],
  errors: [
    { id: "e1", t: "26.09 06:00", lvl: "Feil", where: "Rapportagent", msg: "Mal mangler felt {{plan.timer}} for 3 spillere", n: 3 },
    { id: "e2", t: "25.09 16:52", lvl: "Advarsel", where: "TrackMan API", msg: "Tidsavbrudd etter 30 s · hentet på nytt 16:53", n: 1 },
    { id: "e3", t: "24.09 23:00", lvl: "Advarsel", where: "Tripletex-eksport", msg: "Avdeling GFGK mangler i eksporten", n: 1 },
  ],
  faq: [
    [
      "Hvordan godkjenner jeg et utkast fra Jarvis?",
      "Åpne Kø eller Caddie, les utkastet og trykk Godkjenn. Ingenting sendes før du godkjenner.",
    ],
    [
      "Hvordan slettes en spiller?",
      "Via sletteforespørsel her i Drift. Faktura beholdes i 5 år etter bokføringsloven.",
    ],
    [
      "Hvem ser økonomitallene?",
      "Bare admin. Tallene leses fra Tripletex-eksporten.",
    ],
  ],
};

export function AG24Drift({
  tilstand = "data",
  data = STANDARD_DATA,
  startFane = "gdpr",
  onSlettData,
}: AG24DriftProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const [foresporsler, setForesporsler] = useState<GdprForesporsel[]>(
    tilstand === "tom" ? [] : data.gdpr
  );
  const [sletteKandidat, setSletteKandidat] = useState<GdprForesporsel | null>(
    null
  );
  const [bekreftTekst, setBekreftTekst] = useState("");
  const [statusMelding, setStatusMelding] = useState<string | null>(null);

  if (tilstand === "laster") {
    return (
      <div className="pa-a24" data-testid="ag24-laster">
        <Sidehode
          kicker="Drift · kun admin"
          title="Drift"
          sub="Revisjonslogg, feillogg, sletteforespørsler og hjelp. Bare synlig for admin."
        />
        <LasterTilstand text="Henter driftsdata …" />
      </div>
    );
  }

  if (tilstand === "feil") {
    return (
      <div className="pa-a24" data-testid="ag24-feil">
        <Sidehode
          kicker="Drift · kun admin"
          title="Drift"
          sub="Revisjonslogg, feillogg, sletteforespørsler og hjelp. Bare synlig for admin."
        />
        <FeilTilstand
          icon={AlertTriangle}
          title="Driftsdata kunne ikke hentes"
          text="Ingen data er slettet eller endret."
          code="FEIL 503 · DRIFT"
        />
      </div>
    );
  }

  const ubehandledeGdpr = foresporsler.filter((g) => g.st !== "Slettet").length;

  const handleSlett = () => {
    if (!sletteKandidat) return;
    const g = sletteKandidat;
    setForesporsler((prev) =>
      prev.map((x) =>
        x.id === g.id
          ? {
              ...x,
              st: "Slettet",
              doneAt: "26.09.2026 14:00",
            }
          : x
      )
    );
    setStatusMelding(
      `Dataene er slettet: ${g.who} · KVITTERING SOM UTKAST TIL ${g.by.toUpperCase()}`
    );
    onSlettData?.(g.id);
    setSletteKandidat(null);
    setBekreftTekst("");
  };

  const faner = [
    {
      value: "gdpr",
      label: "Sletteforespørsler",
      count: ubehandledeGdpr > 0 ? ubehandledeGdpr : undefined,
    },
    { value: "audit", label: "Revisjonslogg" },
    { value: "feil", label: "Feillogg" },
    { value: "hjelp", label: "Hjelp" },
  ];

  const auditKolonner: Kolonne<AuditHendelse>[] = [
    { key: "t", label: "Tid", render: (r) => r.t, mono: true, lead: true },
    { key: "who", label: "Hvem", render: (r) => r.who },
    { key: "what", label: "Hva", render: (r) => r.what },
    { key: "obj", label: "Gjelder", render: (r) => r.obj },
  ];

  const feilKolonner: Kolonne<FeilloggRad>[] = [
    { key: "t", label: "Tid", render: (r) => r.t, mono: true, lead: true },
    {
      key: "lvl",
      label: "Nivå",
      render: (r) => (
        <StatusPille tone={r.lvl === "Feil" ? "warn" : "neutral"}>
          {r.lvl}
        </StatusPille>
      ),
    },
    { key: "where", label: "Hvor", render: (r) => r.where },
    { key: "msg", label: "Melding", render: (r) => r.msg },
    {
      key: "n",
      label: "Antall",
      render: (r) => String(r.n),
      mono: true,
      align: "right",
    },
  ];

  return (
    <div className="pa-a24" data-testid="ag24-drift">
      <Sidehode
        kicker="Drift · kun admin"
        title="Drift"
        sub="Revisjonslogg, feillogg, sletteforespørsler og hjelp. Bare synlig for admin."
      />

      <Faner faner={faner} value={aktivFane} onChange={setAktivFane} />

      {statusMelding && (
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
          <span>{statusMelding}</span>
          <Knapp
            variant="ghost"
            size="sm"
            onClick={() => setStatusMelding(null)}
            aria-label="Lukk varsel"
          >
            Lukk
          </Knapp>
        </div>
      )}

      {/* Fane 1: Sletteforespørsler (GDPR) */}
      {aktivFane === "gdpr" && (
        <div data-testid="ag24-fane-gdpr">
          {foresporsler.length === 0 ? (
            <TomTilstand
              icon={ShieldCheck}
              title="Ingen sletteforespørsler"
              text="Forespørsler fra spillere og foreldre kommer hit. Fristen er 30 dager."
            />
          ) : (
            <div className="pa-a24__stack">
              {foresporsler.map((g) => (
                <Kort key={g.id}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "baseline",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "15px",
                        fontWeight: 600,
                        flex: "1 1 200px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {g.who}
                    </span>
                    <StatusPille tone={g.st === "Slettet" ? "ok" : "neutral"}>
                      {g.st}
                    </StatusPille>
                  </div>

                  <Nokkelverdi
                    items={[
                      ["Hvem", g.role, undefined],
                      ["Bedt om av", g.by, undefined],
                      ["Mottatt", g.at, undefined],
                      ["Frist", g.due, "30 DAGER · GDPR ART. 17"],
                      ["Omfang", g.scope, undefined],
                      ...(g.doneAt ? [["Slettet", g.doneAt, undefined] as const] : []),
                    ]}
                  />

                  {g.st !== "Slettet" && (
                    <div className="pa-a24__actions">
                      <Knapp
                        variant="secondary"
                        icon={Download}
                        onClick={() =>
                          setStatusMelding(
                            "Innsynskopi laget · ZIP · SENDES SOM UTKAST"
                          )
                        }
                      >
                        Lag innsynskopi først
                      </Knapp>
                      <Knapp
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => {
                          setSletteKandidat(g);
                          setBekreftTekst("");
                        }}
                      >
                        Slett data
                      </Knapp>
                    </div>
                  )}
                </Kort>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fane 2: Revisjonslogg */}
      {aktivFane === "audit" && (
        <div data-testid="ag24-fane-audit">
          {tilstand === "tom" ? (
            <TomTilstand
              icon={List}
              title="Ingen hendelser"
              text="Loggen er tom for de siste 7 dagene."
            />
          ) : (
            <Tabell
              caption="Revisjonslogg · siste 7 dager"
              columns={auditKolonner}
              rows={data.audit}
              tomTekst="Ingen revisjonshendelser logget."
            />
          )}
        </div>
      )}

      {/* Fane 3: Feillogg */}
      {aktivFane === "feil" && (
        <div data-testid="ag24-fane-feil">
          {tilstand === "tom" ? (
            <TomTilstand
              icon={AlertTriangle}
              title="Ingen feil"
              text="Ingen feil eller advarsler er registrert de siste 7 dagene."
            />
          ) : (
            <Tabell
              caption="Feillogg · siste 7 dager"
              columns={feilKolonner}
              rows={data.errors}
              tomTekst="Ingen feil eller advarsler registrert."
            />
          )}
        </div>
      )}

      {/* Fane 4: Hjelp */}
      {aktivFane === "hjelp" && (
        <div className="pa-a24__card" data-testid="ag24-fane-hjelp">
          <Kort>
            {data.faq.map(([sporsmaal, svar], i) => (
              <details key={i} className="pa-a24__faq-details">
                <summary className="pa-a24__faq-summary">{sporsmaal}</summary>
                <p className="pa-a24__faq-text">{svar}</p>
              </details>
            ))}
            <div style={{ paddingTop: 8 }}>
              <Meta>KONTAKT · DRIFT@DEMO.NO</Meta>
            </div>
          </Kort>
        </div>
      )}

      {/* Slettedialog */}
      <Ark
        open={Boolean(sletteKandidat)}
        onClose={() => {
          setSletteKandidat(null);
          setBekreftTekst("");
        }}
        kicker="GDPR Art. 17"
        tittel="Slette alle data?"
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
            }}
          >
            <Knapp
              variant="signal"
              fullWidth
              disabled={bekreftTekst.trim().toUpperCase() !== "SLETT"}
              onClick={handleSlett}
            >
              Slett permanent
            </Knapp>
            <Knapp
              variant="ghost"
              fullWidth
              onClick={() => {
                setSletteKandidat(null);
                setBekreftTekst("");
              }}
            >
              Avbryt
            </Knapp>
          </div>
        }
      >
        {sletteKandidat && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.45,
                color: "var(--text-primary)",
              }}
            >
              {sletteKandidat.scope} for {sletteKandidat.who} slettes permanent.
              Dette kan ikke angres.
            </p>

            <Felt label="Skriv SLETT for å bekrefte">
              <TekstFelt
                value={bekreftTekst}
                onChange={(e) => setBekreftTekst(e.target.value)}
                placeholder="SLETT"
                aria-label="Bekreftelse med SLETT"
              />
            </Felt>
          </div>
        )}
      </Ark>
    </div>
  );
}
