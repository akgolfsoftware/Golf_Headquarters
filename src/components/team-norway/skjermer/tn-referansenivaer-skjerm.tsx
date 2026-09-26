import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnArbeidskontekst, hentTnProtokollbibliotek } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-18 Referansenivåer.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-18.
 *
 * Avvik:
 *   - Minstekrav, landslagsmål og internasjonalt nivå finnes ikke i
 *     protokollkilden eller noen annen modell. Kolonnene står med strek til
 *     nivåene er lagt inn — målavstandene i protokollen er ikke nivåkrav og
 *     vises ikke som det (den gamle skjermen gjorde det).
 *   - Klassevalget er tatt bort: uten nivåer er det ingenting å skille på.
 *     Protokoller med egne varianter for gutter og jenter står hver for seg.
 */

const KOLONNER = "minmax(0, 1fr) repeat(3, minmax(64px, 110px))";

export async function TnReferansenivaerSkjerm() {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) notFound();
  const { versjon, rader } = hentTnProtokollbibliotek();
  const klare = rader.filter((r) => r.status === "KLAR");
  const utkast = rader.filter((r) => r.status === "UTKAST");

  return (
    <SkjermRamme aktiv="referansenivaer" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute="/team-norway/referansenivaer" tittel="Referansenivåer" ingress="Målverdiene per test og klasse, hentet fra den versjonerte protokollkilden. De endres bare når protokollen får ny versjon." />

      <TnFlate>
        <TnFlatehode tittel="Nivåer per test" merknad={versjon} />
        <TnMangler>Ingen referansenivåer er lagt inn ennå. Minstekrav, landslagsmål og internasjonalt nivå må registreres per test og klasse før de kan vises her.</TnMangler>
        <div role="table" aria-label="Referansenivåer" style={{ marginTop: 16 }}>
          <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "10px 0", borderBottom: `1px solid ${TN.navy100}` }}>
            {["Test · protokoll", "Minstekrav", "Landslagsmål", "Internasjonalt"].map((k, i) => (
              <TnEtikett key={k} style={{ fontSize: 10.5, textAlign: i > 0 ? "right" : undefined, overflowWrap: "anywhere" }}><span role="columnheader">{k}</span></TnEtikett>
            ))}
          </div>
          {klare.map((r) => (
            <div role="row" key={r.id} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "4px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }}>
              <Link role="cell" href={`/team-norway/protokoller/${r.id}`} style={{ minHeight: 44, display: "flex", alignItems: "center", fontSize: 14.5, fontWeight: 700, color: TN.textPrimary, overflowWrap: "anywhere", minWidth: 0 }}>{r.navn}</Link>
              {[0, 1, 2].map((i) => <span role="cell" key={i} style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14, color: TN.textSecondary }}>—</span>)}
            </div>
          ))}
        </div>
        <TnFotnote>Minstekrav gjelder uttak. Landslagsmål er nivået trenerteamet planlegger mot. Internasjonalt er sammenligningsnivået ute. Trykk på en test for å se protokollen.</TnFotnote>
      </TnFlate>

      {utkast.length > 0 ? (
        <TnFlate>
          <TnFlatehode tittel="Uten referanse · protokoll i utkast" merknad={String(utkast.length)} />
          {utkast.map((r) => (
            <Link key={r.id} href={`/team-norway/protokoller/${r.id}`} style={{ minHeight: 44, display: "flex", alignItems: "center", borderBottom: `1px solid ${TN.navy100}`, fontSize: 14.5, color: TN.textPrimary, overflowWrap: "anywhere" }}>{r.navn}</Link>
          ))}
        </TnFlate>
      ) : null}
    </SkjermRamme>
  );
}
