"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Delingssamtykke til tredjepart (plan T8) — Team Norway-/WANG-lesere.
 *
 * Én komponent for begge flater: spilleren selv (/portal/meg/innstillinger/
 * personvern) og foresatt (/forelder/samtykke, per barn). Teksten hentes fra
 * DELING_SAMTYKKE_TEKST — samme kilde som versjonen som lagres, så det som
 * vises og det som kan bevises er alltid det samme.
 *
 * Mindreårige ser bryterne, men kan ikke slå dem PÅ selv (FORESATT-kravet
 * håndheves i server-laget) — å slå AV skal alltid være mulig (art. 7-3).
 * Mønster: HelseSamtykkeKort.
 */

import { useState, useTransition } from "react";
import { Kort, Icon, StatusPill } from "@/components/v2";
import { Bryter } from "@/components/v2/skjema";
import { DELING_SAMTYKKE_TEKST, type DelingScope } from "@/lib/deling/samtykke-regler";
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

const SCOPE_FELT: Record<DelingScope, "testResultater" | "stats"> = {
  TEST_RESULTATER: "testResultater",
  STATS: "stats",
};

export function DelingSamtykkeKort({
  grupper,
  krevesForesatt = false,
  modus,
}: DelingSamtykkeKortProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(grupper);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  function endre(gruppeId: string, scope: DelingScope, nyVerdi: boolean) {
    if (pending) return;
    // Spiller under 16 kan ikke slå PÅ selv — foresatt gjør det i foreldreportalen.
    if (modus.type === "spiller" && krevesForesatt && nyVerdi) return;
    setFeil(null);
    setLagret(false);

    const forrige = status;
    setStatus((prev) =>
      prev.map((g) =>
        g.gruppeId === gruppeId ? { ...g, [SCOPE_FELT[scope]]: nyVerdi } : g,
      ),
    );

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
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: TL.dim,
            border: `1px solid ${TL.hair}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Icon name="share-2" size={16} style={{ color: TL.mute }} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: TL.font.sans,
                fontSize: 16,
                fontWeight: 700,
                color: TL.text,
                letterSpacing: "-0.02em",
              }}
            >
              Deling med eksterne miljøer
            </span>
            <StatusPill tone={noeDelt ? "up" : "info"}>{noeDelt ? "På" : "Av"}</StatusPill>
          </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "6px 0 0", lineHeight: 1.5 }}>
            Miljøer som Team Norway og WANG kan be om innsyn i testresultater og
            statistikk. Ingenting deles uten samtykke her — gruppemedlemskap
            alene gir aldri deling, og du kan ombestemme deg når som helst.
          </p>
        </div>
      </div>

      {modus.type === "spiller" && krevesForesatt && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginTop: 14,
            padding: "11px 13px",
            borderRadius: 12,
            background: TL.dock,
            border: `1px solid ${TL.hair}`,
          }}
        >
          <Icon name="shield" size={15} style={{ color: TL.mute, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
            Du er under 16 år. En foresatt må godkjenne delingen i
            foreldreportalen før noe deles. Du kan alltid slå det av selv.
          </span>
        </div>
      )}

      {status.length === 0 ? (
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "14px 0 0", lineHeight: 1.5 }}>
          Ingen eksterne miljøer har bedt om innsyn ennå. Når et miljø får
          lesetilgang til en av gruppene dine, dukker valget opp her.
        </p>
      ) : (
        status.map((gruppe) => (
          <div
            key={gruppe.gruppeId}
            style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${TL.hair}` }}
          >
            <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text }}>
              {gruppe.gruppeNavn}
            </div>
            {(Object.keys(SCOPE_FELT) as DelingScope[]).map((scope) => {
              const tekst = DELING_SAMTYKKE_TEKST[scope];
              return (
                <div key={scope} style={{ marginTop: 12 }}>
                  <Bryter
                    label={tekst.tittel}
                    sub={tekst.forklaring}
                    checked={gruppe[SCOPE_FELT[scope]]}
                    onChange={(v) => endre(gruppe.gruppeId, scope, v)}
                  />
                </div>
              );
            })}
          </div>
        ))
      )}

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${TL.hair}`,
          fontFamily: TL.font.sans,
          fontSize: 11.5,
          color: feil ? TL.danger : lagret ? TL.ok : TL.mute,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {lagret && !feil && <Icon name="check-circle" size={13} style={{ color: TL.ok }} />}
        <span>
          {pending
            ? "Lagrer …"
            : feil
              ? feil
              : lagret
                ? "Samtykke lagret. Endringen er logget."
                : "Endringer logges i revisjonsloggen."}
        </span>
      </div>
    </Kort>
  );
}
