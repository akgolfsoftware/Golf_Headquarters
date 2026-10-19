"use client";

/**
 * BK-04 Endre eller avbestill (/booking/endre/[token]) — Precision Athletics.
 * Gjest uten konto kommer hit fra lenken i bekreftelsen eller påminnelsen
 * (bookingplanen 15.10 steg 5). Bygger på BK-03-rammen og samme komponenter.
 *
 * - Flytt: dager og tider som brytes over flere linjer (aldri sidelengs rulling),
 *   bare tider hos samme coach innenfor tilgjengeligheten. Serveren sjekker igjen.
 * - Avbestill: to trinn. Første trykk viser hva som skjer med betalingen,
 *   andre trykk avbestiller. Rust bare på selve avbestillingen (§PRECISION ATHLETICS).
 * - Mindre enn 24 timer igjen: flytting er stengt, avbestilling er åpen uten refusjon.
 */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { useState, useTransition } from "react";
import { CalendarClock, CalendarPlus, Link2Off, XCircle } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { BK03Ramme } from "./BK03Ramme";

export type BK04Dag = { navn: string; kort: string; tider: { kl: string; startIso: string }[] };

export type BK04Detaljer = {
  ref: string;
  tjeneste: string;
  tid: string;
  sted: string;
  coach: string | null;
  fristTekst: string;
  kanFlytte: boolean;
  avbestillTekst: string;
};

export type BK04Props =
  | { tilstand: "ugyldig" }
  | { tilstand: "endret" }
  | { tilstand: "avbestilt"; detaljer: BK04Detaljer }
  | {
      tilstand: "data";
      detaljer: BK04Detaljer;
      dager: BK04Dag[];
      flytt: (startIso: string) => Promise<{ ok: boolean; melding: string }>;
      avbestill: () => Promise<{ ok: boolean; melding: string }>;
    };

