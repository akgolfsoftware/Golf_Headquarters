/**
 * v2 — PlayerHQ Innstillinger · Integrasjoner (retning C). V2Shell leverer
 * chrome-en (IkonRail/BunnNav, aktiv «meg»), InnstillingerIntegrasjonerV2
 * rendrer innholds-stacken.
 *
 * v2-port 17. juli 2026: auth + Prisma-oppslagene (trackManSession +
 * googleCalendarConnection) er uendret — kun presentasjonslaget er byttet.
 * Ærlighet bevart: kun TrackMan og Google Calendar har ekte backing i
 * databasen; resten vises som «tilgjengelig» til de faktisk kobles til.
 * Ingen oppdiktede sync-tidspunkter eller datapunkt-tall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  InnstillingerIntegrasjonerV2,
  type InnstillingerIntegrasjonerData,
} from "@/components/portal/v2/InnstillingerIntegrasjonerV2";

export const dynamic = "force-dynamic";

function formatSync(d: Date | null | undefined): string {
  if (!d) return "Ikke synket enda";
  return `${d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function IntegrasjonerPage() {
  const user = await requirePortalUser();

  const [tmCount, tmLast, gcal] = await Promise.all([
    prisma.trackManSession.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.trackManSession
      .findFirst({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        select: { recordedAt: true, shotCount: true, source: true },
      })
      .catch(() => null),
    prisma.googleCalendarConnection
      .findUnique({ where: { userId: user.id } })
      .catch(() => null),
  ]);

  const tmConnected = tmCount > 0;
  const gcalConnected = !!gcal;

  // Kun ekte tilkoblinger telles. Ingen «alltid-på demo».
  const data: InnstillingerIntegrasjonerData = {
    tm: {
      tilkoblet: tmConnected,
      sistSynket: formatSync(tmLast?.recordedAt),
      sisteOkt: tmLast ? `${tmLast.shotCount} slag · ${tmLast.source ?? "TrackMan"}` : null,
    },
    gcal: {
      tilkoblet: gcalConnected,
      sistSynket: formatSync(gcal?.lastSyncAt),
      status: gcal ? (gcal.status === "ACTIVE" ? "Aktiv" : (gcal.status ?? "—")) : null,
    },
    sistSynkTid: tmLast
      ? tmLast.recordedAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })
      : null,
    sistSynkDato: tmLast
      ? tmLast.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" })
      : null,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>
      <InnstillingerIntegrasjonerV2 data={data} />
    </V2Shell>
  );
}
