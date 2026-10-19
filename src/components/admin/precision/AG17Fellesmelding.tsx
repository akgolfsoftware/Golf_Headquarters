"use client";

/**
 * Fellesmelding til turneringsdeltakere (D1) i nytt design — turneringssiden.
 * Erstatter components/admin/v2/fellesmelding-flyt. Samme tre steg i ett ark
 * (velg mottakere, skriv, send), samme server-handling (sendFellesmelding),
 * kvittering med «Prøv igjen» for dem som feilet, og ?fellesmelding=1 åpner arket.
 */
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Knapp, KnappLenke, Pille, Tom, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { sendFellesmelding, type FellesmeldingResultat } from "@/app/admin/tournaments/actions";

export type FellesmeldingDeltaker = { userId: string; navn: string; status: string };

const STATUS: Record<string, { l: string; tone: PilleTone }> = {
  PLANNED: { l: "Påmeldt", tone: "noy" },
  CONFIRMED: { l: "Bekreftet", tone: "ok" },
  WITHDRAWN: { l: "Trukket", tone: "noy" },
  COMPLETED: { l: "Gjennomført", tone: "ok" },
  DNF: { l: "DNF", tone: "vent" },
};

const MALER = [
  { id: "oppmote", navn: "Oppmøtetid", tekst: "Oppmøte kl. 07:30 ved klubbhuset. Vær klar 15 minutter før første start, og husk gyldig medlemskort." },
  { id: "vaer", navn: "Væravlysning", tekst: "Runden er dessverre avlyst på grunn av været. Vi kommer tilbake med ny dato så snart vi vet mer." },
];

type Steg = "velg" | "skriv" | "send";

