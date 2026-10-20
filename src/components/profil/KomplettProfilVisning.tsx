import type { KomplettProfil } from "@/lib/profil-kobling/komplett";
import { tilTurneringer } from "@/lib/profil-kobling/til-turneringer";
import { lesTurneringsresultat, resultatKilde } from "@/lib/domain/turneringsresultat";
import type { LevertIupProfilrad } from "@/lib/iup/trener-profil-lesing";
import s from "./komplett-profil.module.css";

/**
 * Komplett spillerprofil for trenere (AgencyOS, WANG, Team Norway): identitet, offisielle resultater,
 * tester og IUP. Ren visning av `KomplettProfil`; tilgang og henting skjer før dette. Brutto score alltid.
 * Ingenting vises som et tall uten grunnlag: manglende data sier det rett ut.
 */

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
const aarFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/Oslo" });
const tall1 = (n: number | null, d = 1) => (n == null ? "—" : n.toFixed(d).replace(".", ","));
const sg = (n: number | null) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}`);
const motPar = (n: number | null) => (n == null ? "—" : n > 0 ? `+${n}` : String(n));

const IUP_TYPE: Record<LevertIupProfilrad["type"], string> = {
  UTVIKLINGSSJEKK: "Utviklingssjekk",
  SESONGEVALUERING: "Sesongevaluering",
};

export function KomplettProfilVisning({ profil, lenkeTester }: {
  profil: KomplettProfil;
  /** Team Norway-protokollene har egne enheter; miljøet kan lenke til sin egen testside. */
  lenkeTester?: string;
}) {
  const r = profil.resultater;
  const turneringer = r ? tilTurneringer(r.turneringer).sort((a, b) => b.start.getTime() - a.start.getTime()) : [];
  const perAar = new Map<number, typeof turneringer>();
  for (const t of turneringer) {
    const aar = Number(aarFmt.format(t.start));
    perAar.set(aar, [...(perAar.get(aar) ?? []), t]);
  }

  return (
    <div className={s.rot}>
      <section className={s.seksjon} aria-label="Identitet">
        <dl className={s.identitet}>
          <div><dt>Navn</dt><dd>{profil.navn}</dd></div>
          <div><dt>Født</dt><dd>{r?.person.birth_year ?? "—"}</dd></div>
          {r?.golf_id && (
            <div><dt>Golf-ID</dt><dd>{r.golf_id.length ? r.golf_id.join(", ") : "—"}</dd></div>
          )}
        </dl>
      </section>

      <section className={s.seksjon} aria-label="Offisielle resultater">
        <h2>Offisielle resultater</h2>
        {!r ? (
          <p className={s.tom}>Spilleren har ikke koblet resultatprofilen sin ennå. Spillere fra 16 år kobler seg selv; for yngre spillere kobler treneren i AgencyOS.</p>
        ) : turneringer.length === 0 ? (
          <p className={s.tom}>Ingen registrerte turneringer ennå.</p>
        ) : (
          [...perAar.entries()].map(([aar, liste]) => (
            <div key={aar}>
              <p className={s.aar}>{aar}</p>
              <div className={s.rullbar}>
                <table className={s.tabell}>
                  <thead>
                    <tr><th>Dato</th><th>Turnering</th><th>Klasse</th><th className={s.tall}>Plass</th><th className={s.tall}>Slag</th><th>Kilde</th></tr>
                  </thead>
                  <tbody>
                    {liste.map((t) => {
                      const res = lesTurneringsresultat(t.resultat);
                      return (
                        <tr key={t.id}>
                          <td>{dato.format(t.start)}</td>
                          <td>{t.navn}</td>
                          <td>{t.klasse ?? "—"}</td>
                          <td className={s.tall}>{res.plasseringTekst ?? "—"}</td>
                          <td className={s.tall}>{res.brutto != null ? `${res.brutto} (${motPar(res.motPar)})` : "—"}</td>
                          <td>{resultatKilde(t.kilde)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
        {r && r.sesonger.length > 0 && (
          <div className={s.rullbar}>
            <table className={s.tabell}>
              <caption className={s.kilde}>Sesonger, brutto</caption>
              <thead><tr><th>Sesong</th><th className={s.tall}>Runder</th><th className={s.tall}>Snitt</th><th className={s.tall}>Mot par</th></tr></thead>
              <tbody>
                {r.sesonger.map((x) => (
                  <tr key={x.year}><td>{x.year}</td><td className={s.tall}>{x.runder}</td><td className={s.tall}>{tall1(x.snitt_score)}</td><td className={s.tall}>{tall1(x.snitt_til_par)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={s.seksjon} aria-label="Tester">
        <h2>Tester spilleren har registrert</h2>
        {profil.tester.length === 0 ? (
          <p className={s.tom}>Ingen registrerte tester.</p>
        ) : (
          <div className={s.rullbar}>
            <table className={s.tabell}>
              <thead><tr><th>Test</th><th>Område</th><th className={s.tall}>Siste</th><th>Dato</th><th className={s.tall}>Antall</th></tr></thead>
              <tbody>
                {profil.tester.map((t) => (
                  <tr key={t.testId}>
                    <td>{t.navn}</td>
                    <td>{t.omraade}</td>
                    <td className={s.tall}>{t.sisteScore != null ? tall1(t.sisteScore, 1) : t.erTeamNorway ? "se TN" : "—"}</td>
                    <td>{dato.format(t.sisteDato)}</td>
                    <td className={s.tall}>{t.antall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lenkeTester && profil.tester.some((t) => t.erTeamNorway) && (
          <p className={s.kilde}><a href={lenkeTester}>Team Norway-protokollene med riktige enheter</a></p>
        )}
      </section>

      <section className={s.seksjon} aria-label="Runder og statistikk">
        <h2>Runder og statistikk, siste 12 måneder</h2>
        {profil.runder.antall === 0 ? (
          <p className={s.tom}>Ingen runder delt med trener.</p>
        ) : (
          <dl className={s.identitet}>
            <div><dt>Runder</dt><dd>{profil.runder.antall}</dd></div>
            <div><dt>Snitt brutto</dt><dd>{tall1(profil.runder.snittScore)}</dd></div>
            <div><dt>SG totalt</dt><dd>{sg(profil.runder.sgTotal)}</dd></div>
            <div><dt>SG utslag</dt><dd>{sg(profil.runder.sgOtt)}</dd></div>
            <div><dt>SG innspill</dt><dd>{sg(profil.runder.sgApp)}</dd></div>
            <div><dt>SG nærspill</dt><dd>{sg(profil.runder.sgArg)}</dd></div>
            <div><dt>SG putting</dt><dd>{sg(profil.runder.sgPutt)}</dd></div>
          </dl>
        )}
        <p className={s.kilde}>Bare runder spilleren har delt med trener. Runder merket «Bare deg» er ikke med.</p>
      </section>

      <section className={s.seksjon} aria-label="IUP">
        <h2>IUP</h2>
        {!profil.iup ? (
          <p className={s.tom}>Spilleren har ikke IUP. Den gjelder aktive WANG- og Team Norway-spillere.</p>
        ) : (
          <>
            {profil.iup.levert.length === 0 ? (
              <p className={s.tom}>Ingen leverte IUP-svar ennå. Utkast vises aldri.</p>
            ) : (
              <div className={s.rullbar}>
                <table className={s.tabell}>
                  <thead><tr><th>Svar</th><th>Periode</th><th>Levert</th></tr></thead>
                  <tbody>
                    {profil.iup.levert.map((x) => (
                      <tr key={x.id}>
                        <td>
                          {IUP_TYPE[x.type]}
                          {x.kildeEllerFormatAvviker && <p className={s.advarsel}>Innholdet avviker fra kilden og vises ikke.</p>}
                        </td>
                        <td>{x.periodeStart} – {x.periodeSlutt}</td>
                        <td>{dato.format(new Date(x.levert))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {profil.iup.maaltall && (
              <div className={s.rullbar}>
                <table className={s.tabell}>
                  <caption className={s.kilde}>Måltall {profil.iup.maaltall.sesong.navn} · {profil.iup.maaltall.org}</caption>
                  <thead><tr><th>Måltall</th><th className={s.tall}>K1</th><th className={s.tall}>K2</th><th className={s.tall}>K3</th><th className={s.tall}>K4</th><th className={s.tall}>Året</th><th className={s.tall}>Mål</th></tr></thead>
                  <tbody>
                    {profil.iup.maaltall.rader.map((m) => (
                      <tr key={m.id}>
                        <td>{m.navn}</td>
                        {m.kvartaler.map((k, i) => <td key={i} className={s.tall}>{tall1(k, 1)}</td>)}
                        <td className={s.tall}>{tall1(m.aar, 1)}</td>
                        <td className={s.tall}>{m.mal ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
