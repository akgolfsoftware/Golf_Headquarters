"use client";

/**
 * Eksterne lesere (/admin/team/ekstern) — Precision Athletics, i AgencyOSSkall.
 * Fasit: docs/design-system/utkast-agencyos/resten.html, mal «team» (seksjonen Eksterne lesere).
 *
 * Samme datakontrakt og samme server-handlinger som før (opprettEksternLeser, trekkEksternLeser).
 * Trekk tilgangen spør først, med rust bekreftknapp, slik utkastet viser.
 *
 * Avvik:
 *   - Utkastet viser bare lista. Skjemaet for ny ekstern leser er beholdt over lista, fordi
 *     ingen annen side kan opprette en leser.
 *   - Åpent spørsmål i utkastet (skal funksjonen leve videre) er ikke avgjort; funksjonen er uendret.
 */
import { useState, useTransition } from "react";
import { DELING_SCOPES, type DelingScope } from "@/lib/deling/samtykke-regler";
import { opprettEksternLeser, trekkEksternLeser } from "@/app/admin/(legacy)/team/ekstern-leser-actions";
import { Avatar, Knapp, Seksjon, Tom, Varsel } from "./ny";

const SCOPE_LABEL: Record<DelingScope, string> = {
  TEST_RESULTATER: "Testresultater",
  STATS: "Statistikk",
  KOMPLETT_PROFIL: "Komplett profil",
};

export type EksternLeserRad = {
  id: string;
  navn: string;
  epost: string;
  grupper: string[];
};

export function EksterneLesere({ grupper, lesere }: { grupper: { id: string; name: string }[]; lesere: EksternLeserRad[] }) {
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [valgteGrupper, setValgteGrupper] = useState<string[]>([]);
  const [valgteScopes, setValgteScopes] = useState<DelingScope[]>(["TEST_RESULTATER", "STATS"]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [trekker, setTrekker] = useState<EksternLeserRad | null>(null);

  function veksle<T extends string>(liste: T[], sett: (v: T[]) => void, verdi: T) {
    sett(liste.includes(verdi) ? liste.filter((v) => v !== verdi) : [...liste, verdi]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    startTransition(async () => {
      const res = await opprettEksternLeser(epost.trim(), navn.trim(), valgteGrupper, valgteScopes);
      if (!res.ok) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setSuccess(
        res.epostSendt
          ? "Ekstern leser opprettet. Invitasjonen er sendt på e-post."
          : "Ekstern leser opprettet. E-post ble ikke sendt (Resend er ikke satt opp).",
      );
      setNavn("");
      setEpost("");
      setValgteGrupper([]);
    });
  }

  function bekreftTrekk() {
    if (!trekker || pending) return;
    const userId = trekker.id;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await trekkEksternLeser(userId);
      setTrekker(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("Tilgangen er trukket.");
    });
  }

  return (
    <div className="to-del">
      <Seksjon tittel="Eksterne lesere" kilde={String(lesere.length)}>
        {lesere.length === 0 ? (
          <Tom tittel="Ingen aktive eksterne lesere" tekst="Når du oppretter en leser, står den her med gruppene den ser." />
        ) : (
          <div className="liste">
            {lesere.map((leser) => (
              <div key={leser.id}>
                <Avatar navn={leser.navn} liten />
                <span>
                  <b>{leser.navn}</b>
                  <span className="kilde">{leser.epost}{leser.grupper.length ? ` · ${leser.grupper.join(", ")}` : ""}</span>
                </span>
                <Knapp variant="sek" disabled={pending} onClick={() => setTrekker(leser)}>Trekk</Knapp>
              </div>
            ))}
          </div>
        )}
        <p className="kilde">
          Team Norway- og WANG-ansvarlige med egen innlogging. De ser bare testresultater og statistikk for spillere som har
          samtykket til deling, aldri treningsplaner. Uten samtykke ser de ingenting.
        </p>
        {success && <Varsel tone="ok">{success}</Varsel>}
        {error && !trekker && <Varsel tone="advarsel">{error}</Varsel>}
      </Seksjon>

      <Seksjon tittel="Ny ekstern leser">
        <form className="kort" onSubmit={handleSubmit} noValidate>
          <div className="felt">
            <label htmlFor="el-navn">Navn</label>
            <input id="el-navn" value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="Fornavn Etternavn" autoComplete="off" />
            {fieldErrors.name && <span className="feiltekst">{fieldErrors.name}</span>}
          </div>
          <div className="felt">
            <label htmlFor="el-epost">E-post</label>
            <input id="el-epost" type="email" value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="ansvarlig@forbund.no" autoComplete="off" />
            {fieldErrors.email && <span className="feiltekst">{fieldErrors.email}</span>}
          </div>
          <div className="felt">
            <span className="etikett">Grupper</span>
            <div className="chips" role="group" aria-label="Grupper">
              {grupper.map((g) => (
                <button key={g.id} type="button" aria-pressed={valgteGrupper.includes(g.id)} onClick={() => veksle(valgteGrupper, setValgteGrupper, g.id)}>
                  {g.name}
                </button>
              ))}
            </div>
            {fieldErrors.groupIds && <span className="feiltekst">{fieldErrors.groupIds}</span>}
          </div>
          <div className="felt">
            <span className="etikett">Innsyn</span>
            <div className="chips" role="group" aria-label="Innsyn">
              {DELING_SCOPES.map((scope) => (
                <button key={scope} type="button" aria-pressed={valgteScopes.includes(scope)} onClick={() => veksle(valgteScopes, setValgteScopes, scope)}>
                  {SCOPE_LABEL[scope]}
                </button>
              ))}
            </div>
            {fieldErrors.scopes && <span className="feiltekst">{fieldErrors.scopes}</span>}
          </div>
          <Knapp type="submit" stor disabled={pending}>{pending ? "Oppretter …" : "Opprett ekstern leser"}</Knapp>
        </form>
      </Seksjon>

      {trekker && (
        <div className="dialog-lag">
          <div className="dialog" role="alertdialog" aria-labelledby="el-trekk-tittel">
            <h2 id="el-trekk-tittel">Trekke tilgangen?</h2>
            <p className="forklar">{trekker.navn} mister innsynet med en gang. Spillernes delinger blir liggende hos dem.</p>
            <div className="knapper">
              <Knapp variant="rust" stor disabled={pending} onClick={bekreftTrekk}>{pending ? "Trekker …" : "Trekk tilgangen"}</Knapp>
              <Knapp variant="sek" stor disabled={pending} onClick={() => setTrekker(null)}>Avbryt</Knapp>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
