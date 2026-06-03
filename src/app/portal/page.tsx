/**
 * PlayerHQ Hjem (/portal) — v10-design.
 *
 * Rendrer <PlayerHome> (v10-fasit fra pl-hjem) med EKTE data fra getHjemData
 * (Prisma). Foto-hero, "Dagens økt"-featured, SG-KPI-strip, pyramide-vekting,
 * neste tee og Caddie-innsikt. Tom-tilstand når data mangler — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. PortalShell (layout) eier
 * sidebar/topbar/bunn-nav — denne siden rendrer kun innholdet.
 *
 * Bolk 1 (3. juni): byttet fra HjemOversikt (gammelt design) til PlayerHome (v10).
 * mapHjemData oversetter den eksisterende HjemData-shapen til PlayerHomeData.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getHjemData, type HjemData } from "@/lib/portal-hjem/hjem-data";
import {
  PlayerHome,
  type PlayerHomeData,
} from "@/components/portal/home/player-home";

export const dynamic = "force-dynamic";

/** Oversetter ekte HjemData → v10 PlayerHomeData. Tom-tilstander bevares (null/[]). */
function mapHjemData(data: HjemData): PlayerHomeData {
  return {
    user: {
      fornavn: data.user.fornavn,
      initialer: data.user.initialer,
      tier: data.user.tier,
      avatarUrl: data.user.avatarUrl ?? undefined,
    },
    heroImageId: data.heroImageId,
    datoEyebrow: data.datoEyebrow,
    // headlineNormal er "God morgen, " — strip trailing komma/space til ren hilsen.
    hilsen: data.headlineNormal.replace(/,\s*$/, ""),
    dagensOkt: data.dagensOkt
      ? {
          eyebrow: data.dagensOkt.pyramide,
          tittel: data.dagensOkt.tittel,
          meta: `${data.dagensOkt.tidsrom} · ${data.dagensOkt.meta}`,
          href: data.dagensOkt.href,
        }
      : null,
    kpi: data.kpi,
    pyramide: data.pyramide,
    pyramideNote: data.pyramideNote ?? undefined,
    nesteTurnering: data.nesteTee
      ? {
          dagKort: data.nesteTee.dagKort,
          datoTall: data.nesteTee.datoTall,
          naar: data.nesteTee.naar,
          navn: data.nesteTee.navn,
          sted: data.nesteTee.sted,
          href: data.nesteTee.href,
        }
      : null,
    caddie: data.innsikt
      ? {
          type: data.innsikt.type,
          eyebrow: data.innsikt.eyebrow,
          body: data.innsikt.body,
          cta: data.innsikt.cta ?? { label: "Åpne Coach", href: "/portal/coach" },
        }
      : null,
    hrefs: {
      planlegge: "/portal/planlegge",
      sgHub: "/portal/mal/sg-hub",
      turneringer: "/portal/tren/turneringer",
    },
  };
}

export default async function PortalHjemPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getHjemData(user.id);

  return <PlayerHome data={mapHjemData(data)} />;
}
