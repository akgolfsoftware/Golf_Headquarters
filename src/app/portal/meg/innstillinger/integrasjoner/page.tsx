// PH25Integrasjoner — Precision Athletics (19.10.2026). Data og handlinger er beholdt.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ Innstillinger · Kalender og integrasjoner. PH25Integrasjoner rendrer skjermen
 * (erstatter InnstillingerIntegrasjonerV2).
 *
 * v2-port 17. juli 2026: auth + Prisma-oppslagene (trackManSession +
 * googleCalendarConnection) er uendret — kun presentasjonslaget er byttet.
 * Ærlighet bevart: kun TrackMan og Google Calendar har ekte backing i
 * databasen; resten vises som «tilgjengelig» til de faktisk kobles til.
 * Ingen oppdiktede sync-tidspunkter eller datapunkt-tall.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PH25Integrasjoner, type PH25IntegrasjonerData } from "@/components/portal/precision/PH25Integrasjoner";

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
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

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
  const data: PH25IntegrasjonerData = {
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
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Integrasjoner data={data} />
    </PlayerHQSkall>
  );
}
