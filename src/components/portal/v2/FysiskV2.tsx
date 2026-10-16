"use client";

import type { FysiskViewData } from "@/lib/portal-fysisk/fysisk-data";
import Link from "next/link";
import { Dumbbell, List } from "lucide-react";
import { SettRepsLogger, TonnasjeHero, IntervallBlokk, PulsSoneVelger, FysOktKort, FYS_TYPER } from "@/components/v2";
import { StatusPille, TomTilstand } from "@/components/precision/pa";

export function FysiskV2({ data }: { data: FysiskViewData }) {
  const { spillerNavn, okt } = data;
  const typeLabel = okt?.type ? FYS_TYPER[okt.type].l : "Fysisk";

  if (!okt) {
    return (
      <div className="ph26f" data-od-id="playerhq-fys-plan">
        <header>
          <p className="ph26f-kicker">Fysisk trening</p>
          <h1>FYS</h1>
          <p>{spillerNavn}</p>
        </header>
        <div className="ph26f-kpi">
          {[["Økt", "—"], ["Tonnasje", "—"], ["Status", "Ingen"]].map(([l, v]) => (
            <p key={l} className="pa-card"><span>{l}</span><strong>{v}</strong></p>
          ))}
        </div>
        <TomTilstand icon={Dumbbell} title="Ingen fysisk økt planlagt" text="Planlegg fysisk i Workbench — da dukker sett, tonnasje og intervaller opp her." />
        <Link href="/portal/planlegge/workbench?zoom=uke" className="pa-btn pa-btn--primary pa-btn--full">Åpne Workbench</Link>
        <Link href="/portal/gjennomfore" className="ph26f-tilbake">Tilbake til Gjør</Link>
      </div>
    );
  }

  const harInnhold = okt.styrke.length > 0 || okt.intervaller.length > 0;
  const domSone = okt.intervaller[0]?.sone ?? "S3";

  return (
    <div className="ph26f" data-od-id="playerhq-fys-plan">
      <header className="ph26f-hode">
        <div>
          <p className="ph26f-kicker">{okt.planNavn} · {okt.ukeLabel}</p>
          <h1>{typeLabel} · {okt.navn}</h1>
        </div>
        {okt.varighetMin != null && <StatusPille>{okt.varighetMin} min</StatusPille>}
      </header>
      <div className="ph26f-kpi">
        {[
          ["Sett", String(okt.settTotalt)],
          ["Reps", String(okt.repsTotalt)],
          ["Tonnasje", okt.tonnasje > 0 ? String(Math.round(okt.tonnasje)) : "—"],
        ].map(([l, v]) => (
          <p key={l} className="pa-card"><span>{l}</span><strong>{v}</strong></p>
        ))}
      </div>
      {okt.tonnasje > 0 && (
        <TonnasjeHero tonnasje={okt.tonnasje} sett={okt.settTotalt} reps={okt.repsTotalt} delta="" sub="Beregnet fra loggede sett — mates inn i ACWR og ukevolum" hjelp />
      )}
      {!harInnhold && (
        <>
          <TomTilstand icon={List} title="Ingen øvelser i økta ennå" text="Legg til styrke og intervaller i Workbench." />
          <Link href="/portal/planlegge/workbench?zoom=uke" className="pa-btn pa-btn--primary pa-btn--full">Åpne Workbench</Link>
        </>
      )}
      {harInnhold && <p className="ph26f-kicker">Logg under — lagres når du fyller sett</p>}
      {okt.styrke.length > 0 && (
        <section>
          <p className="ph26f-kicker">Styrke · logg sett × reps</p>
          {okt.styrke.map((o) => (
            <SettRepsLogger key={o.id} ovelse={o.navn} muskelgrupper={o.muskelgrupper} del="" sist={o.sist} startSett={o.startSett} vektSteg={o.vektSteg} prosent1RM={o.prosent1RM} anbefaltKg={o.anbefaltKg} />
          ))}
        </section>
      )}
      {okt.intervaller.length > 0 && (
        <div className="ph26f-kondisjon">
          <section className="pa-card ph26f-kort">
            <p className="ph26f-kicker">Kondisjon · intervaller</p>
            {okt.intervaller.map((iv) => (
              <IntervallBlokk key={iv.id} navn={iv.navn} serier={iv.serier} minutter={iv.minutter} sone={iv.sone} pause={iv.pause || "—"} />
            ))}
          </section>
          <section className="pa-card ph26f-kort">
            <p className="ph26f-kicker">Målsone</p>
            <PulsSoneVelger valgt={domSone} />
          </section>
        </div>
      )}
      {okt.ukensOkter.length > 0 && (
        <section className="pa-card ph26f-kort">
          <p className="ph26f-kicker">Økter denne uka · {okt.ukensOkter.length}</p>
          {okt.ukensOkter.map((o) => (
            <FysOktKort key={o.id} tittel={o.tittel} type={o.type} varighet={o.varighet} muskelgrupper={o.muskelgrupper} />
          ))}
        </section>
      )}
    </div>
  );
}
