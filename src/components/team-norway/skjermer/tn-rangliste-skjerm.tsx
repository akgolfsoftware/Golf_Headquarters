import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnRangliste } from "@/lib/domain/tn-arbeidsflate";
import { sorterRangliste, type TnRanglisteSortering } from "@/lib/domain/tn-rangliste";
import { TnFilterknapper, TnFlate, TnFotnote, TnMangler, TnSkjermhode } from "../tn-flate";
import { SkjermRamme, hentSkjermbruker, osloDag } from "./felles";
import u from "./tn-uttak.module.css";

/**
 * TN-16 Rangliste.
 * Fasit: docs/design-system/utkast-tn/uttak.html, skjerm Rangliste (pakke 4).
 *
 * Avvik:
 *   - Klassefilteret (U16/U18/U21, Herrer/Damer) finnes ikke: spillerprofilen har
 *     ikke kjønn, og ranglisten leser ikke fødselsdato.
 *   - Ranglisten gjelder inneværende år, ikke siste tolv måneder.
 *   - Spillere som ikke er koblet til en offentlig spillerprofil står nederst med strek.
 */

const tall1 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const tall2 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SORTERINGER: [TnRanglisteSortering, string][] = [["brutto", "Brutto snitt"], ["plass", "Snittplassering"], ["starter", "Flest starter"]];

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
      <TnSkjermhode
        overlinje={`Resultatgrunnlag · sesongen ${aar}`}
        tittel="Rangliste"
        ingress="Bare brutto. Spillere uten koblet resultatprofil står nederst."
        handling={<TnFilterknapper etikett="Sorter ranglisten" valg={SORTERINGER.map(([id, label]) => ({ href: `/team-norway/rangliste?sort=${id}`, label, aktiv: id === sortering }))} />}
      />

      <TnFlate>
        {rader.length > 0 ? (
          <div className={u.rl} role="table" aria-label={`Rangliste ${aar}`}>
            <div className={u.hode} role="row">
              {["Plass", "Spiller", "Klubb", "Starter", "Snittplass", "Brutto snitt"].map((k) => <span key={k} role="columnheader">{k}</span>)}
            </div>
            {rader.map((r, i) => (
              <div role="row" key={r.id} className={u.rad}>
                <span role="cell" className={u.plass}>{r.starter > 0 ? i + 1 : "—"}</span>
                <span role="cell"><Link href={`/team-norway/spiller/${r.id}/oversikt`} className={u.navn}>{r.navn}</Link></span>
                <span role="cell" className={u.tall}>{r.bruttoSnitt === null ? "—" : tall2.format(r.bruttoSnitt)}</span>
                <span className={u.ekstra}>
                  <span role="cell" className={u.klubb}>{r.koblet ? (r.klubb ?? "Klubb ikke registrert") : "Ikke koblet til resultatprofil"}</span>
                  <span role="cell"><em>Starter </em>{r.starter > 0 ? r.starter : "—"}</span>
                  <span role="cell"><em>Snittplass </em>{r.snittplassering === null ? "—" : tall1.format(r.snittplassering)}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <TnMangler>Ingen spillere i gruppen ennå. Ranglisten fylles når spillerne er lagt inn og koblet til resultatene sine.</TnMangler>
        )}
        <TnFotnote>{medStart} av {rader.length} har start i {aar}. Brutto snitt er ekte slag per runde. Snittplassering regnes bare der plasseringen bygger på brutto, aldri i nettoklasser. Netto er filtrert bort.</TnFotnote>
      </TnFlate>
    </SkjermRamme>
  );
}
