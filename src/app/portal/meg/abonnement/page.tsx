/**
 * v2 — PlayerHQ Meg · Abonnement (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav, aktiv «meg»), MegAbonnementV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/meg/abonnement-siden:
 * requirePortalUser + getAbonnementData (FAKTISK tier + subscription +
 * faktura-historikk). Alle avledninger (hero-tilstand, kan-oppgradere/
 * endre-kort/avbestille, gratis via pakke) er 1:1 med den ekte siden.
 * Ingen fabrikerte verdier.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegAbonnementV2, type MegAbonnementData } from "@/components/portal/v2/MegAbonnementV2";

export const dynamic = "force-dynamic";

function formatDato(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; cancelled?: string; avbestilt?: string }>;
}) {
  const sp = await searchParams;
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const abo = await getAbonnementData(user.id);

  // Avledninger — 1:1 med den tidligere src/app/portal/meg/abonnement/page.tsx.
  const harPakke = abo.monthlyCredits > 0;
  const planNavn = abo.monthlyCredits >= 4 ? "Performance Pro" : harPakke ? "Performance" : null;
  const gratis = harPakke || !abo.erPro;
  const betalingFeilet = abo.status === "PAST_DUE";
  const kanOppgradere = !abo.erPro && !betalingFeilet;
  const kanEndreKort = abo.status === "ACTIVE" || abo.status === "PAST_DUE" || abo.status === "TRIALING";
  const kanAvbestille = abo.erPro && abo.status !== "CANCELLED";

  const hero: MegAbonnementData["hero"] = kanOppgradere ? "oppgrader" : abo.erPro && !harPakke ? "status" : "gratis";

  const data: MegAbonnementData = {
    hero,
    gratis,
    pakkeNavn: planNavn,
    fornyes: formatDato(abo.nesteTrekk),
    betalingFeilet,
    kanOppgradere,
    kanEndreKort,
    kanAvbestille,
    fakturaer: abo.fakturaer.slice(0, 5).map((f) => ({
      id: f.id,
      tittel: f.description ?? "Betaling",
      meta: (() => {
        const belop = `${(f.amountOre / 100).toLocaleString("nb-NO")} kr`;
        const dato = formatDato(f.paidAt);
        return dato ? `${dato} · ${belop}` : belop;
      })(),
    })),
    flagg: {
      ok: sp.ok === "1",
      avbrutt: sp.cancelled === "1",
      avbestilt: sp.avbestilt === "1",
    },
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MegAbonnementV2 data={data} />
    </V2Shell>
  );
}
