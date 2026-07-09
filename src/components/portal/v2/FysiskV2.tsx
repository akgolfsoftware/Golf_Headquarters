"use client";

/**
 * PlayerHQ Fysisk logging — v2 (retning C «Presis»). Komponert av de porterte
 * fysisk-primitivene i src/components/v2/fysisk.tsx (SettRepsLogger, TonnasjeHero,
 * IntervallBlokk, PulsSoneVelger, FysOktKort) med EKTE data fra getFysiskData
 * (src/lib/portal-fysisk/fysisk-data.ts). Kun v2-komponenter fra "@/components/v2";
 * ingen ad-hoc UI, ingen rå hex (kun T.*-tokens).
 *
 * Ærlighet fremfor mockup-fasade:
 *  - TonnasjeHero vises kun når det faktisk er logget sett (tonnasje > 0) —
 *    beregnet fra loggSettData, aldri et lagret felt.
 *  - «sist»-spøkelsesverdier og auto-progresjons-anbefaling har ingen datakilde
 *    ennå → utelatt (meldt som gap), ikke fabrikkert.
 *  - Mangler spilleren fysisk plan/økt: ærlig tom-tilstand.
 *
 * V2Shell (montert i (v2preview)/v2-fysisk/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import type { FysiskViewData } from "@/lib/portal-fysisk/fysisk-data";
import {
  T,
  Caps,
  Tittel,
  StatusPill,
  Kort,
  TomTilstand,
  SettRepsLogger,
  TonnasjeHero,
  IntervallBlokk,
  PulsSoneVelger,
  FysOktKort,
  FYS_TYPER,
} from "@/components/v2";

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export function FysiskV2({ data }: { data: FysiskViewData }) {
  const mobile = useMobile();
  const { spillerNavn, okt } = data;

  // Hode — tom eller med økt.
  const typeLabel = okt?.type ? FYS_TYPER[okt.type].l : "Fysisk";

  if (!okt) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Fysisk trening</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={spillerNavn.split(" ")[0]}>Fysisk ·</Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="dumbbell"
            title="Ingen fysisk økt planlagt"
            sub="Coachen bygger den fysiske planen i Workbench — da dukker sett, tonnasje og intervaller opp her."
          />
        </Kort>
      </div>
    );
  }

  const harInnhold = okt.styrke.length > 0 || okt.intervaller.length > 0;
  const domSone = okt.intervaller[0]?.sone ?? "S3";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{`${okt.planNavn} · ${okt.ukeLabel}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={okt.navn}>{`${typeLabel} ·`}</Tittel>
          </div>
        </div>
        {okt.varighetMin != null && <StatusPill tone="info">{`${okt.varighetMin} min`}</StatusPill>}
      </div>

      {/* Tonnasje-hero — kun når det faktisk er logget sett (beregnet fra loggSettData) */}
      {okt.tonnasje > 0 && (
        <TonnasjeHero
          tonnasje={okt.tonnasje}
          sett={okt.settTotalt}
          reps={okt.repsTotalt}
          delta=""
          sub="Beregnet fra loggede sett — mates inn i ACWR og ukevolum"
        />
      )}

      {!harInnhold && (
        <Kort>
          <TomTilstand
            icon="list"
            title="Ingen øvelser i økta ennå"
            sub="Coachen legger til styrkeøvelser og intervaller i Workbench."
          />
        </Kort>
      )}

      {/* Styrke — én logger per øvelse (sett × reps) */}
      {okt.styrke.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Caps>Styrke · logg sett × reps</Caps>
          {okt.styrke.map((o) => (
            <SettRepsLogger
              key={o.id}
              ovelse={o.navn}
              muskelgrupper={o.muskelgrupper}
              del=""
              sist={o.sist}
              startSett={o.startSett}
              vektSteg={o.vektSteg}
            />
          ))}
        </div>
      )}

      {/* Kondisjon — intervall-blokker + målsone */}
      {okt.intervaller.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap }}>
          <Kort eyebrow="Kondisjon · intervaller">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {okt.intervaller.map((iv) => (
                <IntervallBlokk
                  key={iv.id}
                  navn={iv.navn}
                  serier={iv.serier}
                  minutter={iv.minutter}
                  sone={iv.sone}
                  pause={iv.pause || "—"}
                />
              ))}
            </div>
          </Kort>
          <Kort eyebrow="Målsone">
            <PulsSoneVelger valgt={domSone} />
          </Kort>
        </div>
      )}

      {/* Øktene denne uka — FysOktKort-brikker (kilde for Workbench-lerretet) */}
      {okt.ukensOkter.length > 0 && (
        <Kort eyebrow="Økter denne uka" action={<Caps size={9}>{`${okt.ukensOkter.length} økter`}</Caps>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {okt.ukensOkter.map((o) => (
              <FysOktKort
                key={o.id}
                tittel={o.tittel}
                type={o.type}
                varighet={o.varighet}
                muskelgrupper={o.muskelgrupper}
              />
            ))}
          </div>
        </Kort>
      )}
    </div>
  );
}
