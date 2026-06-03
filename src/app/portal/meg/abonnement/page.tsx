/**
 * PlayerHQ Abonnement (/portal/meg/abonnement) — v10-design.
 *
 * Rendrer <Abonnement> (v10-fasit fra pl-abonnement) med EKTE data fra
 * getAbonnementData (Prisma). Tom-tilstand bevares (GRATIS → 0 kr, ingen
 * credits, ingen forfall, tom faktura-historikk) — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. PortalShell (layout) eier
 * sidebar/topbar/bunn-nav — denne siden rendrer kun innholdet.
 *
 * Bolk (3. juni): byttet fra eldre design (PlayerHero + PlanOverview + tabeller)
 * til v10 <Abonnement>. mapAbonnementData oversetter loaderens shape til
 * AbonnementData (komponentens prop-kontrakt).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  getAbonnementData,
  type AbonnementData as LoaderData,
} from "@/lib/portal-abonnement/abonnement-data";
import {
  Abonnement,
  type AbonnementData,
  type FakturaRad,
} from "@/components/portal/abonnement/abonnement";

export const dynamic = "force-dynamic";

const NOK = new Intl.NumberFormat("nb-NO");

/** Pro-funksjoner — fast 2-tier-pakkeinnhold (matcher v10-fasiten). */
const PRO_FEATURES = [
  "3 aktive treningsplaner",
  "Ubegrenset coaching-historikk",
  "AI-anbefalinger fra coach-agenten",
  "TrackMan-import",
  "Helse + restitusjon",
  "50 coach-meldinger / mnd",
] as const;

function fakturaTypeLabel(t: LoaderData["fakturaer"][number]["type"]): string {
  switch (t) {
    case "SUBSCRIPTION":
      return "Abonnement";
    case "BOOKING":
      return "Booking";
    case "INVOICE":
      return "Faktura";
    default:
      return "Annet";
  }
}

function formatPeriode(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Oversetter ekte loader-data → v10 AbonnementData. Tom-tilstander bevares. */
function mapAbonnementData(
  loader: LoaderData,
  spillerNavn: string,
): AbonnementData {
  const { erPro } = loader;

  const fakturaer: FakturaRad[] = loader.fakturaer.map((f) => ({
    id: f.id,
    periode: `${formatPeriode(f.paidAt)} · ${fakturaTypeLabel(f.type)}`,
    belop: `${NOK.format(f.amountOre / 100)} kr`,
    status: f.stripeInvoiceId ? "Betalt" : "Registrert",
  }));

  return {
    spillerNavn,
    tier: erPro ? "PRO" : "GRATIS",
    mndAvgift: erPro ? 300 : 0,
    // Credits/forfall er kun relevant for Pro — Gratis viser "—" (null).
    creditsIgjen: erPro ? loader.creditsRemaining : null,
    forfallOmDager: erPro ? loader.forfallOmDager : null,
    proPris: 300,
    proFeatures: [...PRO_FEATURES],
    fakturaer,
    hrefs: {
      oppgrader: "/portal/meg/abonnement/oppgrader",
      endrePlan: "/portal/meg/abonnement",
    },
  };
}

export default async function AbonnementPage() {
  const user = await requirePortalUser();

  const loader = await getAbonnementData(user.id);

  return <Abonnement data={mapAbonnementData(loader, user.name)} />;
}
