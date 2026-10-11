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

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  st: "Venter" | "Godkjent" | "Slettet";
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
};

type Handlingsresultat = { ok: true } | { ok: false; feil: string };

export type AG24Tilstand = "data" | "tom" | "laster" | "feil";

export type AG24DriftProps = {
  tilstand?: AG24Tilstand;
  data?: AG24Data;
  startFane?: string;
  /** Steg 1: godkjenn forespørselen (server action). */
  onGodkjenn?: (id: string) => Promise<Handlingsresultat>;
  /** Steg 2: utfør anonymiseringen (server action). */
  onSlettData?: (id: string) => Promise<Handlingsresultat>;
};

const TOM_DATA: AG24Data = { gdpr: [], audit: [], errors: [] };

const FAQ: [string, string][] = [
  [
    "Hvordan godkjenner jeg et utkast fra Jarvis?",
    "Åpne Kø, les utkastet og trykk Godkjenn. Ingenting sendes før du godkjenner.",
  ],
  [
    "Hvordan slettes en spiller?",
    "Via sletteforespørsel her i Drift: godkjenn forespørselen først, deretter slett data. Faktura beholdes i 5 år etter bokføringsloven.",
  ],
  [
    "Hvem ser økonomitallene?",
    "Bare head coach. Tallene leses fra Tripletex-eksporten.",
  ],
];

export function AG24Drift({
  tilstand = "data",
  data = TOM_DATA,
  startFane = "gdpr",
  onGodkjenn,
  onSlettData,
}: AG24DriftProps) {
  const [aktivFane, setAktivFane] = useState(startFane);
  const router = useRouter();
  const [venter, startTransition] = useTransition();
  const foresporsler = tilstand === "tom" ? [] : data.gdpr;
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
          code="DRIFT"
        />
      </div>
    );
  }

  const ubehandledeGdpr = foresporsler.filter((g) => g.st !== "Slettet").length;

  const kjor = (
    handling: ((id: string) => Promise<Handlingsresultat>) | undefined,
    id: string,
    suksess: string,
    etterpaa?: () => void,
  ) => {
    if (!handling) return;
    startTransition(async () => {
      const r = await handling(id);
      if (r.ok) {
        setStatusMelding(suksess);
        etterpaa?.();
        router.refresh();
      } else {
        setStatusMelding(`Ikke utført: ${r.feil}`);
      }
    });
  };

  const handleSlett = () => {
    if (!sletteKandidat) return;
    const g = sletteKandidat;
    kjor(onSlettData, g.id, `Dataene er slettet: ${g.who}`, () => {
      setSletteKandidat(null);
      setBekreftTekst("");
    });
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
            borderRadius: "var(--radius)",
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
                      ["Begrunnelse", g.scope, undefined],
                      ...(g.doneAt ? [["Slettet", g.doneAt, undefined] as const] : []),
                    ]}
                  />

                  {g.st === "Venter" && (
                    <div className="pa-a24__actions">
                      <Knapp
                        variant="secondary"
                        icon={ShieldCheck}
                        disabled={!onGodkjenn || venter}
                        onClick={() => kjor(onGodkjenn, g.id, `Forespørselen er godkjent: ${g.who}`)}
                      >
                        Godkjenn forespørselen
                      </Knapp>
                      <Knapp variant="ghost" icon={Download} disabled>
                        Lag innsynskopi
                      </Knapp>
                      <Meta>INNSYNSKOPI ER IKKE KOBLET ENNÅ</Meta>
                    </div>
                  )}

                  {g.st === "Godkjent" && (
                    <div className="pa-a24__actions">
                      <Knapp
                        variant="ghost"
                        icon={Trash2}
                        disabled={!onSlettData || venter}
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
            {FAQ.map(([sporsmaal, svar], i) => (
              <details key={i} className="pa-a24__faq-details">
                <summary className="pa-a24__faq-summary">{sporsmaal}</summary>
                <p className="pa-a24__faq-text">{svar}</p>
              </details>
            ))}
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
              disabled={bekreftTekst.trim().toUpperCase() !== "SLETT" || venter}
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
              Kontoen til {sletteKandidat.who} anonymiseres permanent. Relasjoner og treningsdata beholdes uten personopplysninger. Dette kan ikke angres.
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
