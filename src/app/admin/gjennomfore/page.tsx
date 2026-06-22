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
  HubPill,
  HubKpiBar,
  WeekStrip,
  CalMini,
} from "@/components/hubs";
import { IDagButton, NyBookingButton } from "./gjennomfore-actions";

export const dynamic = "force-dynamic";

export default async function GjennomforePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Ekte tall fra databasen. Resten av kort-teksten (anlegg-navn, kapasitet,
  // Stripe-status, abonnenter) mangler ren kilde og står som design-seed.
  const naa = new Date();
  const dagStart = new Date(naa);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);
  // Mandag-start for inneværende uke (man=0 .. søn=6)
  const ukeStart = new Date(dagStart);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const [okterIDag, okterDenneUka, antallAnlegg, ventendeBookinger] =
    await Promise.all([
      prisma.booking
        .count({ where: { startAt: { gte: dagStart, lt: dagSlutt } } })
        .catch(() => 0),
      prisma.booking
        .count({ where: { startAt: { gte: ukeStart, lt: ukeSlutt } } })
        .catch(() => 0),
      prisma.location.count({ where: { active: true } }).catch(() => 0),
      prisma.booking
        .count({ where: { status: "PENDING" } })
        .catch(() => 0),
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
              <strong>{okterIDag}</strong> økter i dag
            </span>
            <HubStatSep />
            <span>
              <strong>{okterDenneUka}</strong> denne uka
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>Stripe aktiv</strong>
            </span>
            <HubStatSep />
            <span>
              <strong>{antallAnlegg}</strong> anlegg
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
          data={`${okterIDag} økter i dag`}
          sub={`${okterDenneUka} denne uka`}
          visual={<CalMini marked={[0, 2]} nowPct={38} />}
          cta="Åpne →"
        />
        <HubCard
          href="/admin/bookinger"
          icon={CalendarCheck}
          eyebrow="02 · INNKOMMENDE"
          title="Bookinger"
          data={`${ventendeBookinger} venter svar`}
          sub="Pro-timer, bays og tee-times"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              {ventendeBookinger} PENDING
            </HubPill>
          }
          cta="Behandle →"
        />
        <HubCard
          href="/admin/anlegg"
          icon={MapPin}
          eyebrow="03 · LOKASJONER"
          title="Anlegg"
          data={`${antallAnlegg} anlegg`}
          sub="GFGK · Bjaavann · Hellerudsletta"
          cta="Administrer →"
        />
        <HubCard
          href="/admin/availability"
          icon={Clock}
          eyebrow="04 · ÅPNE TIMER"
          title="Tilgjengelighet"
          data="12 t denne uka"
          sub="ti 09–14 · on 13–18 · to 10–15"
          visual={<WeekStrip onDays={[0, 1, 2, 3, 4]} meDay={1} />}
          cta="Sett →"
        />
        <HubCard
          href="/admin/bookinger"
          icon={Gauge}
          eyebrow="05 · BELASTNING"
          title="Kapasitet"
          data="2% brukt denne uka"
          sub="Mål: 75% · 23/40 t booket"
          visual={<HubKpiBar pct={2} tone="ok" />}
          cta="Se trend →"
        />
        <HubCard
          href="/admin/services"
          icon={CreditCard}
          eyebrow="06 · ØKONOMI"
          title="Tjenester"
          data="5 prislister"
          sub="Stripe aktiv · 12 abonnenter"
          statusPill={
            <HubPill kind="ok" dot="d-pulse">
              STRIPE OK
            </HubPill>
          }
          cta="Åpne →"
        />
        <HubCard
          href="/admin/trackman"
          icon={Radio}
          eyebrow="07 · UTSTYR"
          title="TrackMan"
          data="1 aktiv sesjon"
          sub="Øyvind R. · GFGK Bay 3"
          statusPill={
            <HubPill kind="accent" dot="d-pulse">
              LIVE
            </HubPill>
          }
          cta="Se live →"
        />
        <HubCard
          href="/admin/kalender"
          icon={Activity}
          eyebrow="08 · ØYEBLIKK"
          title="Live-økter"
          data="Ingen aktiv nå"
          sub="Sist live: 23. mai · 16:00"
          tone="empty"
          cta="Start ny økt →"
        />
      </section>
    </HubFrame>
  );
}
