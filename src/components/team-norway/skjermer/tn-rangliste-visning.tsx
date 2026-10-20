import Link from "next/link";

import type { hentTnRangliste } from "@/lib/domain/tn-arbeidsflate";
import { sorterRangliste, type TnRanglisteSortering } from "@/lib/domain/tn-rangliste";
import { TnFilterknapper, TnFlate, TnFotnote, TnMangler } from "../tn-flate";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall } from "../tn-stall";
import u from "./tn-uttak.module.css";

/**
 * TN-16 Rangliste.
 * Retning «Skrå» (godkjent 20.10.2026, canvaset tavle 5): bildetopp med antall som har start,
 * og ranglisten som kort over kanten. Tidligere fasit: docs/design-system/utkast-tn/uttak.html (pakke 4).
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


type Hentet<F extends (...a: never[]) => unknown> = Awaited<ReturnType<F>>;

export function TnRanglisteVisning({
  brukerNavn,
  visDataGolf,
  data,
  aar,
  sortering,
}: {
  brukerNavn: string | null;
  visDataGolf: boolean;
  data: NonNullable<Hentet<typeof hentTnRangliste>>;
  aar: number;
  sortering: TnRanglisteSortering;
}) {
  const rader = sorterRangliste(data.rader, sortering);
  const medStart = rader.filter((r) => r.starter > 0).length;

  return (
    <TnShell aktiv="rangliste" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(data.kontekst.rolle)} groupId={data.kontekst.gruppe.id} visTrenerflater={!data.kontekst.erSpiller} kanAdministrere={data.kontekst.kanAdministrere} visDataGolf={!data.kontekst.erSpiller && visDataGolf}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett="Rangliste"
        overlinje={`Resultatgrunnlag · sesongen ${aar}`}
        tittel="Rangliste"
        ingress="Bare brutto. Spillere uten koblet resultatprofil står nederst."
        venstre={<TnHeltTall verdi={medStart} enhet={`/ ${rader.length}`}>har start i {aar}</TnHeltTall>}
      />
      <TnSkraKort>
      <TnFlate>
        <div style={{ marginBottom: 12 }}>
          <TnFilterknapper etikett="Sorter ranglisten" valg={SORTERINGER.map(([id, label]) => ({ href: `/team-norway/rangliste?sort=${id}`, label, aktiv: id === sortering }))} />
        </div>
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
      </TnSkraKort>
    </TnShell>
  );
}
