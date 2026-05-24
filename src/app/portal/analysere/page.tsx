/**
 * /portal/analysere — PlayerHQ Analysere hub
 * Design: hubs-player.jsx (PlayerAnalysere)
 */

import {
  BarChart3,
  ClipboardCheck,
  Download,
  Flag,
  Map,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
  HubSparkline,
  HubProgress,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  await requirePortalUser();

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · PRO"
        title="Forstå spillet"
        titleItalic="ditt"
        sub="Statistikk, Strokes Gained, runder, TrackMan, tester og AI-innsikt."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Download size={13} strokeWidth={1.75} aria-hidden /> Eksporter
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Logg runde
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>47</strong> runder
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>SG +1.2</strong> siste
            </span>
            <HubStatSep />
            <span>
              <strong>12/36</strong> tester
            </span>
            <HubStatSep />
            <span>
              <strong>#14</strong> av 87
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/portal/statistikk"
          icon={BarChart3}
          eyebrow="01 · OVERSIKT"
          title="Statistikk"
          data="47 runder loggført"
          sub="Snitt: 71.4 · driver 268m · 65% GIR"
          visual={<HubSparkline variant="up" />}
          cta="Se trender →"
        />
        <HubCard
          href="/portal/mal/sg-hub"
          icon={TrendingUp}
          eyebrow="02 · NØKKELTALL"
          title="Strokes Gained"
          data="+1.2 siste runde"
          sub="Tee +0.4 · Approach +0.7 · Putt +0.1"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              +1.2 SG
            </HubPill>
          }
          cta="Detalj-analyse →"
        />
        <HubCard
          href="/portal/mal/runder"
          icon={Flag}
          eyebrow="03 · RUNDER"
          title="Runder"
          data="47 totalt"
          sub="12 denne mnd · 4 par-eller-bedre"
          cta="Bla →"
        />
        <HubCard
          href="/portal/mal/trackman"
          icon={Radio}
          eyebrow="04 · ØVELSE"
          title="TrackMan"
          data="23 sesjoner"
          sub="Siste: 19. mai · driver-spin -180 rpm"
          cta="Åpne →"
        />
        <HubCard
          href="/portal/tren/tester"
          icon={ClipboardCheck}
          eyebrow="05 · MÅLINGER"
          title="Tester"
          data="12/36 gjennomført"
          sub="CMJ · Squat · Wedge 50m · 5-iron carry"
          visual={<HubProgress done={12} total={36} tone="ok" />}
          cta="Se tester →"
        />
        <HubCard
          icon={Sparkles}
          eyebrow="06 · AI-CADDIE"
          title="AI-Innsikt"
          data="3 nye anbefalinger"
          sub="Approach 100-150m · putt 4-8 fot · driver-tempo"
          statusPill={<HubPill kind="accent">3 NYE</HubPill>}
          tone="accent"
          cta="Les anbefalinger →"
        />
        <HubCard
          href="/portal/mal/baner"
          icon={Map}
          eyebrow="07 · GEOGRAFI"
          title="Baner"
          data="Top 5 spilte"
          sub="GFGK · Bjaavann · Hellerudsletta · Losby · Oslo GK"
          cta="Se kartlag →"
        />
        <HubCard
          href="/portal/mal/leaderboard"
          icon={Trophy}
          eyebrow="08 · POSISJON"
          title="Leaderboard"
          data="Din rank: 14 / 87"
          sub="+3 siden forrige uke · A1-klassen"
          statusPill={<HubPill kind="forest">#14</HubPill>}
          cta="Se ranking →"
        />
      </section>
    </HubFrame>
  );
}
