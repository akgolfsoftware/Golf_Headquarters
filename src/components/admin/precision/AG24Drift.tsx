"use client";

/**
 * Drift (AG-24) i nytt design: /admin/drift, /admin/audit-log, /admin/feillogg, /admin/gdpr, /admin/hjelp.
 * Bare for admin. Fire faner: Sletteforespørsler (GDPR art. 17), Revisjonslogg, Feillogg og Hjelp.
 * Tegning: canvaset «AgencyOS nøkkelskjermer», raden «Drift (AG-24)». Ingen tall regnes her;
 * alt kommer fra lastDriftData(). Fanen «System» i tegningen har ingen datakilde ennå og er ikke med.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Laster, Feil, Nokkelverdier, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-drift.css";

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
  ["Hvordan godkjenner jeg et utkast fra Jarvis?", "Åpne Kø, les utkastet og trykk Godkjenn. Ingenting sendes før du godkjenner."],
  ["Hvordan slettes en spiller?", "Via sletteforespørsel her i Drift: godkjenn forespørselen først, deretter slett data. Faktura beholdes i 5 år etter bokføringsloven."],
  ["Hvem ser økonomitallene?", "Bare head coach. Tallene leses fra Tripletex-eksporten."],
];

type FaneId = "gdpr" | "audit" | "feil" | "hjelp";
const FANER: FaneId[] = ["gdpr", "audit", "feil", "hjelp"];

const TOPP_INGRESS = "Sletteforespørsler, revisjonslogg, feillogg og hjelp. Bare synlig for admin.";

export function AG24Drift({ tilstand = "data", data = TOM_DATA, startFane = "gdpr", onGodkjenn, onSlettData }: AG24DriftProps) {
  const [aktivFane, setAktivFane] = useState<FaneId>(FANER.includes(startFane as FaneId) ? (startFane as FaneId) : "gdpr");
  const router = useRouter();
  const [venter, startTransition] = useTransition();
  const foresporsler = tilstand === "tom" ? [] : data.gdpr;
  const audit = tilstand === "tom" ? [] : data.audit;
  const feil = tilstand === "tom" ? [] : data.errors;
  const [valgtGdpr, setValgtGdpr] = useState<string | null>(null);
  const [valgtAudit, setValgtAudit] = useState<string | null>(null);
  const [valgtFeil, setValgtFeil] = useState<string | null>(null);
  const [sletteKandidat, setSletteKandidat] = useState<GdprForesporsel | null>(null);
  const [bekreftTekst, setBekreftTekst] = useState("");
  const [statusMelding, setStatusMelding] = useState<string | null>(null);

  const topp = <Topp dato="Drift · bare admin" tittel="Drift" ingress={TOPP_INGRESS} />;

  if (tilstand === "laster") {
    return <div className="agn-s" data-testid="ag24-laster">{topp}<Laster tekst="Henter driftsdata …" /></div>;
  }
  if (tilstand === "feil") {
    return <div className="agn-s" data-testid="ag24-feil">{topp}<Feil tittel="Driftsdata kunne ikke hentes" tekst="Ingen data er slettet eller endret." kode="DRIFT" /></div>;
  }

  const venterAntall = foresporsler.filter((g) => g.st === "Venter").length;
  const ubehandlede = foresporsler.filter((g) => g.st !== "Slettet").length;
  const utfort = foresporsler.filter((g) => g.st === "Slettet").length;
  const feilAntall = feil.filter((f) => f.lvl === "Feil").reduce((n, f) => n + f.n, 0);

  const kjor = (handling: ((id: string) => Promise<Handlingsresultat>) | undefined, id: string, suksess: string, etterpaa?: () => void) => {
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
  const lukkDialog = () => { setSletteKandidat(null); setBekreftTekst(""); };

  const faneNavn: Record<FaneId, string> = {
    gdpr: ubehandlede > 0 ? `Sletteforespørsler · ${ubehandlede}` : "Sletteforespørsler",
    audit: "Revisjonslogg",
    feil: "Feillogg",
    hjelp: "Hjelp",
  };

  const gdprValgt = foresporsler.find((g) => g.id === valgtGdpr) ?? foresporsler[0];
  const auditValgt = audit.find((a) => a.id === valgtAudit) ?? audit[0];
  const feilValgt = feil.find((f) => f.id === valgtFeil) ?? feil[0];

  return (
    <div className="agn-s" data-testid="ag24-drift">
      {topp}

      <div className="teller-rad">
        <div className={venterAntall > 0 ? "teller signal" : "teller"}><span className="e">Venter på godkjenning</span><b className="t">{venterAntall}</b><span className="s">Frist 30 dager, GDPR art. 17</span></div>
        <div className="teller"><span className="e">Slettet</span><b className="t">{utfort}</b><span className="s">Utført</span></div>
        <div className="teller"><span className="e">Feil siste 7 dager</span><b className="t">{feilAntall}</b><span className="s">{feil.length} ulike meldinger</span></div>
        <div className="teller"><span className="e">Revisjonshendelser</span><b className="t">{audit.length}</b><span className="s">Siste 7 dager</span></div>
      </div>

      <nav className="valg" aria-label="Drift">
        {FANER.map((f) => <button key={f} type="button" aria-pressed={aktivFane === f} onClick={() => setAktivFane(f)}>{faneNavn[f]}</button>)}
      </nav>

      {statusMelding && (
        <Varsel tone="info">
          <span className="drift-melding"><span>{statusMelding}</span><Knapp variant="sek" aria-label="Lukk varsel" onClick={() => setStatusMelding(null)}>Lukk</Knapp></span>
        </Varsel>
      )}

      {aktivFane === "gdpr" && (
        <div data-testid="ag24-fane-gdpr">
          {foresporsler.length === 0 ? (
            <Tom tittel="Ingen sletteforespørsler" tekst="Forespørsler fra spillere og foreldre kommer hit. Fristen er 30 dager." />
          ) : (
            <div className="to-del bred-v">
              <Seksjon tittel="Forespørsler">
                <div className="liste">
                  {foresporsler.map((g) => (
                    <button key={g.id} type="button" aria-pressed={gdprValgt?.id === g.id} className="drift-rad" onClick={() => setValgtGdpr(g.id)}>
                      <span><b>{g.who}</b><span className="kilde">{g.at} · {g.role}</span></span>
                      <span aria-hidden />
                      <Pille tone={g.st === "Slettet" ? "ok" : g.st === "Venter" ? "noy" : "vent"}>{g.st}</Pille>
                    </button>
                  ))}
                </div>
              </Seksjon>
              {gdprValgt && (
                <Seksjon tittel={gdprValgt.who} kilde={gdprValgt.st}>
                  <div className="kort">
                    <Nokkelverdier rader={[
                      ["Hvem", gdprValgt.role],
                      ["Bedt om av", gdprValgt.by],
                      ["Mottatt", gdprValgt.at],
                      ["Frist", gdprValgt.due, "30 dager, GDPR art. 17"],
                      ["Begrunnelse", gdprValgt.scope],
                      ...(gdprValgt.doneAt ? [["Slettet", gdprValgt.doneAt] as const] : []),
                    ]} />
                    {gdprValgt.st === "Venter" && (
                      <div className="knapper">
                        <Knapp disabled={!onGodkjenn || venter} onClick={() => kjor(onGodkjenn, gdprValgt.id, `Forespørselen er godkjent: ${gdprValgt.who}`)}>Godkjenn forespørselen</Knapp>
                        <Knapp variant="sek" disabled>Lag innsynskopi</Knapp>
                        <p className="kilde">Innsynskopi er ikke koblet ennå.</p>
                      </div>
                    )}
                    {gdprValgt.st === "Godkjent" && (
                      <div className="knapper">
                        <Knapp variant="sek" disabled={!onSlettData || venter} onClick={() => { setSletteKandidat(gdprValgt); setBekreftTekst(""); }}>Slett data</Knapp>
                      </div>
                    )}
                  </div>
                </Seksjon>
              )}
            </div>
          )}
        </div>
      )}

      {aktivFane === "audit" && (
        <div data-testid="ag24-fane-audit">
          {audit.length === 0 ? (
            <Tom tittel="Ingen hendelser" tekst="Loggen er tom for de siste 7 dagene." />
          ) : (
            <div className="to-del bred-v">
              <Seksjon tittel="Revisjonslogg" kilde="Siste 7 dager">
                <div className="liste">
                  {audit.map((a) => (
                    <button key={a.id} type="button" aria-pressed={auditValgt?.id === a.id} className="drift-rad" onClick={() => setValgtAudit(a.id)}>
                      <span><b>{a.what}</b><span className="kilde">{a.who} · {a.obj}</span></span>
                      <span aria-hidden />
                      <span className="mono kilde">{a.t}</span>
                    </button>
                  ))}
                </div>
              </Seksjon>
              {auditValgt && (
                <Seksjon tittel="Valgt hendelse">
                  <div className="kort"><Nokkelverdier rader={[["Tid", auditValgt.t], ["Hvem", auditValgt.who], ["Hva", auditValgt.what], ["Gjelder", auditValgt.obj]]} /></div>
                </Seksjon>
              )}
            </div>
          )}
        </div>
      )}

      {aktivFane === "feil" && (
        <div data-testid="ag24-fane-feil">
          {feil.length === 0 ? (
            <Tom tittel="Ingen feil" tekst="Ingen feil eller advarsler er registrert de siste 7 dagene." />
          ) : (
            <div className="to-del bred-v">
              <Seksjon tittel="Feillogg" kilde="Siste 7 dager">
                <div className="liste">
                  {feil.map((f) => (
                    <button key={f.id} type="button" aria-pressed={feilValgt?.id === f.id} className="drift-rad" onClick={() => setValgtFeil(f.id)}>
                      <span><b>{f.msg}</b><span className="kilde">{f.where} · {f.t}</span></span>
                      <span className="mono kilde">{f.n}×</span>
                      <Pille tone={f.lvl === "Feil" ? "feil" : "vent"}>{f.lvl}</Pille>
                    </button>
                  ))}
                </div>
              </Seksjon>
              {feilValgt && (
                <Seksjon tittel="Valgt feil">
                  <div className="kort">
                    <Nokkelverdier rader={[["Nivå", feilValgt.lvl], ["Sted", feilValgt.where], ["Sist", feilValgt.t], ["Antall", String(feilValgt.n)]]} />
                    <p className="mono drift-kode">{feilValgt.msg}</p>
                  </div>
                </Seksjon>
              )}
            </div>
          )}
        </div>
      )}

      {aktivFane === "hjelp" && (
        <div data-testid="ag24-fane-hjelp">
          <Seksjon tittel="Vanlige spørsmål">
            <div className="kort">
              {FAQ.map(([sporsmaal, svar], i) => (
                <details key={i} className="detaljer">
                  <summary>{sporsmaal}</summary>
                  <p className="forklar">{svar}</p>
                </details>
              ))}
            </div>
          </Seksjon>
        </div>
      )}

      {sletteKandidat && (
        <div className="dialog-lag">
          <div role="alertdialog" aria-modal="true" aria-labelledby="slett-tittel" className="dialog">
            <h2 id="slett-tittel">Slette alle data?</h2>
            <p className="forklar">Kontoen til {sletteKandidat.who} anonymiseres permanent. Relasjoner og treningsdata beholdes uten personopplysninger. Dette kan ikke angres.</p>
            <label className="felt">
              <span className="etikett">Skriv SLETT for å bekrefte</span>
              <input value={bekreftTekst} onChange={(e) => setBekreftTekst(e.target.value)} placeholder="SLETT" aria-label="Bekreftelse med SLETT" />
            </label>
            <div className="knapper">
              <Knapp variant="rust" stor disabled={bekreftTekst.trim().toUpperCase() !== "SLETT" || venter} onClick={handleSlett}>Slett permanent</Knapp>
              <Knapp variant="sek" stor onClick={lukkDialog}>Avbryt</Knapp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
