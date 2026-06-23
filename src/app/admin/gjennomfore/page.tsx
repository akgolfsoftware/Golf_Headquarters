/**
 * /admin/gjennomfore — AgencyOS Gjennomføre hub
 * Design: docs/design-handoff/2026-05-24-hubs/project/manglende-hubs/hubs-coach.jsx (CoachGjennomfore)
 */

import {
  Activity,
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  Gauge,
  MapPin,
  Radio,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
} from "@/components/hubs";
import { IDagButton, NyBookingButton } from "./gjennomfore-actions";

export const dynamic = "force-dynamic";

/**
 * Dato-grenser beregnes utenfor render-body (react-hooks/purity: Date.now()
 * kan ikke kalles i render). Kalles én gang per request fra server-funksjonen.
 */
function dagOgUkeVindu(): {
  dagStart: Date;
  dagSlutt: Date;
  ukeStart: Date;
  ukeSlutt: Date;
} {
  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);

  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagStart.getDate() + 1);

  const ukeStart = new Date(dagStart);
  ukeStart.setDate(dagStart.getDate() - ((dagStart.getDay() + 6) % 7)); // mandag

  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7); // neste mandag

  return { dagStart, dagSlutt, ukeStart, ukeSlutt };
}

const AKTIVE_STATUSER = ["CONFIRMED", "PENDING"] as const;

export default async function GjennomforePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { dagStart, dagSlutt, ukeStart, ukeSlutt } = dagOgUkeVindu();

  const [okterIDag, okterDenneUka, antallAnlegg] = await Promise.all([
    prisma.booking.count({
      where: { startAt: { gte: dagStart, lt: dagSlutt }, status: { in: [...AKTIVE_STATUSER] } },
    }),
    prisma.booking.count({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt }, status: { in: [...AKTIVE_STATUSER] } },
    }),
    prisma.location.count({ where: { active: true } }),
  ]);

  return (
    <HubFrame>
      <HubHeader
        eyebrow="AGENCYOS · COACH"
        title="Daglig"
        titleItalic="drift"
        sub="Kalender, bookinger, anlegg, tilgjengelighet og live-økter."
        actions={
          <>
            <IDagButton />
            <NyBookingButton />
          </>
        }
        stats={
          <>
            <span>
              <strong>{okterIDag}</strong> {okterIDag === 1 ? "økt" : "økter"} i dag
            </span>
            <HubStatSep />
            <span>
              <strong>{okterDenneUka}</strong> denne uka
            </span>
            <HubStatSep />
            <span>
              <strong>{antallAnlegg}</strong> {antallAnlegg === 1 ? "anlegg" : "anlegg"}
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/kalender/uke"
          icon={Calendar}
          eyebrow="01 · DAGENS DRIFT"
          title="Coach-kalender"
          data={`${okterIDag} ${okterIDag === 1 ? "økt" : "økter"} i dag`}
          sub={`${okterDenneUka} denne uka`}
          cta="Åpne →"
        />
        <HubCard
          href="/admin/bookinger"
          icon={CalendarCheck}
          eyebrow="02 · INNKOMMENDE"
          title="Bookinger"
          data={`${okterDenneUka} denne uka`}
          sub="Behandle bekreftelser og avvisninger"
          cta="Behandle →"
        />
        <HubCard
          href="/admin/locations"
          icon={MapPin}
          eyebrow="03 · LOKASJONER"
          title="Anlegg"
          data={`${antallAnlegg} ${antallAnlegg === 1 ? "anlegg" : "anlegg"}`}
          sub="Aktive lokasjoner"
          cta="Administrer →"
        />
        <HubCard
          href="/admin/availability"
          icon={Clock}
          eyebrow="04 · ÅPNE TIMER"
          title="Tilgjengelighet"
          data="—"
          sub="Sett åpne timer"
          cta="Sett →"
        />
        <HubCard
          href="/admin/kapasitet"
          icon={Gauge}
          eyebrow="05 · BELASTNING"
          title="Kapasitet"
          data="—"
          sub="Se kapasitet-trend"
          cta="Se trend →"
        />
        <HubCard
          href="/admin/services"
          icon={CreditCard}
          eyebrow="06 · ØKONOMI"
          title="Tjenester"
          data="—"
          sub="Prislister og tjenester"
          cta="Åpne →"
        />
        <HubCard
          href="/admin/trackman"
          icon={Radio}
          eyebrow="07 · UTSTYR"
          title="TrackMan"
          data="—"
          sub="Aktive sesjoner"
          cta="Se live →"
        />
        <HubCard
          href="/admin/kalender"
          icon={Activity}
          eyebrow="08 · ØYEBLIKK"
          title="Live-økter"
          data="—"
          sub="Start ny økt fra kalender"
          tone="empty"
          cta="Start ny økt →"
        />
      </section>
    </HubFrame>
  );
}
