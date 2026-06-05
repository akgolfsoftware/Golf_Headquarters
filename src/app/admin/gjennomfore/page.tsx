/**
 * /admin/gjennomfore — CoachHQ Gjennomføre hub
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
  Plus,
  Radio,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
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

export const dynamic = "force-dynamic";

export default async function GjennomforePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <HubFrame>
      <HubHeader
        eyebrow="COACHHQ · COACH"
        title="Daglig"
        titleItalic="drift"
        sub="Kalender, bookinger, anlegg, tilgjengelighet og live-økter."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Calendar size={13} strokeWidth={1.75} aria-hidden /> I dag
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Ny booking
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>5</strong> økter i dag
            </span>
            <HubStatSep />
            <span>
              <strong>23</strong> denne uka
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>Stripe aktiv</strong>
            </span>
            <HubStatSep />
            <span>
              <strong>3</strong> anlegg
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
          data="5 økter i dag"
          sub="23 denne uka · 4 venter input"
          visual={<CalMini marked={[0, 2]} nowPct={38} />}
          cta="Åpne →"
        />
        <HubCard
          href="/admin/bookinger"
          icon={CalendarCheck}
          eyebrow="02 · INNKOMMENDE"
          title="Bookinger"
          data="4 kommende"
          sub="1 venter på bekreft · 12 historikk"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              1 PENDING
            </HubPill>
          }
          cta="Behandle →"
        />
        <HubCard
          href="/admin/anlegg"
          icon={MapPin}
          eyebrow="03 · LOKASJONER"
          title="Anlegg"
          data="3 anlegg"
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
          href="/admin/kapasitet"
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
