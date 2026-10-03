"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { submitFeedback } from "@/app/portal/meg/feedback/actions";
import { Knapp, StatusPille, TomTilstand } from "@/components/precision/pa";

type FeedbackType = "bug" | "forslag" | "ros" | "sporsmal";
export type MegFeedbackData = { takk: boolean };

const MAX = 500;
const TYPER: { id: FeedbackType; navn: string }[] = [
  { id: "bug", navn: "Bug" },
  { id: "forslag", navn: "Forslag" },
  { id: "ros", navn: "Ros" },
  { id: "sporsmal", navn: "Spørsmål" },
];

function fritekstSporsmal(nps: number): string {
  if (nps <= 6) return "Hva bør vi forbedre?";
  if (nps <= 8) return "Hva mangler for å gi en 10-er?";
  return "Hva liker du best?";
}

export function MegFeedbackV2({ data }: { data: MegFeedbackData }) {
  const router = useRouter();
  const [nps, setNps] = useState(9);
  const [type, setType] = useState<FeedbackType>("forslag");
  const [tekst, setTekst] = useState("");
  const [anonym, setAnonym] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState(false);
  const kanSende = tekst.trim().length > 0 && !pending;

  function send() {
    setFeil(false);
    startTransition(async () => {
      try {
        await submitFeedback({ nps, type, tekst: tekst.trim(), anonym });
      } catch {
        setFeil(true);
      }
    });
  }

  return (
    <div className="ph25f">
      <header>
        <p>Tilbakemelding · under ett minutt</p>
        <h1>Tilbakemelding</h1>
        <p>Vi leser hver eneste tilbakemelding. Bug, forslag eller bare ros, alt teller.</p>
      </header>
      {data.takk && <p className="ph25f-ok" role="status"><StatusPille tone="ok">Sendt</StatusPille> Takk for tilbakemeldingen. Du gjør PlayerHQ bedre.</p>}
      {feil && (
        <p className="ph25f-feil" role="alert">
          <StatusPille tone="signal">Kunne ikke sende</StatusPille>
          Noe gikk galt. Prøv igjen, eller logg inn på nytt hvis du ble logget ut.
          <Knapp type="button" variant="secondary" onClick={() => router.push("/auth/login?next=%2Fportal%2Fmeg%2Ffeedback")}>Logg inn på nytt</Knapp>
        </p>
      )}
      <section className="pa-card ph25f-kort">
        <p>Anbefaling · påkrevd</p>
        <h2>Hvor sannsynlig er det at du anbefaler PlayerHQ til en venn?</h2>
        <div className="ph25f-nps" role="radiogroup" aria-label="Anbefaling fra 0 til 10">
          {Array.from({ length: 11 }, (_, n) => (
            <button key={n} type="button" aria-pressed={nps === n} onClick={() => setNps(n)}>{n}</button>
          ))}
        </div>
      </section>
      <section className="pa-card ph25f-kort">
        <p>Type tilbakemelding · påkrevd</p>
        <div className="ph25f-typer">
          {TYPER.map((t) => (
            <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => setType(t.id)}>{t.navn}</button>
          ))}
        </div>
      </section>
      <section className="pa-card ph25f-kort">
        <p>Din tilbakemelding</p>
        <h2>{fritekstSporsmal(nps)}</h2>
        <textarea rows={5} maxLength={MAX} value={tekst} placeholder="Skriv her, så detaljert eller kort du vil." onChange={(e) => setTekst(e.target.value.slice(0, MAX))} />
        <small>{tekst.length} / {MAX}</small>
      </section>
      <label className="pa-card ph25f-anon">
        <input type="checkbox" checked={anonym} onChange={(e) => setAnonym(e.target.checked)} />
        <span><strong>Send anonymt</strong><small>Vi kobler ikke svaret til kontoen din. Da kan vi heller ikke følge opp direkte.</small></span>
      </label>
      <p>Tar under ett minutt · vi leser alt</p>
      <Knapp type="button" fullWidth loading={pending} disabled={!kanSende} onClick={send}>{pending ? "Sender …" : "Send tilbakemelding"}</Knapp>
      <TomTilstand icon={History} title="Ingen innsendinger å vise ennå" text="Historikk kommer når lagring er på plass. Send gjerne en ny tilbakemelding over." />
      <Link href="/portal/meg" className="ph-tilbake">Tilbake til Meg</Link>
    </div>
  );
}
