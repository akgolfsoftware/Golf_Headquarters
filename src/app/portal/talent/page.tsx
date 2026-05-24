/**
 * /portal/talent — PlayerHQ Talent hub
 * Design: matches HubFrame-pattern fra Manglende hubs.html
 * Innhold per plan Del 3
 */

import {
  Compass,
  Download,
  Map,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Users,
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

export default async function TalentPage() {
  await requirePortalUser();

  return (
    <HubFrame>
      <HubHeader
        eyebrow="PLAYERHQ · TALENT"
        title="Din vei mot"
        titleItalic="toppen."
        sub="Mitt nivå, karriere-roadmap, sammenligning og leaderboard."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Download size={13} strokeWidth={1.75} aria-hidden /> Eksporter
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Target size={13} strokeWidth={2} aria-hidden /> Sett mål
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>A1</strong> · nivå
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>+3</strong> rang siden forrige uke
            </span>
            <HubStatSep />
            <span>
              <strong>14</strong> av 87 i A1
            </span>
            <HubStatSep />
            <span>
              <strong>2,4 år</strong> til neste nivå (anslag)
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/portal/talent/mitt-niva"
          icon={Compass}
          eyebrow="01 · NÅVÆRENDE"
          title="Mitt nivå"
          data="A1"
          sub="Pro-nivå · HCP -- · SG +1.2 siste runde"
          statusPill={<HubPill kind="forest">A1</HubPill>}
          cta="Se profil →"
        />
        <HubCard
          href="/portal/talent/min-plan"
          icon={Target}
          eyebrow="02 · UTVIKLING"
          title="Min plan"
          data="Spesialisering · Vår 2026"
          sub="3 fokus-områder · 12 milepæler · 4 nådd"
          visual={<HubProgress done={4} total={12} tone="ok" />}
          cta="Åpne plan →"
        />
        <HubCard
          href="/portal/talent/roadmap"
          icon={Map}
          eyebrow="03 · KARRIERE"
          title="Roadmap"
          data="A1 → Pro Tour"
          sub="2026: A1 · 2027: A → Tour · 2028: Q-school"
          visual={<HubSparkline variant="up" />}
          cta="Se vei →"
        />
        <HubCard
          href="/portal/talent/sammenligning"
          icon={Users}
          eyebrow="04 · BENCHMARK"
          title="Sammenligning"
          data="vs A1-kohort (87)"
          sub="SG +0.4 over snitt · driver +12m · putt -0.3"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              ABOVE
            </HubPill>
          }
          cta="Detalj →"
        />
        <HubCard
          href="/portal/mal/leaderboard"
          icon={Trophy}
          eyebrow="05 · RANKING"
          title="Leaderboard"
          data="#14 av 87"
          sub="+3 siden forrige uke · A1-klassen"
          statusPill={
            <HubPill kind="accent" dot="d-pulse">
              +3
            </HubPill>
          }
          cta="Se ranking →"
        />
        <HubCard
          icon={Sparkles}
          eyebrow="06 · INNSIKT"
          title="AI-vurdering"
          data="Sterk på approach"
          sub="Forbedring: putt 4-8 fot · driver-spin"
          tone="accent"
          cta="Les rapport →"
        />
        <HubCard
          href="/portal/statistikk"
          icon={TrendingUp}
          eyebrow="07 · TREND"
          title="Utvikling siste 90d"
          data="Stigende"
          sub="HCP -1.2 · SG +0.6 · runde-snitt -2,1"
          visual={<HubSparkline variant="up" />}
          cta="Se historikk →"
        />
      </section>
    </HubFrame>
  );
}
