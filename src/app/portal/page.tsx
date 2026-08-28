/**
 * PlayerHQ Hjem — chat-først (designport steg 7 PR1, mot Paper-fasiten
 * playerhq-chat-desktop.html/-mobil.html). V2Shell leverer chrome-en
 * (rail/bunn-nav, uendret), PortalChatHjem rendrer selve "I dag"-samtalen.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { loadPlayerDay } from "@/lib/workbench/wb-actions";
import { dagNavnKort, dagNavnLang } from "@/lib/uke-helpers";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { PortalChatHjem } from "@/components/portal/v2/chat/PortalChatHjem";
import { getTrackManTeaser } from "@/lib/trackman/teaser";
import { getTesterLiveKort } from "@/lib/portal-tester/tester-live-kort";
import { hentSpillerDagITiden } from "@/lib/kalender-lag/player-dag";

export const dynamic = "force-dynamic";
export const metadata = { title: "I dag · PlayerHQ" };

const OSLO_DATO_FMT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const OSLO_KLOKKE_FMT = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
/** ISO (YYYY-MM-DD), Oslo-lokal dag — samme mønster som (fullscreen)/tren/wb/page.tsx. */
const OSLO_ISO_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });

export default async function PortalHjemPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  // Beregnet server-side (Oslo-korrekt, gotchas.md) og sendt som ferdig
  // streng — unngår at en client-side new Date() gir hydration-mismatch
  // mellom SSR- og hydration-tidspunkt for topplinjas dato/klokke.
  const naa = new Date();
  const naaTekst = { ukedag: dagNavnKort(naa), dato: OSLO_DATO_FMT.format(naa), klokke: OSLO_KLOKKE_FMT.format(naa) };
  const iDag = OSLO_ISO_FMT.format(naa);

  // Dagens økter fra gjennomfore-loaderen (begge gamle økt-spor — samme kilde
  // som Gjør-fanen) OG fra den nye Workbench-modellen (loadPlayerDay,
  // Loop 3/B4). Begge sendes videre — PortalChatHjem kobler workbenchDay inn
  // som egen «Én ting nå»/artefakt-tilstand ved siden av det eksisterende.
  const [data, gjennomfore, workbenchDay, trackman, testerLive, dagITidenHendelser] = await Promise.all([
    getDashboardData(user.id),
    getGjennomforeData(user.id),
    loadPlayerDay({ playerId: user.id, date: iDag }),
    getTrackManTeaser(user.id),
    getTesterLiveKort(user.id),
    hentSpillerDagITiden(user.id, iDag),
  ]);

  // KA-04-format: ukedag + dag uten ledende null + punktum, ingen måned
  // (fasitens «Lørdag 22.»).
  const dagITiden = { dagLabel: `${dagNavnLang(naa)} ${Number(iDag.slice(8, 10))}.`, hendelser: dagITidenHendelser };

  return (
    <V2Shell bredde="full" hoyde="skjerm" aktiv="hjem" nav={PLAYERHQ_NAV} navn={data.user.name} avatarUrl={data.user.avatarUrl}>
      <PortalChatHjem
        data={data}
        gjennomfore={gjennomfore}
        naaTekst={naaTekst}
        workbenchDay={workbenchDay}
        trackman={trackman}
        testerLive={testerLive}
        dagITiden={dagITiden}
      />
    </V2Shell>
  );
}
