import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnRangliste } from "@/lib/domain/tn-arbeidsflate";
import { sorterRangliste, type TnRanglisteSortering } from "@/lib/domain/tn-rangliste";
import { TN } from "@/lib/v2/team-norway";
import { TnEtikett, TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker, osloDag } from "./felles";

/**
 * TN-16 Rangliste.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-16.
 *
 * Avvik:
 *   - Klassefilteret (Herrer/Damer) finnes ikke: spillerprofilen har ikke kjønn.
 *   - Spillere som ikke er koblet til en offentlig spillerprofil har ingen
 *     resultater å hente. De står nederst med strek og merknaden «ikke koblet».
 */

const tall1 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const tall2 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SORTERINGER: [TnRanglisteSortering, string][] = [["brutto", "Brutto snitt"], ["plass", "Snittplassering"], ["starter", "Flest starter"]];
const KOLONNER = "28px minmax(0, 1fr) 48px 60px 64px";

export async function TnRanglisteSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const aar = osloDag(new Date()).aar;
  const data = await hentTnRangliste(bruker, aar);
  if (!data || data.kontekst.erSpiller) notFound();

  const sortering: TnRanglisteSortering = sokeparametre.sort === "plass" || sokeparametre.sort === "starter" ? sokeparametre.sort : "brutto";
  const rader = sorterRangliste(data.rader, sortering);
  const medStart = rader.filter((r) => r.starter > 0).length;

  return (
    <SkjermRamme aktiv="rangliste" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode rute="/team-norway/rangliste" tittel="Rangliste" ingress={`Alle landslagsspillere med antall starter, snittplassering og brutto snitt i ${aar}. Netto regnes ikke.`} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <TnEtikett>Sorter</TnEtikett>
        <TnFilterknapper etikett="Sorter ranglisten" valg={SORTERINGER.map(([id, label]) => ({ href: `/team-norway/rangliste?sort=${id}`, label, aktiv: id === sortering }))} />
      </div>

      <TnFlate>
        <TnFlatehode tittel={`Rangliste · sesongen ${aar}`} merknad={`Kun brutto · ${medStart} av ${rader.length} med start`} />
        {rader.length > 0 ? (
          <div role="table" aria-label={`Rangliste ${aar}`}>
            <div role="row" style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "10px 0", borderBottom: `1px solid ${TN.navy100}` }}>
              {["#", "Spiller", "Starter", "Snittpl.", "Brutto"].map((k, i) => (
                <TnEtikett key={k} style={{ fontSize: 10.5, textAlign: i >= 2 ? "right" : undefined }}><span role="columnheader">{k}</span></TnEtikett>
              ))}
            </div>
            {rader.map((r, i) => (
              <div role="row" key={r.id} style={{ display: "grid", gridTemplateColumns: KOLONNER, gap: 10, padding: "12px 0", borderBottom: `1px solid ${TN.navy100}`, alignItems: "center" }}>
                <span role="cell" style={{ fontFamily: TN.font.mono, fontSize: 13, color: TN.textSecondary }}>{r.starter > 0 ? i + 1 : "—"}</span>
                <span role="cell" style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                  <span className="hidden sm:inline-flex"><TnInitialer navn={r.navn} storrelse={32} /></span>
                  <span style={{ minWidth: 0 }}>
                    <Link href={`/team-norway/spiller/${r.id}`} style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: TN.textPrimary, overflowWrap: "anywhere" }}>{r.navn}</Link>
                    <span style={{ display: "block", fontSize: 12.5, color: TN.textSecondary, overflowWrap: "anywhere" }}>{r.koblet ? (r.klubb ?? "Klubb ikke registrert") : "Ikke koblet til resultatprofil"}</span>
                  </span>
                </span>
                <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14 }}>{r.starter > 0 ? r.starter : "—"}</span>
                <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14 }}>{r.snittplassering === null ? "—" : tall1.format(r.snittplassering)}</span>
                <span role="cell" style={{ textAlign: "right", fontFamily: TN.font.mono, fontSize: 14 }}>{r.bruttoSnitt === null ? "—" : tall2.format(r.bruttoSnitt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <TnMangler>Ingen spillere i gruppen ennå. Ranglisten fylles når spillerne er lagt inn og koblet til resultatene sine.</TnMangler>
        )}
        <TnFotnote>Brutto snitt er ekte slag per runde i {aar}. Snittplassering regnes bare der plasseringen bygger på brutto, aldri i nettoklasser. Spillere uten start står nederst med strek.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
