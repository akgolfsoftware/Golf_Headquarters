"use client";

/**
 * PlayerHQ Meg · Hjelp · Artikkel.
 * Redaksjonell brødtekst. Deling og tilbakemelding er lokal tilstand.
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, StatusPille, type Akse } from "@/components/precision/pa";

export type ArtikkelToc = { id: string; tittel: string };

export type MegHelpArtikkelData = {
  eyebrow: string;
  tittelLead: string;
  tittelItalic: string;
  forfatter: { initialer: string; navn: string; rolle: string };
  oppdatert: string;
  lesetid: number;
  toc: ArtikkelToc[];
};

const AKSE_NAVN: Record<Akse, string> = {
  fys: "Fysisk",
  tek: "Teknikk",
  slag: "Slag",
  spill: "Spill",
  turn: "Turnering",
};

function DelKnapp({ tittel }: { tittel: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function del() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: tittel, url });
        return;
      } catch {
        // Bruker avbrøt deling, eller share feilet — fall tilbake til clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Clipboard utilgjengelig (f.eks. usikker kontekst) — ingen handling.
    }
  }

  return (
    <Knapp variant="secondary" icon={kopiert ? Check : Copy} onClick={del} aria-live="polite">
      {kopiert ? "Lenke kopiert" : "Del"}
    </Knapp>
  );
}

function ArtikkelFeedback() {
  const [takket, setTakket] = useState(false);

  if (takket) {
    return <StatusPille tone="ok">Takk for tilbakemeldingen!</StatusPille>;
  }

  return (
    <>
      <Knapp fullWidth onClick={() => setTakket(true)}>Ja, fikk svar</Knapp>
      <Knapp fullWidth variant="secondary" onClick={() => setTakket(true)}>Nei, savner noe</Knapp>
    </>
  );
}

function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id}>{children}</h2>;
}

function H3({ children }: { children: ReactNode }) {
  return <h3>{children}</h3>;
}

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function Kode({ children }: { children: ReactNode }) {
  return <code>{children}</code>;
}

/* Pyramide-figuren — redaksjonelt eksempel (ideal-fordeling). */
const PYRAMIDE_LAG: { a: Akse; pct: number }[] = [
  { a: "fys", pct: 15 },
  { a: "tek", pct: 28 },
  { a: "slag", pct: 32 },
  { a: "spill", pct: 17 },
  { a: "turn", pct: 8 },
];

