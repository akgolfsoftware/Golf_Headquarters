import Link from "next/link";
import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TnNokkeltall, TnSeksjon, TnTomtilstand } from "@/components/team-norway/tn-shell";
import { TN } from "@/lib/v2/team-norway";
import type { ProfilVisning } from "@/lib/profil-kobling/visning";

/**
 * Komplett spillerprofil i Team Norway, tegnet med TNs egne komponenter (TnSeksjon, TnDataTable, TnNokkeltall,
 * TnTomtilstand) i TNs farger og skrifter. Innholdet kommer ferdig formatert fra `byggProfilVisning`.
 */
export function KomplettProfilTn({ v, testerHref }: { v: ProfilVisning; testerHref: string }) {
  return (
    <>
      <TnSeksjon tittel="Identitet">
        <TnNokkeltall tall={[{ etikett: "Navn", verdi: v.navn }, ...v.identitet.map((f) => ({ etikett: f.etikett, verdi: f.verdi }))]} />
      </TnSeksjon>

      <TnSeksjon tittel="Offisielle resultater" forklaring="Brutto score. Samme kilde for AgencyOS, WANG og Team Norway.">
        {v.resultater.tom ? <TnTomtilstand tittel="Ingen resultater å vise" tekst={v.resultater.tom} /> : v.resultater.aar.map((a) => (
          <TnDataTable
            key={a.aar}
            caption={String(a.aar)}
            kolonner={[
              { key: "dato", label: "Dato" }, { key: "turnering", label: "Turnering" }, { key: "klasse", label: "Klasse" },
              { key: "plass", label: "Plass", align: "right" }, { key: "slag", label: "Slag", align: "right" }, { key: "kilde", label: "Kilde" },
            ]}
            rader={a.rader.map((r) => ({ dato: r.dato, turnering: r.navn, klasse: r.klasse, plass: r.plass, slag: r.slag, kilde: r.kilde }))}
          />
        ))}
        {v.resultater.sesonger.length > 0 && (
          <TnDataTable
            caption="Sesonger, brutto"
            kolonner={[{ key: "sesong", label: "Sesong" }, { key: "runder", label: "Runder", align: "right" }, { key: "snitt", label: "Snitt", align: "right" }, { key: "motPar", label: "Mot par", align: "right" }]}
            rader={v.resultater.sesonger.map((s) => ({ ...s }))}
          />
        )}
      </TnSeksjon>

      <TnSeksjon tittel="Tester spilleren har registrert">
        {v.tester.tom ? <TnTomtilstand tittel="Ingen tester" tekst={v.tester.tom} /> : (
          <TnDataTable
            caption="Tester"
            kolonner={[{ key: "test", label: "Test" }, { key: "omraade", label: "Område" }, { key: "siste", label: "Siste", align: "right" }, { key: "dato", label: "Dato" }, { key: "antall", label: "Antall", align: "right" }]}
            rader={v.tester.rader.map((t) => ({ test: t.navn, omraade: t.omraade, siste: t.siste, dato: t.dato, antall: t.antall }))}
          />
        )}
        {v.tester.harTeamNorway && (
          <p style={{ margin: "8px 0 0", fontSize: 14 }}><Link href={testerHref} style={{ color: TN.navy900, fontWeight: TN.weight.bold }}>Team Norway-protokollene med riktige enheter</Link></p>
        )}
      </TnSeksjon>

      <TnSeksjon tittel="Runder og statistikk" forklaring={v.runder.merknad}>
        {v.runder.tom ? <TnTomtilstand tittel="Ingen runder" tekst={v.runder.tom} /> : <TnNokkeltall tall={v.runder.tall} />}
      </TnSeksjon>

      <TnSeksjon tittel="IUP">
        {v.iup.tom && <TnTomtilstand tittel="Ingen IUP å vise" tekst={v.iup.tom} />}
        {v.iup.levert.length > 0 && (
          <TnDataTable
            caption="Leverte IUP-svar"
            kolonner={[{ key: "svar", label: "Svar" }, { key: "periode", label: "Periode" }, { key: "levert", label: "Levert" }]}
            rader={v.iup.levert.map((x) => ({ svar: x.advarsel ? `${x.svar}: ${x.advarsel}` : x.svar, periode: x.periode, levert: x.levert }))}
          />
        )}
        {v.iup.maaltall && (
          <TnDataTable
            caption={v.iup.maaltall.tittel}
            kolonner={[{ key: "navn", label: "Måltall" }, { key: "k1", label: "K1", align: "right" }, { key: "k2", label: "K2", align: "right" }, { key: "k3", label: "K3", align: "right" }, { key: "k4", label: "K4", align: "right" }, { key: "aar", label: "Året", align: "right" }, { key: "mal", label: "Mål", align: "right" }]}
            rader={v.iup.maaltall.rader.map((m) => ({ navn: m.navn, k1: m.kvartaler[0], k2: m.kvartaler[1], k3: m.kvartaler[2], k4: m.kvartaler[3], aar: m.aar, mal: m.mal }))}
          />
        )}
      </TnSeksjon>
    </>
  );
}
