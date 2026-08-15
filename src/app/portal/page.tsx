/**
 * PlayerHQ Hjem — chat-først (designport steg 7 PR1, mot Paper-fasiten
 * playerhq-chat-desktop.html/-mobil.html). V2Shell leverer chrome-en
 * (rail/bunn-nav, uendret), PortalChatHjem rendrer selve "I dag"-samtalen.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { dagNavnKort } from "@/lib/uke-helpers";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { PortalChatHjem } from "@/components/portal/v2/chat/PortalChatHjem";

export const dynamic = "force-dynamic";

const OSLO_DATO_FMT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const OSLO_KLOKKE_FMT = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });

export default async function PortalHjemPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  // Dagens økter fra gjennomfore-loaderen (begge økt-spor — samme kilde som
  // Gjør-fanen) — mål-widgeten (getMaalWidgetData) bortfalt med HjemV2 og er
  // ikke del av chat-først-innholdet i denne PR-en.
  const [data, gjennomfore] = await Promise.all([
    getDashboardData(user.id),
    getGjennomforeData(user.id),
  ]);

  // Beregnet server-side (Oslo-korrekt, gotchas.md) og sendt som ferdig
  // streng — unngår at en client-side new Date() gir hydration-mismatch
  // mellom SSR- og hydration-tidspunkt for topplinjas dato/klokke.
  const naa = new Date();
  const naaTekst = { ukedag: dagNavnKort(naa), dato: OSLO_DATO_FMT.format(naa), klokke: OSLO_KLOKKE_FMT.format(naa) };

  return (
    <V2Shell bredde="full" hoyde="skjerm" aktiv="hjem" nav={PLAYERHQ_NAV} navn={data.user.name} avatarUrl={data.user.avatarUrl}>
      <PortalChatHjem data={data} gjennomfore={gjennomfore} naaTekst={naaTekst} />
    </V2Shell>
  );
}
