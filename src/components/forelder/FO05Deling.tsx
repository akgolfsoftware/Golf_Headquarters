"use client";

/**
 * FO-05 Deling (/forelder/samtykke/deling/[childId]) — Precision Athletics.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «deling».
 * Stil: src/styles/flater-ny-forelder-booking.css.
 *
 * Samme regler og handlinger som TnSamtykkeSide i modus «foresatt»: to brytere per organisasjon.
 * «Tester og resultater» slår TEST_RESULTATER og STATS sammen, «Komplett profil» KOMPLETT_PROFIL.
 * Komplett profil tar testene med seg, og av på testene slår komplett av. Lagres med
 * settSamtykke (settDelingsSamtykkeForBarn), som sjekker forelder–barn-koblingen.
 *
 * Avvik:
 *   - Utkastet viser én navngitt trener. Navngitt deling ligger på egen side (lenken øverst);
 *     her står organisasjonene barnet er med i, og WANG-forespørslene under.
 */
import { useState, useTransition } from "react";
import { StatusPille } from "@/components/precision/pa";

export type FO05Organisasjon = {
  gruppeId: string;
  navn: string;
  testerOgResultater: boolean;
  komplettProfil: boolean;
};

type SettSamtykke = (scope: string, gruppeId: string, gitt: boolean) => Promise<{ ok: true } | { ok: false; feil: string }>;
type Felt = "testerOgResultater" | "komplettProfil";

const INNHOLD: Record<Felt, string[]> = {
  testerOgResultater: ["Testresultater", "Turneringsresultater, siste 12 måneder", "Rundestatistikk"],
  komplettProfil: ["Treningsplan og økter", "TrackMan-data", "Analyse og fremgang"],
};

export function FO05Deling({ organisasjoner, settSamtykke, barnFornavn }: {
  organisasjoner: FO05Organisasjon[];
  settSamtykke: SettSamtykke;
  barnFornavn: string;
}) {
  const [status, setStatus] = useState(organisasjoner);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function endre(gruppeId: string, felt: Felt, nyVerdi: boolean) {
    if (pending) return;
    setFeil(null);
    const forrige = status;
    setStatus((prev) =>
      prev.map((o) => {
        if (o.gruppeId !== gruppeId) return o;
        if (felt === "komplettProfil" && nyVerdi) return { ...o, komplettProfil: true, testerOgResultater: true };
        if (felt === "testerOgResultater" && !nyVerdi) return { ...o, testerOgResultater: false, komplettProfil: false };
        return { ...o, [felt]: nyVerdi };
      }),
    );
    startTransition(async () => {
      const kall: [string, boolean][] =
        felt === "komplettProfil"
          ? nyVerdi
            ? [["TEST_RESULTATER", true], ["STATS", true], ["KOMPLETT_PROFIL", true]]
            : [["KOMPLETT_PROFIL", false]]
          : nyVerdi
            ? [["TEST_RESULTATER", true], ["STATS", true]]
            : [["TEST_RESULTATER", false], ["STATS", false], ["KOMPLETT_PROFIL", false]];
      for (const [scope, gitt] of kall) {
        const svar = await settSamtykke(scope, gruppeId, gitt);
        if (!svar.ok) {
          setStatus(forrige);
          setFeil(svar.feil);
          return;
        }
      }
    });
  }

  if (status.length === 0) {
    return (
      <div className="fob-tom">
        <strong>Ingen organisasjon ser {barnFornavn}s data</strong>
        <p>Ingen klubb, krets eller forbund har tilgang til tester, resultater eller profil. Blir {barnFornavn} tatt inn i en satsing, kommer organisasjonen hit, og du bestemmer hva de får se.</p>
      </div>
    );
  }

  return (
    <div className="fob-seksjon">
      {status.map((org) => {
        const deles = [
          ...(org.testerOgResultater ? INNHOLD.testerOgResultater : []),
          ...(org.komplettProfil ? INNHOLD.komplettProfil : []),
        ];
        const delesIkke = [
          ...(!org.testerOgResultater ? INNHOLD.testerOgResultater : []),
          ...(!org.komplettProfil ? INNHOLD.komplettProfil : []),
        ];
        return (
          <section key={org.gruppeId} className="fob-kort" aria-label={org.navn}>
            <div className="fob-org">
              <strong>{org.navn}</strong>
              <StatusPille tone={deles.length > 0 ? "ok" : "neutral"}>{deles.length > 0 ? "Deler nå" : "Deler ikke"}</StatusPille>
            </div>
            <div className="fob-bryter">
              <div><b>Tester og resultater</b><small>Testresultater, turneringer og statistikk.</small></div>
              <button type="button" role="switch" className="fob-bryter-knapp" aria-checked={org.testerOgResultater} aria-label={`Tester og resultater, ${org.navn}`} disabled={pending} onClick={() => endre(org.gruppeId, "testerOgResultater", !org.testerOgResultater)}><i><span /></i></button>
            </div>
            <div className="fob-bryter">
              <div><b>Komplett profil</b><small>I tillegg treningsplan, TrackMan, analyse og fremgang.</small></div>
              <button type="button" role="switch" className="fob-bryter-knapp" aria-checked={org.komplettProfil} aria-label={`Komplett profil, ${org.navn}`} disabled={pending} onClick={() => endre(org.gruppeId, "komplettProfil", !org.komplettProfil)}><i><span /></i></button>
            </div>
            <div className="fob-to">
              <div>
                <p className="fob-kicker">Dette deles nå</p>
                <ul>{deles.length > 0 ? deles.map((d) => <li key={d}>{d}</li>) : <li>Ingenting</li>}</ul>
              </div>
              <div>
                <p className="fob-kicker">Dette deles ikke</p>
                <ul data-av="true">{delesIkke.length > 0 ? delesIkke.map((d) => <li key={d}>{d}</li>) : <li>Ingenting</li>}</ul>
              </div>
            </div>
            {deles.length > 0 && (
              <button type="button" className="pa-btn pa-btn--secondary" disabled={pending} onClick={() => endre(org.gruppeId, "testerOgResultater", false)} style={{ alignSelf: "flex-start" }}>
                Trekk tilbake all deling
              </button>
            )}
          </section>
        );
      })}
      {feil ? <p className="fob-feil" role="alert">Ble ikke lagret: {feil}</p> : null}
      <p className="fob-note" role="status">
        {pending ? "Lagrer …" : "Du eller barnet kan trekke delingen tilbake når som helst. Endringer logges."}
      </p>
    </div>
  );
}
