import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnArbeidskontekst, hentTnProtokollbibliotek } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker } from "./felles";

/**
 * TN-18 Referansenivåer.
 * Fasit: docs/design-system/utkast-tn/plan-fag.html, skjerm Referansenivåer (pakke 5).
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
      <TnSkjermhode overlinje={`Fra protokollkilden · ${versjon}`} tittel="Referansenivåer" ingress="Målverdiene per test og klasse, hentet fra den versjonerte protokollkilden. De endres bare når protokollen får ny versjon." />

      <TnFlatehode tittel="Nivåer per test"><TnPille>Tall fra Team Norway mangler</TnPille></TnFlatehode>
      <TnFlate>
        <div role="table" aria-label="Referansenivåer">
          <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "10px 0", borderBottom: `1px solid ${TN.ink200}` }}>
            {["Test · protokoll", "Minstekrav", "Landslagsmål", "Internasjonalt"].map((k, i) => (
              <TnEtikett key={k} style={{ fontSize: 10.5, textAlign: i > 0 ? "right" : undefined, overflowWrap: "anywhere" }}><span role="columnheader">{k}</span></TnEtikett>
            ))}
          </div>
          {klare.map((r) => (
            <div role="row" key={r.id} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "4px 0", borderBottom: `1px solid ${TN.ink200}`, alignItems: "center" }}>
              <Link role="cell" href={`/team-norway/protokoller/${r.id}`} style={{ minHeight: 44, display: "flex", alignItems: "center", fontSize: 14.5, fontWeight: 700, color: TN.ink900, overflowWrap: "anywhere", minWidth: 0 }}>{r.navn}</Link>
              {[0, 1, 2].map((i) => <span role="cell" key={i} style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14, color: TN.ink500 }}>—</span>)}
            </div>
          ))}
        </div>
        <TnFotnote>A–K-nivåtallene er ikke vedtatt, og landslagsnivået må komme fra Team Norway. Ingen tall lages på antakelse. Minstekrav gjelder uttak, landslagsmål er nivået trenerteamet planlegger mot.</TnFotnote>
      </TnFlate>

      {utkast.length > 0 ? (
        <TnFlate>
          <TnFlatehode tittel="Uten referanse · protokoll i utkast" merknad={String(utkast.length)} />
          {utkast.map((r) => (
            <Link key={r.id} href={`/team-norway/protokoller/${r.id}`} style={{ minHeight: 44, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: `1px solid ${TN.ink200}`, fontSize: 15, fontWeight: 700, color: TN.ink900, overflowWrap: "anywhere" }}>{r.navn}<TnPille tone="amber">Utkast</TnPille></Link>
          ))}
        </TnFlate>
      ) : null}
    </SkjermRamme>
  );
}
