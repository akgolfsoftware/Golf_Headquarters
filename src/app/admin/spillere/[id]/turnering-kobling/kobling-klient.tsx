"use client";
/**
 * Koble PlayerHQ-spiller til PublicPlayer (turneringsidentitet), i Precision
 * Athletics. Samme handlinger som før: sokPublicPlayers, koblePublicPlayer og
 * fjernPublicPlayerKobling; siden lastes på nytt etter kobling og fjerning.
 */
import { useCallback, useState, useTransition } from "react";
import { Link2, Search, Unlink } from "lucide-react";
import { Knapp, Meta, StatusPille } from "@/components/precision/pa";
import { Dempet, Etikett, Liste, Rad, Seksjon } from "@/components/precision/pa-spiller360";
import {
  fjernPublicPlayerKobling,
  koblePublicPlayer,
  sokPublicPlayers,
  type PublicPlayerSokTreff,
} from "./actions";

export type KoblingKlientProps = {
  spillerId: string;
  spillerNavn: string;
  current: {
    id: string;
    name: string;
    tier: string;
    country: string;
    birthYear: number | null;
    entriesCount: number;
  } | null;
  initialForslag: PublicPlayerSokTreff[];
};

export function TurneringKoblingKlient({ spillerId, spillerNavn, current, initialForslag }: KoblingKlientProps) {
  const [q, setQ] = useState("");
  const [treff, setTreff] = useState<PublicPlayerSokTreff[]>([]);
  const [forslag] = useState(initialForslag);
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sok = useCallback(() => {
    setFeil(null);
    setMelding(null);
    startTransition(async () => {
      const r = await sokPublicPlayers(spillerId, q);
      if (!r.ok) { setFeil(r.error); return; }
      setTreff(r.treff);
      if (r.treff.length === 0) setMelding("Ingen treff. Prøv et annet navn.");
    });
  }, [spillerId, q]);

  const koble = useCallback((publicPlayerId: string, navn: string) => {
    setFeil(null);
    setMelding(null);
    startTransition(async () => {
      const r = await koblePublicPlayer(spillerId, publicPlayerId);
      if (!r.ok) { setFeil(r.error); return; }
      setMelding(`Koblet til ${navn}. ${r.mirrored} resultat${r.mirrored === 1 ? "" : "er"} speilet til profilen.`);
      // Full refresh så server-data oppdateres
      window.location.reload();
    });
  }, [spillerId]);

  const fjern = useCallback(() => {
    setFeil(null);
    setMelding(null);
    startTransition(async () => {
      const r = await fjernPublicPlayerKobling(spillerId);
      if (!r.ok) { setFeil(r.error); return; }
      setMelding("Kobling fjernet. Lagrede resultater i profilen beholdes.");
      window.location.reload();
    });
  }, [spillerId]);

  return (
    <div className="a8-stabel">
      {feil && <div role="alert" className="pa-alert pa-alert--warn"><span className="pa-alert__title">{feil}</span></div>}
      {melding && <div role="status" className="pa-alert pa-alert--info"><span className="pa-alert__title">{melding}</span></div>}

      <Seksjon k="Nåværende kobling" meta={current ? "KOBLET" : "IKKE KOBLET"} gap={12}>
        {current ? <>
          <Etikett a={current.name} sub={`${current.country} · ${current.tier}${current.birthYear != null ? ` · født ${current.birthYear}` : ""} · ${current.entriesCount} turneringer i basen`.toUpperCase()} />
          <div><Knapp size="sm" variant="signal" icon={Unlink} iconName="unlink" loading={pending} loadingText="Fjerner …" onClick={fjern}>Fjern kobling</Knapp></div>
        </> : <Dempet>{`${spillerNavn} er ikke knyttet til en turneringsspiller. Resultater fra GolfBox speiles ikke til profilen før kobling er satt.`}</Dempet>}
      </Seksjon>

      {forslag.length > 0 && !current && (
        <Seksjon k="Forslag (samme navn)"><TreffListe treff={forslag} pending={pending} onKoble={koble} /></Seksjon>
      )}

      <Seksjon k="Søk i turneringsspillere" meta="BRUTTO SCORE · INGENTING PUBLISERES HERFRA" gap={12}>
        <form className="a8-skjema__rad" onSubmit={(e) => { e.preventDefault(); sok(); }}>
          <label className="a8-etikett" style={{ flex: "1 1 240px" }}>
            <span className="pa-sr">Søk turneringsspiller</span>
            <input className="a8-felt" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Fornavn eller etternavn" aria-label="Søk turneringsspiller" />
          </label>
          <Knapp type="submit" variant="secondary" icon={Search} iconName="search" loading={pending} loadingText="Søker …" disabled={q.trim().length < 2}>Søk</Knapp>
        </form>
        {treff.length > 0 ? <TreffListe treff={treff} pending={pending} onKoble={koble} /> : <Dempet>Skriv minst to bokstaver og trykk Søk. Velg deretter riktig person.</Dempet>}
      </Seksjon>
    </div>
  );
}

function TreffListe({ treff, pending, onKoble }: { treff: PublicPlayerSokTreff[]; pending: boolean; onKoble: (id: string, navn: string) => void }) {
  return (
    <Liste>
      {treff.map((t) => (
        <Rad key={t.id}>
          <Etikett a={t.name} sub={`${t.country} · ${t.tier}${t.birthYear != null ? ` · født ${t.birthYear}` : ""} · ${t.entriesCount} turneringer${t.alreadyLinkedTo ? ` · allerede koblet til ${t.alreadyLinkedTo}` : ""}`.toUpperCase()} />
          {t.alreadyLinkedTo
            ? <StatusPille tone="warn">Opptatt</StatusPille>
            : <Knapp size="sm" variant="secondary" icon={Link2} iconName="link" disabled={pending} onClick={() => onKoble(t.id, t.name)}>Koble</Knapp>}
        </Rad>
      ))}
      <Meta>{`${treff.length} TREFF`}</Meta>
    </Liste>
  );
}
