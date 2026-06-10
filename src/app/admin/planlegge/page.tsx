/**
 * /admin/planlegge — AgencyOS Planlegge hub
 * Design: docs/design-handoff/2026-05-24-hubs/project/manglende-hubs/hubs-coach.jsx (CoachPlanlegge)
 */

import {
  CalendarRange,
  Calendar,
  Dumbbell,
  FileText,
  Plus,
  Target,
  Trophy,
  Video,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
  NextTourn,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function PlanleggePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <HubFrame>
      <HubHeader
        eyebrow="COACHHQ · COACH"
        title="Bygg"
        titleItalic="planer"
        sub="Treningsplaner, plan-maler, teknisk plan og drill-bibliotek på ett sted."
        actions={
          <button className="hub-btn btn-forest" type="button">
            <Plus size={13} strokeWidth={2} aria-hidden /> Ny plan
          </button>
        }
        stats={
          <>
            <span>
              <strong>14</strong> aktive planer
            </span>
            <HubStatSep />
            <span>
              <strong>28</strong> maler
            </span>
            <HubStatSep />
            <span>
              <strong>247</strong> drills
            </span>
            <HubStatSep />
            <span>
              <strong>3</strong> kommende turneringer
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/plans"
          icon={CalendarRange}
          eyebrow="01 · STALL"
          title="Treningsplaner"
          data="14 aktive planer"
          sub="6 utkast · sist endret 23. mai"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              AKTIVE
            </HubPill>
          }
          cta="Se alle →"
        />
        <HubCard
          href="/admin/plans/templates"
          icon={FileText}
          eyebrow="02 · BIBLIOTEK"
          title="Plan-maler"
          data="28 maler"
          sub="Sist brukt: 21. mai · Øyvind R."
          cta="Bla i bibliotek →"
        />
        <HubCard
          href="/admin/teknisk-plan"
          icon={Target}
          eyebrow="03 · INDIVID"
          title="Teknisk plan"
          data="9 spillere"
          sub="7 med aktiv plan · 2 venter"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              2 VENTER
            </HubPill>
          }
          cta="Se spillere →"
        />
        <HubCard
          href="/admin/drills"
          icon={Dumbbell}
          eyebrow="04 · ØVELSER"
          title="Drill-bibliotek"
          data="247 drills"
          sub="12 nye denne uka · 4 kohort-favoritter"
          statusPill={<HubPill kind="accent">+12 NY</HubPill>}
          cta="Utforsk →"
        />
        <HubCard
          href="/admin/tournaments"
          icon={Trophy}
          eyebrow="05 · KONKURRANSE"
          title="Turneringer"
          data="3 kommende"
          sub="Neste: Sørlandsåpent · 14. juni"
          visual={<NextTourn when="14. JUN" where="Bjaavann GK" count="5 påmeldte" />}
          cta="Planlegg →"
        />
        <HubCard
          href="/admin/okter"
          icon={Calendar}
          eyebrow="06 · ØKTER"
          title="Økter"
          data="47 totalt"
          sub="5 utkast · 12 denne uka"
          cta="Se alle →"
        />
        <HubCard
          href="/admin/videoer"
          icon={Video}
          eyebrow="07 · MEDIA"
          title="Videoer"
          data="23 i bibliotek"
          sub="Tek 9 · Slag 7 · Fys 4 · Spill 3"
          cta="Bla →"
        />
      </section>

      <aside className="hub-recent">
        <div className="hub-recent-head">
          <div className="eyebrow">SIST RØRT</div>
          <span className="hub-recent-meta">7 elementer denne uka</span>
        </div>
        <ul className="hub-recent-list">
          <li>
            <span className="rc-kind">
              <FileText size={13} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="rc-ttl">Mal · Vinter-grunnplan A1</span>
            <span className="rc-meta">redigert 21. mai · 14:32</span>
          </li>
          <li>
            <span className="rc-kind">
              <Target size={13} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="rc-ttl">Teknisk plan · Mathilde S.</span>
            <span className="rc-meta">opprettet 20. mai · 09:11</span>
          </li>
          <li>
            <span className="rc-kind">
              <Dumbbell size={13} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="rc-ttl">Drill · Avstands-kontroll 8i</span>
            <span className="rc-meta">lagt til 19. mai · 16:48</span>
          </li>
          <li>
            <span className="rc-kind">
              <CalendarRange size={13} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="rc-ttl">Plan · Øyvind R. — Periode 2</span>
            <span className="rc-meta">justert 18. mai · 11:02</span>
          </li>
        </ul>
      </aside>
    </HubFrame>
  );
}