export function AG17Fellesmelding({ turneringId, turneringNavn, deltakere, autoApen = false }: {
  turneringId: string; turneringNavn: string; deltakere: FellesmeldingDeltaker[]; autoApen?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const tom = deltakere.length === 0;
  const [apen, setApen] = useState(autoApen && !tom);
  const lukk = () => { setApen(false); if (autoApen) router.replace(pathname, { scroll: false }); };
  return <>
    <Knapp variant="sek" disabled={tom} title={tom ? "Ingen påmeldte å sende til" : undefined} onClick={() => setApen(true)}>Send fellesmelding</Knapp>
    {apen && <Ark turneringId={turneringId} turneringNavn={turneringNavn} deltakere={deltakere} onLukk={lukk} />}
  </>;
}

function Ark({ turneringId, turneringNavn, deltakere, onLukk }: { turneringId: string; turneringNavn: string; deltakere: FellesmeldingDeltaker[]; onLukk: () => void }) {
  const [steg, setSteg] = useState<Steg>("velg");
  const [valgt, setValgt] = useState<Set<string>>(() => new Set(deltakere.map((d) => d.userId)));
  const [tekst, setTekst] = useState("");
  const [resultat, setResultat] = useState<FellesmeldingResultat | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const veksle = (id: string) => setValgt((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const send = (ids: string[]) => {
    setFeil(null);
    start(async () => {
      const res = await sendFellesmelding({ turneringId, spillerIds: ids, tekst: tekst.trim() });
      if (res.error) return setFeil(res.error);
      setResultat(res);
    });
  };
  const nr = steg === "velg" ? 1 : steg === "skriv" ? 2 : 3;

  return (
    <div className="ark-lag" role="dialog" aria-modal="true" aria-labelledby="fellesmelding-tittel" onClick={() => !pending && onLukk()}>
      <div className="ark" onClick={(e) => e.stopPropagation()}>
        <div className="ark-topp">
          <div><span className="kilde mono">{resultat ? "Fellesmelding · kvittering" : `Fellesmelding · ${nr} av 3`}</span><h2 id="fellesmelding-tittel">{turneringNavn}</h2></div>
          <Knapp variant="spok" disabled={pending} onClick={onLukk}>Lukk</Knapp>
        </div>

        {resultat ? <>
          <Varsel tone={resultat.feilet.length ? "advarsel" : "ok"} tittel={`${resultat.sendt} ${resultat.sendt === 1 ? "melding sendt" : "meldinger sendt"}`}>
            {resultat.feilet.length
              ? `${resultat.feilet.length} av ${resultat.sendt + resultat.feilet.length} feilet: ${resultat.feilet.map((f) => f.navn).join(", ")}.`
              : `Ligger i innboksen i PlayerHQ hos ${resultat.sendt} ${resultat.sendt === 1 ? "spiller" : "spillere"}.`}
          </Varsel>
          <div className="knapper">
            <Knapp onClick={onLukk}>Ferdig</Knapp>
            {resultat.feilet.length > 0 && <Knapp variant="sek" disabled={pending} onClick={() => { const ids = resultat.feilet.map((f) => f.userId); setResultat(null); send(ids); }}>{pending ? "Sender …" : "Prøv igjen"}</Knapp>}
            <KnappLenke variant="spok" href="/admin/innboks">Se tråden</KnappLenke>
          </div>
        </> : deltakere.length === 0 ? (
          <Tom tittel="Ingen påmeldte" tekst="Meld på spillere før du sender en fellesmelding." />
        ) : <>
          {steg === "velg" && <>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <b className="mono">{valgt.size} av {deltakere.length} valgt</b>
              <span className="knapper">
                <Knapp variant="spok" onClick={() => setValgt(new Set(deltakere.map((d) => d.userId)))}>Velg alle</Knapp>
                <Knapp variant="spok" onClick={() => setValgt(new Set())}>Fjern alle</Knapp>
              </span>
            </div>
            <div className="liste" style={{ maxHeight: 340, overflowY: "auto" }}>
              {deltakere.map((d) => {
                const st = STATUS[d.status] ?? { l: d.status, tone: "noy" as const };
                return (
                  <label key={d.userId} style={{ cursor: "pointer", gridTemplateColumns: "auto auto minmax(0, 1fr) auto" }}>
                    <input type="checkbox" checked={valgt.has(d.userId)} onChange={() => veksle(d.userId)} style={{ width: 20, height: 20, accentColor: "var(--graphite-900)" }} />
                    <Avatar navn={d.navn} liten />
                    <b style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.navn}</b>
                    <Pille tone={st.tone}>{st.l}</Pille>
                  </label>
                );
              })}
            </div>
          </>}

          {steg === "skriv" && <>
            <div className="chips" role="group" aria-label="Maler">
              {MALER.map((m) => <button key={m.id} type="button" onClick={() => setTekst(m.tekst)}>{m.navn}</button>)}
            </div>
            <label className="felt"><span className="etikett">Melding</span>
              <textarea rows={6} autoFocus value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder="Skriv beskjeden til deltakerne" style={{ resize: "vertical" }} /></label>
          </>}

          {steg === "send" && <>
            <p className="forklar">Sendes til <b>{valgt.size} {valgt.size === 1 ? "spiller" : "spillere"}</b> som melding i innboksen i PlayerHQ.</p>
            <div className="kort dempet"><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{tekst.trim()}</p></div>
            {feil && <Varsel tone="advarsel" tittel="Ikke sendt">{feil}</Varsel>}
          </>}

          <div className="knapper" style={{ justifyContent: "space-between" }}>
            <Knapp variant="spok" disabled={pending} onClick={steg === "velg" ? onLukk : () => setSteg(steg === "send" ? "skriv" : "velg")}>{steg === "velg" ? "Avbryt" : "Tilbake"}</Knapp>
            {steg === "velg" && <Knapp disabled={valgt.size === 0} onClick={() => setSteg("skriv")}>Neste</Knapp>}
            {steg === "skriv" && <Knapp disabled={!tekst.trim()} onClick={() => setSteg("send")}>Neste</Knapp>}
            {steg === "send" && <Knapp disabled={pending || valgt.size === 0 || !tekst.trim()} onClick={() => send(Array.from(valgt))}>{pending ? "Sender …" : `Send til ${valgt.size}`}</Knapp>}
          </div>
        </>}
      </div>
    </div>
  );
}
