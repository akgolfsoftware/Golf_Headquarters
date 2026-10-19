/**
 * Approach-skill med Data Golfs egne kildebøtter: fairway 50–100, 100–150, 150–200, 200+ yd
 * og rough under/over 150 yd. Ingen omregning til andre avstandsgrupper, så ingen presisjon
 * diktes opp. Nærhet er omregnet fra fot til meter. Bøtter med få slag merkes som tynt grunnlag.
 */
import { formaterFortegn, formaterProsent, formaterTall } from "@/lib/format-tall";
import { APPROACH_MIN_SLAG, harApproachTall, lesApproachBoetter, type ApproachBoette, type ApproachRaa, type DgVisning } from "@/lib/datagolf/visning";
import { DgRamme } from "./DgRamme";

function Gruppe({ navn, boetter, maks }: { navn: string; boetter: readonly ApproachBoette[]; maks: number }) {
  return <div className="dgk-app-gruppe" role="group" aria-label={navn}>
    <p className="undertittel">{navn}</p>
    {boetter.map(b => {
      const positiv = (b.sgPerSlag ?? 0) >= 0;
      const bredde = b.sgPerSlag === null ? 0 : Math.min(50, (Math.abs(b.sgPerSlag) / maks) * 50);
      return <div key={b.id} className="dgk-app-rad">
        <span className="dgk-app-navn">{b.navn}</span>
        <span className="dgk-sg-spor" aria-hidden>
          {b.sgPerSlag !== null && <i className={positiv ? "pos" : "neg"} style={positiv ? { left: "50%", width: `${bredde}%` } : { right: "50%", width: `${bredde}%` }} />}
        </span>
        <span className="dgk-sg-tall mono" title="SG per slag">{formaterFortegn(b.sgPerSlag, 2)}</span>
        <span className="kilde">Nærhet <span className="mono">{b.naerhetMeter === null ? "—" : `${formaterTall(b.naerhetMeter, 1, true)} m`}</span></span>
        <span className="kilde">GIR <span className="mono">{formaterProsent(b.girPct)}</span></span>
        <span className="kilde"><span className="mono">{b.antallSlag === null ? "—" : formaterTall(b.antallSlag, 0)}</span> slag{b.tyntGrunnlag ? <b className="dgk-tynt"> · tynt grunnlag</b> : null}</span>
      </div>;
    })}
  </div>;
}

export function ApproachSkill({ resultat, tittel = "Approach-skill" }: { resultat: DgVisning<ApproachRaa>; tittel?: string }) {
  const boetter = resultat.tilstand === "klar" ? lesApproachBoetter(resultat.data.payload) : [];
  const harTall = harApproachTall(boetter);
  const tilstand = resultat.tilstand === "klar" && !harTall ? "tom" : resultat.tilstand;
  const maks = Math.max(0.1, ...boetter.map(b => Math.abs(b.sgPerSlag ?? 0)));
  return <DgRamme tittel={tittel} tilstand={tilstand} lasteHoyder={[40, 120, 80]}
    kilde={resultat.tilstand === "klar" && harTall ? `Data Golf · ${resultat.data.period} · per ${resultat.data.asOf}` : undefined}
    tomTittel="Ingen approach-skill" tomTekst="Data Golf har ikke levert approach-tall for denne spilleren, eller datasettet er ikke synket ennå. Ingenting er estimert.">
    {harTall && <>
      <Gruppe navn="Fra fairway" boetter={boetter.filter(b => b.lie === "fairway")} maks={maks} />
      <Gruppe navn="Fra rough" boetter={boetter.filter(b => b.lie === "rough")} maks={maks} />
      <p className="kilde">SG per slag mot proffsnittet. Bøttene er Data Golfs egne avstandsgrupper, uendret. Under {APPROACH_MIN_SLAG} slag er grunnlaget for tynt til å tolke.</p>
    </>}
  </DgRamme>;
}
