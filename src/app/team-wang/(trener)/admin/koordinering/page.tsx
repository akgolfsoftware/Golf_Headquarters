import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { AdminMangler } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import s from "@/app/team-wang/_components/wang-admin-logginn/admin.module.css";
import { WangDemoMerknad, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-33 Koordinering mellom skoler. Fasit: «WANG Golf Batch 12.dc.html»
 * (#koordinering). Bare Sportssjef. Felles side for alle WANG-skoler
 * (beslutninger.md §WANG: FEM ANSATTROLLER, 26.09.2026).
 *
 * Kontaktloggen lagrer ALDRI meldingsinnhold: bare hvem, fra hvilken skole,
 * når og med hvem (elev eller foresatt). Stjernemarkering per skole og
 * kontaktloggen finnes ikke i basen ennå, så siden er tom.
 *
 * Avvik fra tegningen: «Tråd mellom sportssjefene» (fritekst mellom skolene)
 * er ikke bygget. Den ville lagret meldingsinnhold på koordineringssiden, som
 * bestillingen sier den aldri skal. Den venter på Anders' avklaring.
 */
export default async function WangAdminKoordineringSide() {
  const { erDemo } = await krevWangSportssjef();

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-33" undertittel="Felles for alle WANG-skoler" tittel="Koordinering mellom skoler" />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.stabel}>
        <section className={s.kort}>
          <div className={s.prinsipp}>
            <p className={s.prinsippTittel}>Flaten fordeler ikke.</p>
            <p className={s.prinsippTekst}>
              Den som tok kontakt først, «har» ikke kandidaten. Rekkefølgen vises fordi den er et faktum. Vurderingstall, notater og skolekarakterer vises bare for egen skole. Kandidat og foresatt ser aldri denne siden.
            </p>
          </div>
        </section>
        <section className={s.kort}>
          <div className={s.kortHode}>
            <h2 className={s.h2}>Kandidater flere skoler har merket</h2>
            <span className={s.telling}>0 kandidater</span>
          </div>
          <WangTom
            tittel="Ingen kandidater å koordinere"
            tekst="Her vises hver kandidat som mer enn én WANG-skole har stjernemerket, i rekkefølgen skolene merket, og kontaktloggen: hvem, fra hvilken skole, når og med hvem. Aldri innholdet."
          />
          <AdminMangler
            punkter={[
              "Stjernemarkering per skole og kandidat, med dato og hvem som merket",
              "Kontaktlogg per kandidat: skole, person, tidspunkt og mottaker (elev eller foresatt). Aldri meldingsinnhold",
              "De andre WANG-skolene som egne enheter med egen sportssjef",
            ]}
          />
        </section>
      </div>
    </WangSide>
  );
}