const h1 = { margin: 0, font: "600 26px/1.2 var(--font-sans)", letterSpacing: "var(--tracking-display)", color: "var(--text-primary)" } as const;
const h2 = { margin: 0, font: "600 18px/1.3 var(--font-sans)", color: "var(--text-primary)" } as const;
const tekst = { margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty" } as const;
const rad = { display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 } as const;

function Fakta({ d }: { d: BK04Detaljer }) {
  const r = (k: string, v: string | null, mono?: boolean) => (
    <div className="pa-kv__row">
      <dt className="pa-kv__k">{k}</dt>
      <dd className={mono ? "pa-kv__v is-mono" : "pa-kv__v"}>{v ?? "—"}</dd>
    </div>
  );
  return (
    <dl className="pa-kv" style={{ margin: 0 }}>
      {r("Tjeneste", d.tjeneste)}
      {r("Tid", d.tid)}
      {r("Sted", d.sted)}
      {r("Coach", d.coach)}
      {r("Referanse", d.ref, true)}
    </dl>
  );
}

export function BK04GjestEndre(props: BK04Props) {
  if (props.tilstand === "ugyldig" || props.tilstand === "endret") {
    return (
      <BK03Ramme>
        <TomTilstand
          icon={Link2Off}
          title={props.tilstand === "endret" ? "Timen har fått ny tid" : "Lenken virker ikke lenger"}
          text={props.tilstand === "endret"
            ? "Bruk lenken i den nyeste e-posten fra oss. Den gamle lenken slutter å virke når timen flyttes."
            : "Lenken er utløpt eller feil. Bruk lenken i den nyeste e-posten fra oss, eller skriv til post@akgolf.no."}
          actions={<KnappLenke icon={CalendarPlus} href="/booking">Book time</KnappLenke>}
        />
      </BK03Ramme>
    );
  }
  if (props.tilstand === "avbestilt") {
    return (
      <BK03Ramme>
        <div style={rad}><StatusPille>Avbestilt</StatusPille></div>
        <h1 style={h1}>Timen er avbestilt</h1>
        <Fakta d={props.detaljer} />
        <div style={rad}><KnappLenke icon={CalendarPlus} href="/booking">Book ny time</KnappLenke></div>
      </BK03Ramme>
    );
  }
  return <Endre {...props} />;
}

function Endre({ detaljer: d, dager, flytt, avbestill }: Extract<BK04Props, { tilstand: "data" }>) {
  const [dagIdx, setDagIdx] = useState(() => Math.max(0, dager.findIndex(x => x.tider.length > 0)));
  const [valgt, setValgt] = useState<string | null>(null);
  const [bekreftAvbestill, setBekreftAvbestill] = useState(false);
  const [svar, setSvar] = useState<{ ok: boolean; melding: string } | null>(null);
  const [venter, start] = useTransition();
  const dag = dager[dagIdx];

  const kjor = (fn: () => Promise<{ ok: boolean; melding: string }>) =>
    start(async () => {
      try {
        setSvar(await fn());
      } catch {
        setSvar({ ok: false, melding: "Noe gikk galt. Prøv igjen, eller skriv til post@akgolf.no." });
      }
    });

  if (svar?.ok) {
    return (
      <BK03Ramme>
        <div style={rad}><StatusPille tone="ok">Lagret</StatusPille></div>
        <h1 style={h1}>{svar.melding.split(".")[0]}</h1>
        <p style={tekst} role="status">{svar.melding}</p>
        <div style={rad}><KnappLenke variant="secondary" icon={CalendarPlus} href="/booking">Book en time til</KnappLenke></div>
      </BK03Ramme>
    );
  }

  return (
    <BK03Ramme>
      <div style={rad}><StatusPille tone="ok">Bekreftet</StatusPille></div>
      <h1 style={h1}>Endre eller avbestill</h1>
      <Fakta d={d} />
      <Meta>{d.fristTekst}</Meta>
      {svar && !svar.ok && <p role="alert" style={{ ...tekst, color: "var(--text-primary)", fontWeight: 600 }}>{svar.melding}</p>}

      <section style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }} aria-labelledby="flytt">
        <h2 id="flytt" style={h2}>Flytt timen</h2>
        {!d.kanFlytte ? (
          <p style={tekst}>Det er 24 timer eller mindre til timen. Skriv til post@akgolf.no for å flytte den.</p>
        ) : dager.every(x => x.tider.length === 0) ? (
          <p style={tekst}>Coachen har ingen ledige tider i bookingvinduet nå. Skriv til post@akgolf.no.</p>
        ) : (
          <>
            <div style={rad} role="group" aria-label="Dag">
              {dager.map((x, i) => (
                <button key={x.navn} type="button" className="pa-choice" aria-pressed={i === dagIdx} disabled={x.tider.length === 0}
                  onClick={() => { setDagIdx(i); setValgt(null); }} aria-label={`${x.navn}, ${x.tider.length} ledige`}>
                  {x.kort}
                </button>
              ))}
            </div>
            <p style={{ ...tekst, color: "var(--text-primary)" }}>{dag?.navn}</p>
            <div style={rad} role="group" aria-label="Tid">
              {dag?.tider.map(t => (
                <button key={t.startIso} type="button" className="pa-choice pa-choice--mono" aria-pressed={valgt === t.startIso} onClick={() => setValgt(t.startIso)}>
                  {t.kl}
                </button>
              ))}
            </div>
            <div style={rad}>
              <Knapp icon={CalendarClock} disabled={!valgt} loading={venter} loadingText="Flytter …" onClick={() => valgt && kjor(() => flytt(valgt))}>
                Flytt til valgt tid
              </Knapp>
            </div>
          </>
        )}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0, paddingTop: 16, borderTop: "1px solid var(--border-hairline)" }} aria-labelledby="avbestill">
        <h2 id="avbestill" style={h2}>Avbestill</h2>
        <p style={tekst}>{d.avbestillTekst}</p>
        <div style={rad}>
          {bekreftAvbestill ? (
            <>
              <Knapp variant="signal" icon={XCircle} loading={venter} loadingText="Avbestiller …" onClick={() => kjor(avbestill)}>Avbestill timen</Knapp>
              <Knapp variant="ghost" onClick={() => setBekreftAvbestill(false)} disabled={venter}>Behold timen</Knapp>
            </>
          ) : (
            <Knapp variant="secondary" icon={XCircle} onClick={() => setBekreftAvbestill(true)}>Avbestill …</Knapp>
          )}
        </div>
      </section>
    </BK03Ramme>
  );
}
