/**
 * AgencyOS Kalender — én adresse for hele kalenderen (MASTERPLAN 15.4,
 * beslutning 6.9 «én inngang per funksjon»). Bygger på T7-flaten.
 *
 * Faner: Uke · Måned · Dag (KalenderLagUkeV2, som før via C3-laget) og
 * Stall-dag (StallDagV2, flyttet fra /admin/stall/dag som nå redirecter hit).
 * «Ny hendelse» er CTA i hodet, ikke fane. Gamle `?visning=`-dyplenker
 * (også periode-navigasjonens hrefs fra lag/data.ts) mapper til riktig fane.
 *
 * Kun aktiv fane laster data. Google-synk røres ikke.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { KalenderLagUkeV2 } from "@/components/admin/v2/kalender/KalenderLagUkeV2";
import { KalenderHode } from "@/components/admin/v2/kalender/KalenderHode";
import { StallDagV2, StallDagFeil } from "@/components/workbench/StallDagV2";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { loadStallDag } from "@/lib/workbench/wb-actions";
import { erKalenderLag, type KalenderLag } from "@/lib/domain/kalender-lag";
import { hentKalenderLagManed, hentKalenderLagUke } from "./lag/data";
import { KALENDER_FANER, velgKalenderFane } from "@/lib/admin/kalender/faner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender · AgencyOS" };

type SearchParams = Promise<{
  fane?: string;
  uke?: string;
  visning?: string;
  maaned?: string;
  dato?: string;
  lag?: string;
}>;

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export default async function AgencyKalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const fane = velgKalenderFane(sp.fane, sp.visning);
  const startLag: KalenderLag | undefined = sp.lag && erKalenderLag(sp.lag) ? sp.lag : undefined;

  const hode = <KalenderHode faner={KALENDER_FANER} aktiv={fane} />;

  let innhold: React.ReactNode;
  if (fane === "stall") {
    const idag = osloIdag();
    const dato = sp.dato && ISO_DATO.test(sp.dato) ? sp.dato : idag;
    const res = await loadStallDag({ dato });
    innhold = (
      <div style={TL_SCOPE}>
        {res.ok ? (
          <StallDagV2 dato={dato} data={res.data} erIdag={dato === idag} somFane />
        ) : (
          <StallDagFeil melding={res.error} />
        )}
      </div>
    );
  } else {
    const data =
      fane === "maned"
        ? await hentKalenderLagManed(sp.maaned, { lag: startLag })
        : await hentKalenderLagUke(sp.uke, { lag: startLag, visning: fane, dato: sp.dato });
    innhold = <KalenderLagUkeV2 data={data} startLag={startLag} somFane />;
  }

  return (
    <V2Shell bredde="full" aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <div style={{ display: "grid", gap: 20 }}>
        {hode}
        {innhold}
      </div>
    </V2Shell>
  );
}
