import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { FysRegistrer } from "@/components/wang/tester-konkurranse/fys-registrer";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangChips, WangDemoMerknad, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { hentElever, hentFysDefinisjoner, hentFysMalinger } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, enhetFraRegel, forsteParam } from "@/lib/wang/tester-konkurranse/format";
import { byggFysKort, FYS_KILDE } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

/**
 * WG-03 Fysiske tester. Tegning: «WANG Golf.dc.html» #tester.
 * Ekte data: de fysiske testene i katalogen (FYS, felles) og elevens egne
 * resultater. Ingen normtall — sammenligning bare mot egne målinger.
 */
export default async function WangFysiskeTesterSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const sok = await searchParams;
  const [elever, defs] = await Promise.all([hentElever(gruppe.id), hentFysDefinisjoner()]);

  const onsket = forsteParam(sok.elev);
  const elev = elever.find((e) => e.id === onsket) ?? elever[0] ?? null;
  const malinger = elev && defs.length ? await hentFysMalinger(elev.id, defs.map((d) => d.id)) : [];
  const kort = defs.map((d) => byggFysKort(d, malinger.filter((m) => m.testId === d.id).map((m) => ({ dato: m.takenAt, score: m.score }))));
  const sisteDato = malinger.at(-1)?.takenAt ?? null;

  return (
    <WangSide>
      <WangSidehode
        skjermId="WG-03"
        undertittel={`${FYS_KILDE}${sisteDato ? ` · siste måling ${datoTekst(sisteDato)}` : ""}`}
        tittel="Fysiske tester"
      />
      {erDemo ? <WangDemoMerknad /> : null}

      {elever.length === 0 ? (
        <WangKort>
          <WangTom tittel="Ingen elever i gruppa ennå" tekst="Når elevene er lagt inn i WANG-gruppa, kan du føre og følge de fysiske testene deres her." />
        </WangKort>
      ) : (
        <>
          <WangChips
            etikett="Velg elev"
            valg={elever.map((e) => ({ href: wangHref("WG-03", {}, { elev: e.id }), etikett: e.klasse ? `${e.navn} · ${e.klasse}` : e.navn, aktiv: e.id === elev?.id }))}
          />
          <div className={s.split}>
            <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
              {defs.length === 0 ? (
                <WangKort>
                  <WangTom tittel="Ingen fysiske tester i katalogen" tekst="Testkatalogen har ingen fysiske tester ennå. Den eies felles for hele AK Golf HQ." />
                </WangKort>
              ) : (
                kort.map((k) => (
                  <article key={k.testId} className={s.fysKort}>
                    <div style={{ display: "grid", gap: 6, alignSelf: "start", minWidth: 0 }}>
                      <p className={s.fysNavn}>{k.navn}</p>
                      <p className={s.fysVerdi}>
                        <span className={s.fysTall}>{k.verdi}</span>
                        {k.enhet ? <span className={s.fysEnhet}>{k.enhet}</span> : null}
                      </p>
                      <p className={s.fysVurdering}>{k.vurdering}</p>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      {k.soyler.length > 0 ? (
                        <>
                          <div className={s.soyler} role="img" aria-label={`${k.navn}: ${k.soyler.map((b) => `${b.etikett} ${b.tekst} ${k.enhet}`).join(", ")}`}>
                            {k.soyler.map((b, i) => (
                              <div key={i} className={s.soyle}>
                                <span className={s.soyleTekst}>{b.tekst}</span>
                                <div className={b.siste ? s.soyleSiste : s.soyleAnnen} style={{ height: `${b.hoydeProsent}%` }} />
                              </div>
                            ))}
                          </div>
                          <div className={s.soyleEtiketter} aria-hidden="true">
                            {k.soyler.map((b, i) => <span key={i} className={s.soyleEtikett}>{b.etikett}</span>)}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
              <p className={s.fot}>Søylene er elevens egne målinger over tid. Fysiske tester er ikke i NGF-arket, og det finnes ingen normtall å sammenligne med.</p>
            </div>
            {elev && defs.length > 0 ? (
              <FysRegistrer
                elever={elever.map((e) => ({ id: e.id, navn: e.navn }))}
                tester={defs.map((d) => ({ id: d.id, navn: d.name, enhet: enhetFraRegel(d.scoringRule) ?? "" }))}
                valgtElev={elev.id}
                iDag={datoTekst(new Date())}
              />
            ) : null}
          </div>
        </>
      )}
    </WangSide>
  );
}
