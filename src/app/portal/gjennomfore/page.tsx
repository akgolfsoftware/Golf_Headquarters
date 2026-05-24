/**
 * /portal/gjennomfore — PlayerHQ Gjennomføre hub
 * Design: docs/design-handoff/2026-05-24-hubs/project/manglende-hubs/hubs-player.jsx (PlayerGjennomfore)
 */

import { Activity, Calendar, CalendarCheck, PlayCircle, Plus, Radio } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
  WeekStrip,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function GjennomforePage() {
  await requirePortalUser();

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · PRO"
        title="Gjør"
        titleItalic="jobben"
        sub="Dagens program, kalender, live-økt og bookinger."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Calendar size={13} strokeWidth={1.75} aria-hidden /> Kalender
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Ny økt
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>0</strong> økter i dag
            </span>
            <HubStatSep />
            <span>
              <strong>5</strong> denne uka
            </span>
            <HubStatSep />
            <span>
              <strong>1</strong> booking kommende
            </span>
            <HubStatSep />
            <span>
              <strong>Markus</strong> · 28. mai
            </span>
          </>
        }
      />

      <section className="player-hero-card">
        <div className="phc-left">
          <div className="phc-av">AK</div>
          <div>
            <div className="eyebrow">SPILLER · SESONG 2026</div>
            <h2>Anders Kristiansen</h2>
            <div className="phc-meta">
              <span className="pill pill-tier">A1</span>
              <span className="pill pill-tier-pro">PRO</span>
              <span className="phc-mono">HCP -- · SG +1.2 siste runde</span>
            </div>
          </div>
        </div>
        <div className="phc-right">
          <div className="phc-stat">
            <span className="phc-lbl">I DAG</span>
            <span className="phc-val">Hviledag</span>
            <span className="phc-sub">ingen planlagt økt</span>
          </div>
          <div className="phc-stat">
            <span className="phc-lbl">NESTE</span>
            <span className="phc-val">Markus R.P.</span>
            <span className="phc-sub">tirsdag 28. mai · 14:00</span>
          </div>
        </div>
      </section>

      <section className="hub-grid">
        <HubCard
          icon={PlayCircle}
          eyebrow="01 · NÅVÆRENDE"
          title="I dag"
          data="0 økter i dag"
          sub="Sist gjennomført: 23. mai · Tek 60 min"
          tone="empty"
          cta="Se kalender →"
        />
        <HubCard
          href="/portal/kalender"
          icon={Calendar}
          eyebrow="02 · UKA"
          title="Kalender"
          data="5 økter denne uka"
          sub="Tek 2 · Slag 1 · Fys 1 · Spill 1"
          visual={<WeekStrip onDays={[0, 1, 3, 4, 5]} />}
          cta="Åpne kalender →"
        />
        <HubCard
          icon={Activity}
          eyebrow="03 · SANNTID"
          title="Live-økt"
          data="Ingen aktiv"
          sub="Sist live: 19. mai · TrackMan · 47 slag"
          tone="empty"
          cta="Start ny økt →"
        />
        <HubCard
          href="/portal/booking"
          icon={CalendarCheck}
          eyebrow="04 · COACH"
          title="Booking"
          data="1 kommende"
          sub="Markus R.P. · tirsdag 28. mai · 14:00 · GFGK"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              BEKREFTET
            </HubPill>
          }
          cta="Se bookinger →"
        />
        <HubCard
          href="/portal/mal/trackman"
          icon={Radio}
          eyebrow="05 · UTSTYR"
          title="TrackMan"
          data="Siste sesjon 19. mai"
          sub="47 slag · driver-snitt 268m · spin 2 480"
          cta="Logg ny →"
        />
      </section>
    </HubFrame>
  );
}
