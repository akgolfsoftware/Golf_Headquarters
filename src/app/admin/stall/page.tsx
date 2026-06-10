/**
 * /admin/stall — AgencyOS Stall hub
 * Design: matches HubFrame-pattern fra Manglende hubs.html
 * Innhold per plan Del 3 — utvider hub-suite til 10 toppnivå-sider
 */

import {
  BarChart3,
  Compass,
  Download,
  GraduationCap,
  Plus,
  Radar,
  Users,
  UserPlus,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
  TeamStrip,
  HubSparkline,
} from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function StallPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <HubFrame>
      <HubHeader
        eyebrow="COACHHQ · COACH"
        title="Min"
        titleItalic="stall"
        sub="Alle spillere, grupper, talent-radar og kohort-sammenligning."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <Download size={13} strokeWidth={1.75} aria-hidden /> Eksporter
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Plus size={13} strokeWidth={2} aria-hidden /> Ny spiller
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>38</strong> spillere
            </span>
            <HubStatSep />
            <span>
              <strong>5</strong> grupper
            </span>
            <HubStatSep />
            <span>
              <strong>9</strong> A-nivå · <strong>14</strong> B-nivå
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>+3</strong> nye denne mnd
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/spillere"
          icon={Users}
          eyebrow="01 · ROSTER"
          title="Alle spillere"
          data="38 spillere"
          sub="32 aktive · 6 pause · 23 m/PRO"
          visual={
            <TeamStrip
              avatars={[
                { n: "AK", c: "c2" },
                { n: "MS", c: "c3" },
                { n: "JE", c: "c5" },
                { n: "IL", c: "c1" },
                { n: "SH", c: "c6" },
                { n: "+33", c: "c8" },
              ]}
            />
          }
          cta="Se alle →"
        />
        <HubCard
          href="/admin/grupper"
          icon={GraduationCap}
          eyebrow="02 · INNDELING"
          title="Grupper"
          data="5 grupper"
          sub="GFGK A1 · GFGK B1 · Junior · Toppidrett · Pro"
          cta="Administrer →"
        />
        <HubCard
          href="/admin/talent/radar"
          icon={Radar}
          eyebrow="03 · TALENT"
          title="Talent-radar"
          data="9 spillere på radaren"
          sub="3 A-nivå · 4 B-nivå · 2 prospekter"
          statusPill={
            <HubPill kind="accent" dot="d-pulse">
              3 OPP
            </HubPill>
          }
          cta="Åpne radar →"
        />
        <HubCard
          href="/admin/talent/discovery"
          icon={Compass}
          eyebrow="04 · NYE PROSPEKTER"
          title="Discovery"
          data="6 prospekter"
          sub="Sist scannet 24. mai · WAGR + DataGolf"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              +2 NYE
            </HubPill>
          }
          cta="Bla →"
        />
        <HubCard
          href="/admin/lag-snitt"
          icon={BarChart3}
          eyebrow="05 · SAMMENLIGNING"
          title="Lag-snitt"
          data="Q2 2026 · 5 grupper"
          sub="Pyramide-snitt + benchmark vs A1/B1"
          visual={<HubSparkline variant="up" />}
          cta="Se trender →"
        />
        <HubCard
          href="/admin/talent/wagr-import"
          icon={UserPlus}
          eyebrow="06 · EKSTERN DATA"
          title="WAGR-import"
          data="Sist 23. mai · 87 hits"
          sub="A1-klassen · 14 norske spillere matchet"
          cta="Kjør ny import →"
        />
      </section>
    </HubFrame>
  );
}
