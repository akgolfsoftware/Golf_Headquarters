"use client";

/**
 * PlayerHQ Fysisk — v2 Presis + B-pakke (status + logg, tom = én grønn vei).
 * Ekte data fra getFysiskData. SettRepsLogger m.m. fra v2/fysisk.
 */

import { useEffect, useState } from "react";
import type { FysiskViewData } from "@/lib/portal-fysisk/fysisk-data";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  StatusPill,
  Kort,
  TomTilstand,
  CTAPill,
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
        <div className="grid grid-cols-3" style={{ gap: 8 }}>
          {(
            [
              { l: "Økt", v: "—" },
              { l: "Tonnasje", v: "—" },
              { l: "Status", v: "Ingen" },
            ] as const
          ).map((k) => (
            <Kort key={k.l} pad="12px">
              <Caps size={9}>{k.l}</Caps>
              <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, marginTop: 8, color: T.fg }}>{k.v}</div>
            </Kort>
          ))}
        </div>
        <Kort>
          <TomTilstand
            icon="dumbbell"
            title="Ingen fysisk økt planlagt"
            sub="Planlegg fysisk i Workbench — da dukker sett, tonnasje og intervaller opp her."
          />
        </Kort>
        <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="calendar" full>
            Åpne Workbench
          </CTAPill>
        </Link>
        <Link
          href="/portal/gjennomfore"
          style={{
            textDecoration: "none",
            display: "block",
            textAlign: "center",
            fontFamily: T.ui,
            fontSize: 12,
            fontWeight: 600,
            color: T.mut,
          }}
        >
          Tilbake til Gjør →
        </Link>
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

      {/* B: status-rad */}
      <div className="grid grid-cols-3" style={{ gap: 8 }}>
        {(
          [
            { l: "Sett", v: String(okt.settTotalt) },
            { l: "Reps", v: String(okt.repsTotalt) },
            { l: "Tonnasje", v: okt.tonnasje > 0 ? String(Math.round(okt.tonnasje)) : "—" },
          ] as const
        ).map((k) => (
          <Kort key={k.l} pad="12px">
            <Caps size={9}>{k.l}</Caps>
            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 16, marginTop: 8, color: T.fg }}>{k.v}</div>
          </Kort>
        ))}
      </div>

      {/* Tonnasje-hero — kun når det faktisk er logget sett */}
      {okt.tonnasje > 0 && (
        <TonnasjeHero
          tonnasje={okt.tonnasje}
          sett={okt.settTotalt}
          reps={okt.repsTotalt}
          delta=""
          sub="Beregnet fra loggede sett — mates inn i ACWR og ukevolum"
          hjelp
        />
      )}

      {!harInnhold && (
        <Kort>
          <TomTilstand
            icon="list"
            title="Ingen øvelser i økta ennå"
            sub="Legg til styrke og intervaller i Workbench."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="calendar" full>
                Åpne Workbench
              </CTAPill>
            </Link>
          </div>
        </Kort>
      )}

      {harInnhold && (
        <Caps style={{ color: T.mut }}>Logg under — lagres når du fyller sett</Caps>
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
