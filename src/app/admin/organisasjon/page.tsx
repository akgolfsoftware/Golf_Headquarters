/**
 * /admin/organisasjon — AgencyOS Admin hub
 * Design: hubs-coach.jsx (CoachAdmin)
 */

import {
  Bot,
  Building,
  Mail,
  Plug,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
  TeamStrip,
  IntStrip,
} from "@/components/hubs";
import { InnstillingerButton } from "./organisasjon-actions";

export const dynamic = "force-dynamic";

export default async function OrganisasjonPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Ekte tall fra DB — coach/admin-antall og antall e-postmaler.
  const [coacherCount, adminCount, malerCount] = await Promise.all([
    prisma.user.count({ where: { role: "COACH" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.emailTemplate.count(),
  ]);
  const teamData = `${coacherCount} coacher · ${adminCount} admin`;

  return (
    <HubFrame>
      <HubHeader
        eyebrow="AGENCYOS · HEAD COACH"
        title="Organisasjon"
        sub="Klubb, team, integrasjoner og innstillinger."
        actions={
          <InnstillingerButton />
        }
        stats={
          <>
            <span>
              <strong>Gamle Fredrikstad GK</strong>
            </span>
            <HubStatSep />
            <span>
              <strong>{coacherCount}</strong> coacher · <strong>{adminCount}</strong> admin
            </span>
            <HubStatSep />
            <span>
              <strong>6</strong> integrasjoner
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>Audit ren</strong>
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/klubb/innstillinger"
          icon={Building}
          eyebrow="01 · IDENTITET"
          title="Klubb-info"
          data="Gamle Fredrikstad GK"
          sub="Org.nr 992 884 — Plassen 1, 1632"
          cta="Rediger →"
        />
        <HubCard
          href="/admin/team"
          icon={Users}
          eyebrow="02 · TEAM"
          title="Team"
          data={teamData}
          sub="AK · MWA · TLO · JBR · 2 admin-roller"
          visual={
            <TeamStrip
              avatars={[
                { n: "AK", c: "c2" },
                { n: "MW", c: "c3" },
                { n: "TL", c: "c5" },
                { n: "JB", c: "c1" },
                { n: "IS", c: "c6" },
                { n: "+1", c: "c8" },
              ]}
            />
          }
          cta="Administrer →"
        />
        <HubCard
          href="/admin/integrasjoner"
          icon={Plug}
          eyebrow="03 · KOBLINGER"
          title="Integrasjoner"
          data="6 koblet · 1 ikke"
          sub="Notion ikke koblet · re-auth nødvendig"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              NOTION OFF
            </HubPill>
          }
          visual={
            <IntStrip
              pills={[
                { name: "Stripe", on: true },
                { name: "TrackMan", on: true },
                { name: "WAGR", on: true },
                { name: "Google Cal", on: true },
                { name: "Slack", on: true },
                { name: "Notion", on: false },
              ]}
            />
          }
          cta="Koble →"
        />
        <HubCard
          href="/admin/settings"
          icon={Settings}
          eyebrow="04 · KONFIG"
          title="Innstillinger"
          data="Sist endret 22. mai"
          sub="Varsler · Personvern · Språk · Branding"
          cta="Åpne →"
        />
        <HubCard
          href="/admin/agents"
          icon={Bot}
          eyebrow="05 · AGENTER"
          title="AI-agenter"
          data="3 aktive"
          sub="Caddie · Plan-bygger · Drill-foreslår"
          statusPill={
            <HubPill kind="accent" dot="d-pulse">
              3 LIVE
            </HubPill>
          }
          cta="Konfigurer →"
        />
        <HubCard
          href="/admin/email-templates"
          icon={Mail}
          eyebrow="06 · MAL"
          title="E-postmaler"
          data={`${malerCount} ${malerCount === 1 ? "mal" : "maler"}`}
          sub="Velkomst · Faktura · Booking · Reminder"
          cta="Bla →"
        />
        <HubCard
          href="/admin/audit-log"
          icon={Shield}
          eyebrow="07 · SIKKERHET"
          title="Audit-log"
          data="Siste hendelse 04:12"
          sub="24. mai · API-key rotert (auto)"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              REN
            </HubPill>
          }
          cta="Se aktivitet →"
        />
        <HubCard
          href="/admin/profile"
          icon={User}
          eyebrow="08 · MEG"
          title="Min profil"
          data="Anders K. · Head Coach"
          sub="Tilgjengelig · pro@akgolf.no"
          statusPill={<HubPill kind="tier">HEAD</HubPill>}
          cta="Rediger →"
        />
      </section>
    </HubFrame>
  );
}
