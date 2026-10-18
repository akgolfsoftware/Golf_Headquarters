/**
 * PlayerHQ Perioden er ferdig (/portal/planlegge/periode-ferdig/[periodeId]) — nytt design, pakke 17b
 * (utkast 1, 16.10.2026). Fasit: docs/design-system/utkast-playerhq/plan-hjelpere.html, «Perioden er ferdig».
 * Vises for alle perioder som er over (vedtak 16.10), ikke bare fire ukers planer. Varselet «Du fullførte
 * planen», som før gikk til «feiring», peker hit. Regler: lib/portal-plan/periode-ferdig.ts.
 *
 * Avvik:
 *   - «Din evaluering» kan ikke lagres: perioden har ikke noe felt for spillerens evaluering. Skjermen viser
 *     notatet på perioden når det finnes, og «Skriv evalueringen til coachen» åpner en ny melding.
 *   - Periodenavnet står uten nummer («Grunnperiode», ikke «Grunnperiode 1»).
 *   - «Runder» teller registrerte runder i perioden, ikke bare runder ført slag for slag.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PERIODE_AKSER, timerTekst, type PeriodeTall } from "@/lib/portal-plan/periode-ferdig";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-plan-hjelpere.css";

export type PHPeriodeFerdigData = {
  navn: string; tidsrom: string; ferdig: string;
  tall: PeriodeTall;
  runder: number; nyeMal: number;
  notat: string | null;
  neste: { navn: string; start: string; href: string } | null;
  periodeHref: string;
};

function Topp() {
  return <div className="topp">
    <Link className="tilbake" href="/portal/planlegge"><ChevronLeft size={18} aria-hidden />Plan</Link>
  </div>;
}

export function PHPeriodeFerdig({ data }: { data: PHPeriodeFerdigData | null }) {
  if (!data) {
    return <div className="phn phn-meg phn-ph"><div className="side">
      <Topp />
      <div><div className="phn-dato">Plan · perioder</div><h1 className="phn-tittel">Perioden er ferdig</h1></div>
      <div className="phn-kort dempet">
        <b className="phn-undertittel">Ingen periode er ferdig ennå</b>
        <p className="phn-forklar">Når en periode i årsplanen er over, ser du her hvor mye av planlagt tid du gjennomførte.</p>
        <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/planlegge">Til Plan</Link></div>
      </div>
    </div></div>;
  }

  const t = data.tall;
  return <div className="phn phn-meg phn-ph"><div className="side">
    <Topp />
    <section className="ph-ferdig-topp" aria-label={`${data.navn} er ferdig`}>
      <div className="phn-dato">{data.navn} · {data.tidsrom} · ferdig {data.ferdig}</div>
      <div className="phn-hoved"><strong>{t.pct == null ? "—" : `${t.pct} %`}</strong><span className="phn-forklar">av planlagt tid gjennomført</span></div>
      <p className="phn-forklar">
        {t.plan > 0 ? `${timerTekst(t.gjort)} av ${timerTekst(t.plan)}.` : "Ingen økter lå i planen i perioden."}
        {data.neste ? ` Neste periode, ${data.neste.navn}, startet ${data.neste.start}.` : ""}
      </p>
    </section>
    <div className="to-del">
      <div>
        <section className="phn-seksjon" aria-labelledby="ph-pf-akse">
          <div className="phn-sek-topp"><h2 id="ph-pf-akse">Per akse</h2><span className="phn-kilde">Gjennomført / planlagt</span></div>
          <div className="ph-akse-tabell">
            {PERIODE_AKSER.map((a) => {
              const v = t.perAkse[a];
              const bredde = v.plan > 0 ? Math.min(100, Math.round((v.gjort / v.plan) * 100)) : 0;
              return <div key={a} className="r">
                <b>{a}</b>
                <span className="spor" aria-hidden><span className={a.toLowerCase()} style={{ width: `${bredde}%` }} /></span>
                <span className="v">{v.plan > 0 ? `${timerTekst(v.gjort)} / ${timerTekst(v.plan)}` : "—"}</span>
              </div>;
            })}
          </div>
          <p className="phn-kilde">Fra øktene i planen · gjennomført tid mot planlagt, også økter som ble hoppet over.</p>
        </section>
        <div className="ph-beholder">
          <div><b>{t.okterGjort}</b><span>av {t.okterTotalt} økter</span></div>
          <div><b>{data.runder}</b><span>{data.runder === 1 ? "runde registrert" : "runder registrert"}</span></div>
          <div><b>{data.nyeMal}</b><span>{data.nyeMal === 1 ? "ny målsetning" : "nye målsetninger"}</span></div>
        </div>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="ph-pf-eval">
          <div className="phn-sek-topp"><h2 id="ph-pf-eval">Evalueringen</h2></div>
          {data.notat
            ? <div className="ph-sitat"><b>Notat på perioden</b>{data.notat}</div>
            : <p className="phn-forklar">Ingen notat på perioden. Hva gikk bra, og hva tar du med videre?</p>}
          <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/coach/melding/ny">Skriv evalueringen til coachen</Link></div>
        </section>
        {data.neste
          ? <Link className="phn-knapp pri stor" href={data.neste.href}>Åpne {data.neste.navn}</Link>
          : <Link className="phn-knapp pri stor" href={data.periodeHref}>Åpne perioden i Plan</Link>}
      </div>
    </div>
  </div></div>;
}
