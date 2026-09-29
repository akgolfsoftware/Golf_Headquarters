import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentBesattePlasser } from "@/app/team-wang/_data/wang-admin-data";
import { skolearKort, TRINN } from "@/app/team-wang/_data/wang-admin-regler";
import { AdminMangler, AdminUavklart } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import s from "@/app/team-wang/_components/wang-admin-logginn/admin.module.css";
import { WangDemoMerknad, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";

/**
 * WANG-32 Plasser. Fasit: «WANG Golf Batch 12.dc.html» (#plasser).
 * Bare Sportssjef. Ekte data: besatte plasser = aktive elever i WANG-gruppen
 * per trinn (User.schoolYear), for skoleåret som går nå.
 *
 * Avvik fra tegningen: rammen (totalt antall plasser), ventelisten, neste
 * skoleår, WANG Ung og de andre WANG-skolene finnes ikke i basen. De vises
 * som «—», og «Endre ramme» er ikke med.
 */
export default async function WangAdminPlasserSide() {
  const { gruppe, erDemo } = await krevWangSportssjef();
  const besatt = await hentBesattePlasser(gruppe.id);
  const skolear = skolearKort(new Date());

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-32" undertittel={gruppe.name} tittel="Plasser" />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.stabel}>
        <p className={s.brodtekst}>{`Skoleåret ${skolear} er i gang. Besatt er elevene som står i ${gruppe.name} nå, fordelt på trinnet som er registrert på eleven.`}</p>
        <AdminUavklart>Hvem som fører dette ved skolen er ikke avklart. Foreløpig står skjermen for sportssjef.</AdminUavklart>
        <section className={s.kort}>
          <div className={s.kortHode}>
            <h2 className={s.h2}>{`${gruppe.name} · ${skolear}`}</h2>
          </div>
          {besatt.totalt === 0 ? (
            <WangTom tittel="Ingen elever i gruppen" tekst={`Det står ingen aktive elever i ${gruppe.name}. Når elevene er lagt inn, telles de her per trinn.`} />
          ) : (
            <div role="table" aria-label={`Plasser per trinn i ${gruppe.name}`}>
              <div role="row" className={`${s.prow} ${s.phead}`}>
                <span role="columnheader">Trinn</span>
                <span role="columnheader">Totalt</span>
                <span role="columnheader">Besatt</span>
                <span role="columnheader">Ledige</span>
                <span role="columnheader">Vente­liste</span>
              </div>
              {TRINN.map((t) => (
                <div role="row" key={t} className={s.prow}>
                  <span role="cell" className={s.pTrinn}>{t}</span>
                  <span role="cell" className={s.fet}>—</span>
                  <span role="cell">{besatt.perTrinn[t]}</span>
                  <span role="cell">—</span>
                  <span role="cell">—</span>
                </div>
              ))}
              {besatt.utenTrinn > 0 ? (
                <div role="row" className={s.prow}>
                  <span role="cell" style={{ display: "grid", gap: 3 }}>
                    <span className={s.pTrinn}>Uten trinn</span>
                    <span className={s.mrowUnder}>Trinnet er ikke registrert på eleven</span>
                  </span>
                  <span role="cell" className={s.fet}>—</span>
                  <span role="cell">{besatt.utenTrinn}</span>
                  <span role="cell">—</span>
                  <span role="cell">—</span>
                </div>
              ) : null}
            </div>
          )}
          <AdminMangler
            punkter={[
              "Ramme per skole, trinn og skoleår (totalt antall plasser), som kan endres til opptaket lukkes",
              "Venteliste per trinn, koblet til kandidatene i rekrutteringen",
              "De andre WANG-skolene og WANG Ung (8.–10. trinn) som egne enheter",
            ]}
          />
        </section>
      </div>
    </WangSide>
  );
}
