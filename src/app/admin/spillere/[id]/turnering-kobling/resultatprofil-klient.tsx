"use client";
/**
 * Koble en spiller under 16 til resultatprofilen (offisielle resultater). Treneren velger riktig
 * person blant treff som stemmer med navn og fødselsår i spillerens profil. Spillere fra 16 år
 * kobler seg selv; da vises bare status. Handlingene ligger i profil-actions.ts.
 */
import { useState, useTransition } from "react";
import { Link2, Search, Unlink } from "lucide-react";
import { Knapp, Meta, StatusPille } from "@/components/precision/pa";
import { Dempet, Etikett, Liste, Rad, Seksjon } from "@/components/precision/pa-spiller360";
import type { Kandidat } from "@/lib/profil-kobling/typer";
import { fjernKoblingForSpiller, kobleSpillerUnder16, sokKandidaterForSpiller } from "./profil-actions";

export type ResultatprofilStatus =
  | { status: "none" }
  | { status: "pending" | "confirmed"; kandidat: Kandidat | null };

export function ResultatprofilKlient({ spillerId, spillerNavn, under16, status }: {
  spillerId: string;
  spillerNavn: string;
  under16: boolean;
  status: ResultatprofilStatus;
}) {
  const [golfId, setGolfId] = useState("");
  const [kandidater, setKandidater] = useState<Kandidat[] | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const koblet = status.status === "confirmed";

  function sok() {
    setFeil(null);
    setKandidater(null);
    startTransition(async () => {
      const r = await sokKandidaterForSpiller({ spillerId, golfId: golfId.trim() || undefined });
      if (!r.ok) { setFeil(r.feil); return; }
      setKandidater(r.kandidater);
    });
  }

  function koble(personId: number) {
    setFeil(null);
    startTransition(async () => {
      const r = await kobleSpillerUnder16({ spillerId, personId, golfId: golfId.trim() || undefined });
      if (!r.ok) { setFeil(r.feil); return; }
      window.location.reload();
    });
  }

  function fjern() {
    setFeil(null);
    startTransition(async () => {
      const r = await fjernKoblingForSpiller({ spillerId });
      if (!r.ok) { setFeil(r.feil); return; }
      window.location.reload();
    });
  }

  return (
    <Seksjon k="Resultatprofil" meta={koblet ? "KOBLET" : "IKKE KOBLET"} gap={12}>
      {feil && <div role="alert" className="pa-alert pa-alert--warn"><span className="pa-alert__title">{feil}</span></div>}

      {koblet && status.status === "confirmed" && status.kandidat && (
        <Etikett a={status.kandidat.name} sub={`${status.kandidat.birth_year != null ? `født ${status.kandidat.birth_year} · ` : ""}${status.kandidat.tournaments} turneringer`.toUpperCase()} />
      )}
      {koblet && under16 && (
        <div><Knapp size="sm" variant="signal" icon={Unlink} iconName="unlink" loading={pending} loadingText="Fjerner …" onClick={fjern}>Fjern kobling</Knapp></div>
      )}
      {koblet && !under16 && <Dempet>{`${spillerNavn} har koblet seg selv. Spilleren kan angre under Meg › Resultater.`}</Dempet>}

      {!koblet && !under16 && <Dempet>{`${spillerNavn} er 16 år eller eldre og kobler seg selv under Meg › Resultater, eller i oppstarten.`}</Dempet>}

      {!koblet && under16 && (
        <>
          <Dempet>{`${spillerNavn} er under 16 år. Du kobler: søk, velg riktig person og bekreft. Treffene må stemme med navn og fødselsår i spillerens profil.`}</Dempet>
          <form className="a8-skjema__rad" onSubmit={(e) => { e.preventDefault(); sok(); }}>
            <label className="a8-etikett" style={{ flex: "1 1 240px" }}>
              <span className="pa-sr">Golf-ID (valgfri)</span>
              <input className="a8-felt" type="text" inputMode="numeric" value={golfId} onChange={(e) => setGolfId(e.target.value)} placeholder="Golf-ID, for eksempel 303-579 (valgfri)" aria-label="Golf-ID" />
            </label>
            <Knapp type="submit" variant="secondary" icon={Search} iconName="search" loading={pending} loadingText="Søker …">Søk</Knapp>
          </form>
          {kandidater && kandidater.length === 0 && <Dempet>Ingen treff. Prøv med golf-ID, eller sjekk navn og fødselsdato i spillerens profil.</Dempet>}
          {kandidater && kandidater.length > 0 && (
            <Liste>
              {kandidater.map((k) => (
                <Rad key={k.person_id}>
                  <Etikett a={k.name} sub={`${k.birth_year != null ? `født ${k.birth_year} · ` : ""}${k.club ? `${k.club} · ` : ""}${k.tournaments} turneringer`.toUpperCase()} />
                  <Knapp size="sm" variant="secondary" icon={Link2} iconName="link" disabled={pending} onClick={() => koble(k.person_id)}>Koble</Knapp>
                </Rad>
              ))}
              <Meta>{`${kandidater.length} TREFF`}</Meta>
            </Liste>
          )}
        </>
      )}
      {status.status === "pending" && <StatusPille tone="warn">Ventende kobling</StatusPille>}
    </Seksjon>
  );
}
