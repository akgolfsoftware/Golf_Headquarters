import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { AdminInfo, AdminMangler, AdminUavklart } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import s from "@/app/team-wang/_components/wang-admin-logginn/admin.module.css";
import { WangDemoMerknad, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-31 Rekruttering. Fasit: «WANG Golf Batch 12.dc.html» (#rekruttering).
 * Bare Sportssjef.
 *
 * Basen har ingen kandidater, ingen rekrutteringsstatus og ingen vurderinger,
 * så lista er tom og arket vises med «—». Arkets oppbygning (fag, punkter,
 * maks og statusrekkefølge) er kopiert fra tegningen. Ingen tall oppdiktes.
 */
const FAG = ["Matematikk", "Norsk (snitt)", "Engelsk (snitt)", "Samfunnsfag", "Naturfag"];
const PUNKT = ["Idrettslig nivå", "Tekn. ferd.", "Fys. ferd.", "Mental ferd.", "Konk.", "Talentkriterier"];
const STATUSER = ["Stjernemerket", "Kontaktet", "Tilbud sendt", "Takket ja", "Takket nei"];

export default async function WangAdminRekrutteringSide() {
  const { gruppe, erDemo } = await krevWangSportssjef();

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-31" undertittel={`${gruppe.name} · Opptak`} tittel="Rekruttering" />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.stabel}>
        <div className={s.toInfo}>
          <AdminInfo>Summen rangerer lista for lesbarhet. Den avgjør ingenting. Skjermen viser aldri et opptaksvedtak.</AdminInfo>
          <AdminUavklart>Uavklart: om en skole kan ha egne punkter i tillegg til det felles arket. Skjermen viser bare det felles arket.</AdminUavklart>
        </div>
        <div className={s.split}>
          <section className={s.kort}>
            <div className={s.kortHode}>
              <h2 className={s.h2}>Kandidater</h2>
              <span className={s.telling}>0 kandidater</span>
            </div>
            <WangTom
              tittel="Ingen kandidater er registrert"
              tekst="Rekrutteringslista kan ikke føres ennå. Når kandidatene kan lagres, vises de her med status og poengsum fra arket."
            />
            <AdminMangler
              punkter={[
                "Kandidat per opptak: fødselsår, trinn det søkes til og kobling til turneringsbasen",
                `Status per skole med dato og hvem som satte den (${STATUSER.join(" → ")})`,
                "Vurdering per skole: karakterer i blokk 1, punkter i blokk 2, vurdert av og dato",
                "Notat som bare sportssjefen ved egen skole ser",
              ]}
            />
          </section>
          <section className={s.kort} aria-label="Vurderingsarket">
            <div className={s.kortHode}>
              <h2 className={s.h2}>Vurderingsarket</h2>
              <span className={s.telling}>Felles for alle WANG-skoler</span>
            </div>
            <div className={s.blokk}>
              <div className={s.blokkHode}>
                <span className={s.blokkTittel}>Blokk 1 · Skolenivå</span>
                <span className={s.dato}>Karakterer</span>
              </div>
              {FAG.map((f) => (
                <div key={f} className={s.vrow}><span>{f}</span><span>—</span></div>
              ))}
              <div className={s.vrow}><span className={s.fet}>Poengsum</span><span className={s.fet}>—</span></div>
            </div>
            <div className={s.blokk}>
              <div className={s.blokkHode}>
                <span className={s.blokkTittel}>Blokk 2 · Idrettslig forutsetning</span>
                <span className={s.dato}>Maks 60 · hvert punkt 1–10</span>
              </div>
              {PUNKT.map((p) => (
                <div key={p} className={s.vrow}><span>{p}</span><span>—</span></div>
              ))}
              <div className={s.vrow}><span className={s.fet}>Poengsum</span><span className={s.fet}>—</span></div>
            </div>
            <div className={s.blokk} style={{ background: "var(--wtr-blue-tint)" }}>
              <div className={s.blokkHode}>
                <span className={`${s.blokkTittel} ${s.fet}`}>Totalsum</span>
                <span className={s.sumTall} style={{ fontSize: 32 }}>—</span>
              </div>
              <span className={s.dato}>Totalsum vises når begge blokkene har poengsum. Underlag, ikke vedtak.</span>
            </div>
          </section>
        </div>
      </div>
    </WangSide>
  );
}
