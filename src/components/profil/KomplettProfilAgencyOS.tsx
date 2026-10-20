import { Meta, StatusPille } from "@/components/precision/pa";
import { Dempet, Etikett, Liste, Rad, Seksjon, TallFlis, Verdi } from "@/components/precision/pa-spiller360";
import type { ProfilVisning } from "@/lib/profil-kobling/visning";

/**
 * Komplett spillerprofil i AgencyOS, tegnet med Precision Athletics sine byggeklosser (Seksjon, Liste, Rad,
 * Etikett, TallFlis) slik at den ser ut som resten av Spiller 360. Innholdet kommer ferdig formatert fra
 * `byggProfilVisning`; Team Norway og WANG tegner det samme innholdet med sine egne komponenter.
 */
export function KomplettProfilAgencyOS({ v }: { v: ProfilVisning }) {
  return (
    <div className="a8-stabel">
      <Seksjon k="Identitet" gap={12}>
        <div className="a8-tall-rutenett">
          <TallFlis k="Navn" v={v.navn} />
          {v.identitet.map((f) => <TallFlis key={f.etikett} k={f.etikett} v={f.verdi} />)}
        </div>
      </Seksjon>

      <Seksjon k="Offisielle resultater" meta="BRUTTO SCORE" gap={12}>
        {v.resultater.tom ? <Dempet>{v.resultater.tom}</Dempet> : v.resultater.aar.map((a) => (
          <div key={a.aar} style={{ display: "grid", gap: 6 }}>
            <Meta>{String(a.aar)}</Meta>
            <Liste>
              {a.rader.map((r) => (
                <Rad key={r.id}>
                  <Etikett a={r.navn} sub={`${r.dato} · ${r.klasse} · ${r.kilde}`.toUpperCase()} />
                  <Verdi>{r.plass !== "—" ? `${r.plass}. · ${r.slag}` : r.slag}</Verdi>
                </Rad>
              ))}
            </Liste>
          </div>
        ))}
        {v.resultater.sesonger.length > 0 && (
          <Liste>
            {v.resultater.sesonger.map((s) => (
              <Rad key={s.sesong}>
                <Etikett a={`Sesong ${s.sesong}`} sub={`${s.runder} runder`.toUpperCase()} />
                <Verdi>{`${s.snitt} · ${s.motPar}`}</Verdi>
              </Rad>
            ))}
          </Liste>
        )}
      </Seksjon>

      <Seksjon k="Tester spilleren har registrert" gap={12}>
        {v.tester.tom ? <Dempet>{v.tester.tom}</Dempet> : (
          <Liste>
            {v.tester.rader.map((t) => (
              <Rad key={t.id}>
                <Etikett a={t.navn} sub={`${t.omraade} · ${t.dato} · ${t.antall} ganger`.toUpperCase()} />
                <Verdi>{t.siste}</Verdi>
              </Rad>
            ))}
          </Liste>
        )}
      </Seksjon>

      <Seksjon k="Runder og statistikk" meta="SISTE 12 MÅNEDER" gap={12}>
        {v.runder.tom ? <Dempet>{v.runder.tom}</Dempet> : (
          <div className="a8-tall-rutenett">{v.runder.tall.map((t) => <TallFlis key={t.etikett} k={t.etikett} v={t.verdi} />)}</div>
        )}
        <Meta>{v.runder.merknad}</Meta>
      </Seksjon>

      <Seksjon k="IUP" gap={12}>
        {v.iup.tom && <Dempet>{v.iup.tom}</Dempet>}
        {v.iup.levert.length > 0 && (
          <Liste>
            {v.iup.levert.map((x) => (
              <Rad key={x.id}>
                <Etikett a={x.svar} sub={`${x.periode} · levert ${x.levert}`.toUpperCase()} />
                {x.advarsel ? <StatusPille tone="warn">Avviker fra kilden</StatusPille> : <Verdi>Levert</Verdi>}
              </Rad>
            ))}
          </Liste>
        )}
        {v.iup.maaltall && (
          <>
            <Meta>{v.iup.maaltall.tittel.toUpperCase()}</Meta>
            <Liste>
              {v.iup.maaltall.rader.map((m) => (
                <Rad key={m.id}>
                  <Etikett a={m.navn} sub={`K1 ${m.kvartaler[0]} · K2 ${m.kvartaler[1]} · K3 ${m.kvartaler[2]} · K4 ${m.kvartaler[3]} · ÅRET ${m.aar}`.toUpperCase()} />
                  <Verdi>{m.mal === "—" ? "—" : `Mål ${m.mal}`}</Verdi>
                </Rad>
              ))}
            </Liste>
          </>
        )}
      </Seksjon>
    </div>
  );
}
