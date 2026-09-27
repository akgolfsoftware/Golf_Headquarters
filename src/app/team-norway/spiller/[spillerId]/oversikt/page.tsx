import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTilgang, hentTnSpillerTester, hentTnSpillerLisens, hentTnSpillerAktivePlaner } from "@/lib/domain/tn-arbeidsflate";
import { TnShell, TnMetrikk, TnMetrikkRutenett, TnSeksjon, TnTomtilstand, TnSpillerFaner } from "@/components/team-norway/tn-shell";
import { TN } from "@/lib/v2/team-norway";
import type { TilgangsKilde, TilgangsNivaa } from "@/lib/feature-flags";

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });

function rolleNavn(rolle: string) {
  if (rolle === "COACH") return "Trener";
  if (rolle === "ASSISTANT") return "Hjelpetrener";
  if (rolle === "PLAYER") return "Spiller";
  return rolle;
}

// Menneskelig tekst — aldri systemets rå kodeord (FULL/TALENT/INGEN) rett i UI.
const NIVA_TEKST: Record<TilgangsNivaa, string> = { FULL: "Full tilgang", TALENT: "Gratis (Talent-nivå)", INGEN: "Ingen tilgang" };
const KILDE_TEKST: Record<TilgangsKilde, string> = {
  LANSERING: "lanseringsvinduet", PLAYERHQ_ABONNEMENT: "betalt PlayerHQ-abonnement", COACHING_PAKKE: "coaching-pakke",
  AK_GRUPPE: "AK Golf-administrert gruppe", PROVEPERIODE: "prøveperiode", TALENT_PROFIL: "Talent-profil", INGEN: "ingen aktiv kilde",
};

/**
 * TN-utvidelse 14.09.2026: fast inngangsside per spiller — samler lenker til
 * plan/teknisk/test/analyse/post. Leser eksisterende tilgang (TN-gruppe-
 * medlemskap) FØR data hentes; spillerId fra URL-en er aldri klarert alene.
 * `kreverTilgang: "TALENT"` — samme eksisterende regel som portalens egen
 * testlesing (ingen ny tilgangsregel innføres av denne utvidelsen).
 */
export default async function SpillerOversiktPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "TALENT" });
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) notFound();

  const [tester, lisens, planer] = await Promise.all([
    hentTnSpillerTester(bruker, spillerId),
    tilgang.kontekst.kanAdministrere ? hentTnSpillerLisens(tilgang) : Promise.resolve(null),
    hentTnSpillerAktivePlaner(tilgang),
  ]);

  const sisteDato = tester?.rader.reduce<Date | null>((nyest, rad) => (!nyest || rad.sisteDato > nyest ? rad.sisteDato : nyest), null) ?? null;

  return (
    <TnShell aktiv="spillere" brukerNavn={bruker.name ?? "Ukjent"} rolle={rolleNavn(tilgang.kontekst.rolle)} groupId={tilgang.kontekst.gruppe.id} visTrenerflater={!tilgang.kontekst.erSpiller} kanAdministrere={tilgang.kontekst.kanAdministrere}>
      <TnSpillerFaner spillerId={spillerId} spillerNavn={tilgang.spillerNavn} aktiv="oversikt" kanAdministrere={!tilgang.kontekst.erSpiller} />

      <TnMetrikkRutenett>
        <TnMetrikk etikett="Protokoller testet" verdi={tester?.rader.length ?? 0} />
        <TnMetrikk etikett="Siste test" verdi={sisteDato ? dato.format(sisteDato) : "Ingen"} tone={sisteDato ? "green" : "amber"} />
        {tilgang.kontekst.kanAdministrere && (
          <TnMetrikk
            etikett="PlayerHQ-tilgang"
            verdi={lisens?.status === "ok" ? NIVA_TEKST[lisens.niva] : "Kunne ikke leses akkurat nå"}
            tone={lisens?.status === "ok" && lisens.niva === "FULL" ? "green" : lisens?.status === "ok" && lisens.niva === "TALENT" ? "navy" : "amber"}
            forklaring={lisens?.status === "ok" ? `Kilde: ${KILDE_TEKST[lisens.kilde]}.` : "Statusoppslaget feilet — vis ikke som «ingen tilgang», prøv igjen."}
          />
        )}
      </TnMetrikkRutenett>

      {planer.length > 0 && (
        <TnSeksjon tittel="Aktive planer">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {planer.map((plan) => (
              <div key={plan.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: TN.radius.md, border: `1px solid ${TN.borderSubtle}`, background: TN.white }}>
                <span style={{ fontWeight: TN.weight.semibold, color: TN.navy900 }}>{plan.navn}</span>
                <span style={{ fontSize: TN.text.sm, color: TN.textSecondary }}>{plan.status} · fra {dato.format(plan.startDato)}{plan.sluttDato ? ` til ${dato.format(plan.sluttDato)}` : ""}</span>
              </div>
            ))}
          </div>
        </TnSeksjon>
      )}

      <TnSeksjon tittel="Testresultater" forklaring="Nyeste protokoll øverst. Full historikk under «Tester».">
        {!tester || tester.rader.length === 0 ? (
          <TnTomtilstand tittel="Ingen testresultater ennå" tekst="Spilleren har ikke fullført noen Team Norway-protokoll ennå." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tester.rader.slice(0, 5).map((rad) => (
              <Link key={rad.testId} href={`/team-norway/spiller/${spillerId}/tester/${rad.testId}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "12px 14px", borderRadius: TN.radius.md, border: `1px solid ${TN.borderSubtle}`, background: TN.white, color: TN.navy900, textDecoration: "none" }}>
                <span style={{ fontWeight: TN.weight.semibold }}>{rad.protokollNavn}</span>
                <span style={{ fontFamily: TN.font.mono, color: TN.textSecondary }}>{rad.sisteFormatert} · {dato.format(rad.sisteDato)}</span>
              </Link>
            ))}
            {tester.rader.length > 5 && <Link href={`/team-norway/spiller/${spillerId}/tester`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Se alle {tester.rader.length} protokoller →</Link>}
          </div>
        )}
      </TnSeksjon>
    </TnShell>
  );
}
