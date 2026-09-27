import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnGruppeanalyseValg, hentTnGruppeanalyseResultat } from "@/lib/domain/tn-arbeidsflate";
import { TnShell, TnSidehode, TnSeksjon, TnTomtilstand } from "@/components/team-norway/tn-shell";
import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TN } from "@/lib/v2/team-norway";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

function rolleNavn(rolle: string) {
  if (rolle === "COACH") return "Trener";
  if (rolle === "ASSISTANT") return "Hjelpetrener";
  if (rolle === "PLAYER") return "Spiller";
  return rolle;
}

function statusTekst(status: "PENDING" | "SKIPPED" | "ABSENT" | "DONE" | "IKKE_TESTDAG"): string {
  if (status === "PENDING") return "Ikke ført ennå";
  if (status === "SKIPPED") return "Hoppet over";
  if (status === "ABSENT") return "Ikke møtt";
  if (status === "IKKE_TESTDAG") return "Ingen resultat på protokollen";
  return "Ukjent";
}

// minWidth:0 hindrer <select> med lange protokollnavn fra å presse raden
// utenfor 390px — uten den vinner selectens egen innholdsbredde over flex.
const feltStil: React.CSSProperties = { minHeight: 44, minWidth: 0, maxWidth: "100%", padding: "0 12px", border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.navy900, fontSize: TN.text.sm };

/**
 * TN-utvidelse 14.09.2026: gruppeanalyse gjelder ALLTID en valgt testdag
 * (faktiske deltakere) eller en valgt protokoll (beste resultat per aktiv
 * spiller på nøyaktig den protokollen) — aldri en sammenslått, tverr-
 * protokoll "gruppescore". Manglende data vises som «Ukjent», ikke 0.
 */
export default async function GruppeanalysePage({ searchParams }: { searchParams: Promise<{ protokoll?: string; dag?: string }> }) {
  const sp = await searchParams;
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const valg = await hentTnGruppeanalyseValg(bruker);
  if (!valg) notFound();

  const resultat = sp.protokoll || sp.dag
    ? await hentTnGruppeanalyseResultat(bruker, { protokollId: sp.protokoll, testDayId: sp.dag })
    : null;
  const ugyldigValg = (sp.protokoll || sp.dag) && !resultat;

  return (
    <TnShell aktiv="analyse" brukerNavn={bruker.name ?? "Ukjent"} rolle={rolleNavn(valg.kontekst.rolle)} groupId={valg.kontekst.gruppe.id} visTrenerflater={!valg.kontekst.erSpiller} kanAdministrere={valg.kontekst.kanAdministrere}>
      <TnSidehode overlinje="Gruppeanalyse" tittel="Sammenlign kompatible målinger" ingress="Velg én testdag eller én protokoll. Ulike protokoller blandes aldri i samme sammenligning." />

      <TnSeksjon tittel="Velg grunnlag">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <form method="get" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
            <label style={{ fontSize: TN.text.sm, color: TN.textSecondary, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              Testdag
              <select name="dag" defaultValue={sp.dag ?? ""} style={feltStil}>
                <option value="">Velg testdag</option>
                {valg.testdager.map((d) => <option key={d.id} value={d.id}>{d.title} · {dato.format(d.scheduledAt)}</option>)}
              </select>
            </label>
            <button type="submit" style={{ ...feltStil, fontWeight: TN.weight.semibold, cursor: "pointer" }}>Vis</button>
          </form>
          <form method="get" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
            <label style={{ fontSize: TN.text.sm, color: TN.textSecondary, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              Protokoll
              <select name="protokoll" defaultValue={sp.protokoll ?? ""} style={feltStil}>
                <option value="">Velg protokoll</option>
                {valg.protokoller.map((p) => <option key={p.id} value={p.id}>{p.navn}</option>)}
              </select>
            </label>
            <button type="submit" style={{ ...feltStil, fontWeight: TN.weight.semibold, cursor: "pointer" }}>Vis</button>
          </form>
        </div>
      </TnSeksjon>

      {ugyldigValg && <TnTomtilstand tittel="Fant ikke grunnlaget" tekst="Testdagen eller protokollen finnes ikke, eller hører ikke til denne gruppen." />}

      {resultat && (
        <TnSeksjon
          tittel={resultat.protokollNavn}
          forklaring={`${resultat.lowerIsBetter ? "Lavere tall er bedre." : "Høyere tall er bedre."} Grunnlag: ${resultat.grunnlag.type === "testdag" ? `testdagen «${resultat.grunnlag.navn}»` : `beste gyldige resultat per spiller på protokollen`}${resultat.grunnlag.dato ? " · " + dato.format(resultat.grunnlag.dato) : ""}.`}
        >
          <TnDataTable
            caption={resultat.protokollNavn}
            kolonner={[{ key: "spiller", label: "Spiller" }, { key: "score", label: "Resultat", align: "right" }]}
            rader={resultat.rader.map((rad) => ({
              spiller: <Link href={`/team-norway/spiller/${rad.spillerId}/oversikt`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{rad.spillerNavn}</Link>,
              score: rad.formatert ?? statusTekst(rad.status),
            }))}
            empty="Ingen spillere i grunnlaget."
          />
        </TnSeksjon>
      )}

      {!resultat && !ugyldigValg && <TnTomtilstand tittel="Velg en testdag eller en protokoll" tekst="Ingenting sammenlignes før du har valgt et konkret grunnlag over." />}
    </TnShell>
  );
}
