"use client";

/**
 * FO-05 Deling med eksterne miljøer, per barn — Precision Athletics, på Samtykke-siden.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «samtykke» (raden «Deling med trener»).
 * Stil: src/styles/flater-ny-forelder-profil.css (lastes av siden).
 *
 * Delingssamtykke til tredjepart (plan T8) — Team Norway-/WANG-lesere. Teksten hentes fra
 * DELING_SAMTYKKE_TEKST, samme kilde som versjonen som lagres. Mindreårige spillere ser
 * bryterne, men kan ikke slå dem PÅ selv (FORESATT-kravet håndheves i server-laget); å slå
 * AV skal alltid være mulig (art. 7-3). Server-handlingene er uendret.
 *
 * Avvik:
 *   - Utkastet viser én samlet rad med «Se». Her står bryterne per gruppe på siden, fordi
 *     samtykket gis per gruppe og per omfang.
 */
import { useState, useTransition } from "react";
import { StatusPille } from "@/components/precision/pa";
import { FoToggle } from "@/components/forelder/fo-presisjon";
import { DELING_SAMTYKKE_TEKST } from "@/lib/deling/samtykke-regler";
import { giDelingsSamtykke, trekkDelingsSamtykke } from "@/app/portal/meg/innstillinger/personvern/deling-samtykke-actions";
import { settDelingsSamtykkeForBarn } from "@/app/forelder/samtykke/actions";

export type DelingGruppeStatus = {
  gruppeId: string;
  gruppeNavn: string;
  testResultater: boolean;
  stats: boolean;
};

export type DelingSamtykkeKortProps = {
  grupper: DelingGruppeStatus[];
  /** Spiller-flaten: under 16 kan ikke slå PÅ selv. */
  krevesForesatt?: boolean;
  /** Foresatt-flaten: hvilket barn samtykket gjelder. */
  modus: { type: "spiller" } | { type: "foresatt"; childId: string };
};

// Bare de to opprinnelige scopene. KOMPLETT_PROFIL har egen side (FO05Deling).
type EmbedScope = "TEST_RESULTATER" | "STATS";
const SCOPE_FELT: Record<EmbedScope, "testResultater" | "stats"> = {
  TEST_RESULTATER: "testResultater",
  STATS: "stats",
};

export function FO05DelingSamtykke({ grupper, krevesForesatt = false, modus }: DelingSamtykkeKortProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(grupper);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  function endre(gruppeId: string, scope: EmbedScope, nyVerdi: boolean) {
    if (pending) return;
    if (modus.type === "spiller" && krevesForesatt && nyVerdi) return;
    setFeil(null);
    setLagret(false);

    const forrige = status;
    setStatus((prev) => prev.map((g) => (g.gruppeId === gruppeId ? { ...g, [SCOPE_FELT[scope]]: nyVerdi } : g)));

    startTransition(async () => {
      const svar =
        modus.type === "foresatt"
          ? await settDelingsSamtykkeForBarn(modus.childId, scope, gruppeId, nyVerdi)
          : nyVerdi
            ? await giDelingsSamtykke(scope, gruppeId)
            : await trekkDelingsSamtykke(scope, gruppeId);
      if (!svar.ok) {
        setStatus(forrige);
        setFeil(svar.feil);
        return;
      }
      setLagret(true);
    });
  }

  const noeDelt = status.some((g) => g.testResultater || g.stats);

  return (
    <section className="fop-kort" aria-label="Deling med eksterne miljøer">
      <div className="fop-sek-topp">
        <h2>Deling med eksterne miljøer</h2>
        <StatusPille tone={noeDelt ? "ok" : "neutral"}>{noeDelt ? "På" : "Av"}</StatusPille>
      </div>
      <p className="fop-note">
        Miljøer som Team Norway og WANG kan be om innsyn i testresultater og statistikk. Ingenting deles uten samtykke her.
        Gruppemedlemskap alene gir aldri deling, og du kan ombestemme deg når som helst.
      </p>

      {modus.type === "spiller" && krevesForesatt && (
        <p className="fop-personvern">
          Du er under 16 år. En foresatt må godkjenne delingen i foreldreportalen før noe deles. Du kan alltid slå det av selv.
        </p>
      )}

      {status.length === 0 ? (
        <p className="fop-note">
          Ingen eksterne miljøer har bedt om innsyn ennå. Når et miljø får lesetilgang til en av gruppene, dukker valget opp her.
        </p>
      ) : (
        status.map((gruppe) => (
          <div key={gruppe.gruppeId} className="fop-gruppe">
            <strong>{gruppe.gruppeNavn}</strong>
            {(Object.keys(SCOPE_FELT) as EmbedScope[]).map((scope) => {
              const tekst = DELING_SAMTYKKE_TEKST[scope];
              const erPaa = gruppe[SCOPE_FELT[scope]];
              return (
                <div key={scope} className="fop-bryter">
                  <div>
                    <b>{tekst.tittel}</b>
                    <small>{tekst.forklaring}</small>
                  </div>
                  <FoToggle
                    on={erPaa}
                    label={`${tekst.tittel}, ${gruppe.gruppeNavn}`}
                    disabled={pending}
                    onChange={(v) => endre(gruppe.gruppeId, scope, v)}
                  />
                </div>
              );
            })}
          </div>
        ))
      )}

      <p className="fop-status" role="status">
        {pending ? "Lagrer …" : feil ? feil : lagret ? "Samtykke lagret. Endringen er logget." : "Endringer logges i revisjonsloggen."}
      </p>
    </section>
  );
}
