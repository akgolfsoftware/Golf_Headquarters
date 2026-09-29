import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentSamtykker } from "@/app/team-wang/_data/wang-admin-data";
import { lesSamtykkeFilter, passerSamtykkeFilter, SAMTYKKE_STATUS_NAVN, type SamtykkeFilter, type SamtykkeStatus } from "@/app/team-wang/_data/wang-admin-regler";
import s from "@/app/team-wang/_components/wang-admin-logginn/admin.module.css";
import { WangChips, WangDemoMerknad, WangSide, WangSidehode, WangStatus, WangTom, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-34 Samtykkeoversikt. Fasit: «WANG Golf Elevprofil.dc.html» (#samtykke).
 * Bare Sportssjef. Data: aktive elever i WANG-gruppen og delingssamtykkene
 * deres mot gruppen (DelingsSamtykke, nyeste rad per scope vinner, under 16
 * teller bare foresatt — samme regel som innsynet, samtykke-regler.ts).
 *
 * Avvik fra tegningen:
 *  - «Invitert» og «Inviter til PlayerHQ» er ikke med: invitasjoner til
 *    PlayerHQ lagres ikke per elev. Tallet vises som «—».
 *  - Team Norway-kortet («Testresultater deles automatisk») er ikke med. I koden
 *    er gruppemedlemskap aldri delingsgrunnlag; hver deling krever samtykke.
 */
const TONE: Record<SamtykkeStatus, WangStatusTone> = { delt: "ferdig", venter: "pagar", trukket: "fravaer", ikke: "fravaer" };

export default async function WangAdminSamtykkeSide({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangSportssjef();
  const filter = lesSamtykkeFilter((await searchParams).status);
  const elever = await hentSamtykker(gruppe.id);

  const antall = (f: SamtykkeFilter) => elever.filter((e) => passerSamtykkeFilter(e.status, f)).length;
  const nDelt = antall("delt");
  const liste = elever.filter((e) => passerSamtykkeFilter(e.status, filter));
  const filtre: Array<[SamtykkeFilter, string]> = [["alle", "Alle"], ["delt", "Delt"], ["venter", "Venter på forelder"], ["ikke", "Ikke delt"]];

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-34" undertittel={`Administrasjon · ${gruppe.name}`} tittel="Samtykkeoversikt" ingress="Hvem som har delt med WANG fra PlayerHQ." />
      {erDemo ? <WangDemoMerknad /> : null}
      {elever.length === 0 ? (
        <section className={s.kort}>
          <WangTom tittel="Ingen elever i gruppen" tekst={`Det står ingen aktive elever i ${gruppe.name}. Når elevene er lagt inn, vises delingsstatusen deres her.`} />
        </section>
      ) : (
        <div className={s.stabel} style={{ gap: 20 }}>
          <div className={s.to}>
            <section className={`${s.kort} ${s.sumKort}`}>
              <div className={s.sumTopp}>
                <span className={s.sumTall}>{`${nDelt} av ${elever.length}`}</span>
                <span className={s.sumTekst}>elever har delt med WANG</span>
              </div>
              <div className={s.fordeling}>
                <div><WangStatus tone="ferdig">Delt</WangStatus><span className={s.fordelingTall}>{nDelt}</span></div>
                <div><WangStatus tone="pagar">Venter på forelder</WangStatus><span className={s.fordelingTall}>{antall("venter")}</span></div>
                <div><WangStatus tone="fravaer">Ikke delt</WangStatus><span className={s.fordelingTall}>{antall("ikke")}</span></div>
                <div><WangStatus tone="planlagt">Invitert</WangStatus><span className={s.fordelingTall} title="Invitasjoner lagres ikke per elev">—</span></div>
              </div>
            </section>
          </div>
          <WangChips
            etikett="Status"
            valg={filtre.map(([k, etikett]) => ({ href: k === "alle" ? wangHref("WANG-34") : wangHref("WANG-34", {}, { status: k }), etikett, aktiv: filter === k }))}
          />
          <section className={s.kort}>
            <div className={`${s.r4} ${s.head}`} aria-hidden="true">
              <span>Elev</span>
              <span>Status</span>
              <span>Detalj</span>
            </div>
            {liste.length === 0 ? (
              <p className={s.tomRad}>Ingen elever med denne statusen.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Elever og delingsstatus">
                {liste.map((e) => (
                  <li key={e.userId} className={s.r4}>
                    <span className={s.full}>
                      <span className={s.elevNavn}>{e.navn}</span>
                      <span className={s.elevMeta}>{e.alder !== null ? `${gruppe.name} · ${e.alder} år` : gruppe.name}</span>
                    </span>
                    <span><WangStatus tone={TONE[e.status]}>{SAMTYKKE_STATUS_NAVN[e.status]}</WangStatus></span>
                    <span className={`${s.detalj} ${s.full}`}>{e.detalj}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className={s.smatekst}>
            Eleven deler fra PlayerHQ. Under 16 år godkjenner forelder. Trekker eleven delingen, forsvinner eleven fra trenerens lister med en gang, og det som er ført blir hos eleven.
          </p>
        </div>
      )}
    </WangSide>
  );
}
