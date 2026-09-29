/**
 * AG-05 Kalender i Precision Athletics (bolk A4). Erstatter V2Shell +
 * KalenderLagUkeV2/StallDagV2-visningen med AgencyOSSkall + Precision-
 * komponenter. Samme fem faner, samme guard, samme datakilder som før —
 * Faner er ekte lenker (`?fane=`), så bare den aktive fanen laster data.
 *
 * «Tilgjengelighet» er en ny, femte fane (AG-05-tegningen, 28.09.2026) — se
 * lib/admin/kalender/faner.ts for hvorfor det tidligere var et bevisst unntak.
 * «År» (AG-05-AR) og Stall-dag i Precision kom 29.09.2026.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Side, SideHode, FanerLenker } from "@/components/precision/pa-a4";
import { AG05Uke, AG05Maned, AG05Aar, AG05Periode, AG05Verktoylinje } from "@/components/admin/precision/AG05Kalender";
import { AG05Tilg } from "@/components/admin/precision/AG05Tilg";
import { AG05StallDag, AG05StallFeil } from "@/components/admin/precision/AG05StallDag";
import { loadStallDag } from "@/lib/workbench/wb-actions";
import { erKalenderLag, type KalenderLag } from "@/lib/domain/kalender-lag";
import { hentKalenderAar, hentKalenderLagManed, hentKalenderLagUke } from "./lag/data";
import { hentTilgjengelighet } from "./tilg-data";
import { KALENDER_FANER, kalenderHref, velgKalenderFane } from "@/lib/admin/kalender/faner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender · AgencyOS" };

type SearchParams = Promise<{
  fane?: string;
  uke?: string;
  visning?: string;
  maaned?: string;
  dato?: string;
  lag?: string;
  aar?: string;
}>;

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export default async function AgencyKalenderPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const fane = velgKalenderFane(sp.fane, sp.visning);
  const startLag: KalenderLag | undefined = sp.lag && erKalenderLag(sp.lag) ? sp.lag : undefined;

  let innhold: React.ReactNode;
  let periode = "";
  let navigasjon: React.ReactNode = null;

  if (fane === "stall") {
    const idag = osloIdag();
    const dato = sp.dato && ISO_DATO.test(sp.dato) ? sp.dato : idag;
    const res = await loadStallDag({ dato });
    periode = `Stall-dag · ${dato}`;
    innhold = res.ok ? <AG05StallDag dato={dato} data={res.data} erIdag={dato === idag} /> : <AG05StallFeil melding={res.error} />;
  } else if (fane === "tilg") {
    const data = await hentTilgjengelighet(user);
    periode = "Tilgjengelighet";
    innhold = <AG05Tilg data={data} />;
  } else if (fane === "ar") {
    const data = await hentKalenderAar(sp.aar);
    periode = `År ${data.aar}`;
    navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} />;
    innhold = <AG05Aar data={data} />;
  } else if (fane === "maned") {
    const data = await hentKalenderLagManed(sp.maaned, { lag: startLag });
    periode = data.periode;
    navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} />;
    innhold = <AG05Maned data={data} startLag={startLag} />;
  } else {
    const data = await hentKalenderLagUke(sp.uke, { lag: startLag, visning: fane, dato: sp.dato });
    periode = data.periode;
    navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} />;
    innhold = <AG05Uke data={data} dagIso={sp.dato} startLag={startLag} />;
  }

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side max={1480}>
        <SideHode
          kicker={`Kalender · ${periode}`}
          title="Kalender"
          sub="Dra en økt eller booking til ny dag og tid, eller åpne den og velg Flytt. Økter flyttes med en gang; bookinger får et forslag spilleren godtar."
          actions={<AG05Verktoylinje nyHendelseHref="/admin/kalender/hendelse/ny" nyBookingHref="/admin/bookinger/ny" />}
        />
        <FanerLenker faner={KALENDER_FANER.map((f) => ({ href: kalenderHref(f.id), navn: f.label, aktiv: f.id === fane }))} />
        {navigasjon}
        {innhold}
      </Side>
    </AgencyOSSkall>
  );
}