function PyramideFigur() {
  return (
    <section className="pa-card ph-kort">
      <p>Pyramiden ideal-fordelt — mai 2026, A1-spiller (eksempel)</p>
      <ul>
        {PYRAMIDE_LAG.map((l) => (
          <li key={l.a}>
            <AkseMerke axis={l.a} size="sm" />
            <span>
              <strong>{AKSE_NAVN[l.a]}</strong>
              <small>{l.pct}%</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Ukefordeling — redaksjonelt eksempel. */
const UKE_FORDELING: { a: Akse; pct: number; target: number }[] = [
  { a: "turn", pct: 8, target: 10 },
  { a: "spill", pct: 17, target: 15 },
  { a: "slag", pct: 32, target: 30 },
  { a: "tek", pct: 28, target: 30 },
  { a: "fys", pct: 15, target: 15 },
];

export function MegHelpArtikkelV2({ data }: { data: MegHelpArtikkelData }) {
  return (
    <div className="ph-flate">
      <header>
        <p>{data.eyebrow}</p>
        <h1>
          {data.tittelLead} <em>{data.tittelItalic}</em>?
        </h1>
      </header>

      <section className="pa-card ph-kort">
        <p>Forfatter</p>
        <dl>
          <div>
            <dt>Navn</dt>
            <dd>{data.forfatter.navn}</dd>
          </div>
          <div>
            <dt>Rolle</dt>
            <dd>{data.forfatter.rolle}</dd>
          </div>
          <div>
            <dt>Lesetid</dt>
            <dd>{data.lesetid} min</dd>
          </div>
          <div>
            <dt>Oppdatert</dt>
            <dd>{data.oppdatert}</dd>
          </div>
        </dl>
        <DelKnapp tittel={`${data.tittelLead} ${data.tittelItalic}?`} />
      </section>

      <section className="pa-card">
        <div className="ph-kort">
          <p>I denne artikkelen</p>
        </div>
        <ul className="ph-rader">
          {data.toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`}>{t.tittel}</a>
            </li>
          ))}
        </ul>
      </section>

      <H2 id="h1">Hvorfor en pyramide?</H2>
      <P>
        Pyramide-systemet er måten vi i AK Golf tenker om{" "}
        <strong>hvor tid brukes</strong> over en treningsuke. I bunnen
        ligger <Kode>FYS</Kode> og <Kode>TEK</Kode> — basisen for alt. Lenger opp kommer{" "}
        <Kode>SLAG</Kode>, <Kode>SPILL</Kode> og til toppen <Kode>TURN</Kode> — alt som er
        turneringsspesifikt mentalt og taktisk.
      </P>
      <P>
        Hvis du legger 80% av tida på toppen og lar bunnen forfalle, spiller du oppå et grunnlag
        som smuldrer. Hvis du legger 100% i bunnen blir du sterk og solid — men aldri
        turneringsklar.
      </P>

      <PyramideFigur />

      <H2 id="h2">De fem disiplinene</H2>
      <P>Hver disiplin har sin egen rolle i bygget.</P>

      <H3>FYS · Fysisk</H3>
      <P>
        Beinbøy, hofterotasjon, core-stabilitet, mobilitet i overkropp. Bunnen — kapasiteten du
        har <em>under</em> svingen.
      </P>

      <H3>TEK · Teknikk</H3>
      <P>
        Bevegelse, impact, biomekanikk. Drillene her bruker som regel <em>ikke</em> ball — eller
        bruker ball i kontrollerte settings.
      </P>

      <H3>SLAG · Slag-trening</H3>
      <P>
        Når du faktisk slår ball mot et resultat. Approach-distanser, putting-pace, chip-landing,
        bunker-pop.
      </P>

      <H3>SPILL · Bane-spill</H3>
      <P>På bane, ikke på range. 9-hulls simuleringer, par-3-blokker, scoring-konkurranser.</P>

      <H3>TURN · Turneringsspesifikt</H3>
      <P>Mental, taktisk, ritualer. Pre-shot-rutinen. Pust-protokollen mellom hull.</P>

      <H2 id="h3">Slik balanseres uka</H2>
      <P>
        En typisk uke for en A1-spiller fordeler seg på <strong>6–8 økter</strong> totalt.
      </P>

      <section className="pa-card ph-kort">
        <p>Øyvind, mai 2026 — pyramide-treff 72% (eksempel)</p>
        <ul>
          {UKE_FORDELING.map((p) => (
            <li key={p.a}>
              <AkseMerke axis={p.a} size="sm" />
              <span>
                <strong>{AKSE_NAVN[p.a]}</strong>
                <small>{p.pct}% · mål {p.target}%</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pa-card ph-kort">
        <p>Tips fra Anders</p>
        <small>
          Hvis du ser at en uke har 0% i én disiplin — det er ikke krise. Men hvis det går 3 uker uten en farge, vil pyramide-treffet falle merkbart.
        </small>
      </section>

      <H2 id="h4">Hva skjer når balansen tipper?</H2>
      <P>
        Pyramide-treff under <Kode>60%</Kode> betyr at hovedcoach varsles. Du får da to forslag:
        enten justere planen, eller akseptere midlertidig skjevhet.
      </P>

      <section className="pa-card ph-kort">
        <p>Var dette nyttig?</p>
        <ArtikkelFeedback />
      </section>

      <section className="pa-card ph-kort">
        <p>Fant du ikke svaret?</p>
        <strong>Snakk med <em>coach direkte</em></strong>
        <small>
          Anders K og resten av coach-teamet svarer innen 4 timer på hverdager. Helt fritt for Pro-medlemmer.
        </small>
        <KnappLenke href="/portal/coach/melding/ny" fullWidth>Send melding</KnappLenke>
        <KnappLenke href="/portal/meg/abonnement" variant="secondary" fullWidth>Se abonnement →</KnappLenke>
      </section>
    </div>
  );
}
